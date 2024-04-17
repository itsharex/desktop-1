use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::skill_resource_api::skill_resource_api_client::SkillResourceApiClient;
use proto_gen_rust::skill_resource_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};


#[tauri::command]
async fn list<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListRequest,
) -> Result<ListResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillResourceApiClient::new(chan.unwrap());
    match client.list(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct SkillResourceApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> SkillResourceApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
               list,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for SkillResourceApiPlugin<R> {
    fn name(&self) -> &'static str {
        "skill_resource_api"
    }
    fn initialization_script(&self) -> Option<String> {
        None
    }

    fn initialize(&mut self, _app: &AppHandle<R>, _config: serde_json::Value) -> PluginResult<()> {
        Ok(())
    }

    fn created(&mut self, _window: Window<R>) {}

    fn on_page_load(&mut self, _window: Window<R>, _payload: PageLoadPayload) {}

    fn extend_api(&mut self, message: Invoke<R>) {
        (self.invoke_handler)(message)
    }
}