use proto_gen_rust::idea_store_api::idea_store_api_client::IdeaStoreApiClient;
use proto_gen_rust::idea_store_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn list_store_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListStoreCateRequest,
) -> Result<ListStoreCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreApiClient::new(chan.unwrap());
    match client.list_store_cate(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_store<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListStoreRequest,
) -> Result<ListStoreResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreApiClient::new(chan.unwrap());
    match client.list_store(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct IdeaStoreApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> IdeaStoreApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![list_store_cate, list_store,]),
        }
    }
}

impl<R: Runtime> Plugin<R> for IdeaStoreApiPlugin<R> {
    fn name(&self) -> &'static str {
        "idea_store_api"
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
