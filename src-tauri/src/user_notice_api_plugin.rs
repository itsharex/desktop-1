use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::user_notice_api::user_notice_api_client::UserNoticeApiClient;
use proto_gen_rust::user_notice_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn get_status<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetStatusRequest,
) -> Result<GetStatusResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserNoticeApiClient::new(chan.unwrap());
    match client.get_status(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_status_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_status".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_notice<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListNoticeRequest,
) -> Result<ListNoticeResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserNoticeApiClient::new(chan.unwrap());
    match client.list_notice(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_notice_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_notice".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_notice<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetNoticeRequest,
) -> Result<GetNoticeResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserNoticeApiClient::new(chan.unwrap());
    match client.get_notice(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_notice_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_notice".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_notice<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveNoticeRequest,
) -> Result<RemoveNoticeResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserNoticeApiClient::new(chan.unwrap());
    match client.remove_notice(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_notice_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_notice".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn mark_has_read<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: MarkHasReadRequest,
) -> Result<MarkHasReadResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = UserNoticeApiClient::new(chan.unwrap());
    match client.mark_has_read(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == mark_has_read_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("mark_has_read".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct UserNoticeApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> UserNoticeApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                get_status,
                list_notice,
                get_notice,
                remove_notice,
                mark_has_read,

            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for UserNoticeApiPlugin<R> {
    fn name(&self) -> &'static str {
        "user_notice_api"
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