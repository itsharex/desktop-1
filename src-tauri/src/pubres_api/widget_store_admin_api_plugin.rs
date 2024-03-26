use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::widget_store_api::widget_store_admin_api_client::WidgetStoreAdminApiClient;
use proto_gen_rust::widget_store_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn add_widget<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminAddWidgetRequest,
) -> Result<AdminAddWidgetResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = WidgetStoreAdminApiClient::new(chan.unwrap());
    match client.add_widget(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_add_widget_response::Code::WrongSession as i32
                || inner_resp.code == admin_add_widget_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("add_widget".into()))
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
async fn update_widget<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateWidgetRequest,
) -> Result<AdminUpdateWidgetResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = WidgetStoreAdminApiClient::new(chan.unwrap());
    match client.update_widget(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_widget_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_widget_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_widget".into()))
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
async fn update_icon_file<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateIconFileRequest,
) -> Result<AdminUpdateIconFileResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = WidgetStoreAdminApiClient::new(chan.unwrap());
    match client.update_icon_file(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_icon_file_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_icon_file_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("update_icon_file".into()),
                ) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_file<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateFileRequest,
) -> Result<AdminUpdateFileResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = WidgetStoreAdminApiClient::new(chan.unwrap());
    match client.update_file(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_file_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_file_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_file".into()))
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
async fn remove_widget<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveWidgetRequest,
) -> Result<AdminRemoveWidgetResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = WidgetStoreAdminApiClient::new(chan.unwrap());
    match client.remove_widget(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_widget_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_widget_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_widget".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct WidgetStoreAdminApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> WidgetStoreAdminApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                add_widget,
                update_widget,
                update_icon_file,
                update_file,
                remove_widget,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for WidgetStoreAdminApiPlugin<R> {
    fn name(&self) -> &'static str {
        "widget_store_admin_api"
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
