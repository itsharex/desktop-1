use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::idea_store_api::idea_store_admin_api_client::IdeaStoreAdminApiClient;
use proto_gen_rust::idea_store_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create_store_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminCreateStoreCateRequest,
) -> Result<AdminCreateStoreCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.create_store_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_create_store_cate_response::Code::WrongSession as i32
                || inner_resp.code == admin_create_store_cate_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_store_cate".into()))
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
async fn update_store_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateStoreCateRequest,
) -> Result<AdminUpdateStoreCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.update_store_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_store_cate_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_store_cate_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("xx".into()))
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
async fn remove_store_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveStoreCateRequest,
) -> Result<AdminRemoveStoreCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.remove_store_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_store_cate_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_store_cate_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_store_cate".into()))
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
async fn create_store<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminCreateStoreRequest,
) -> Result<AdminCreateStoreResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.create_store(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_create_store_response::Code::WrongSession as i32
                || inner_resp.code == admin_create_store_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_store".into()))
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
async fn update_store<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateStoreRequest,
) -> Result<AdminUpdateStoreResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.update_store(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_store_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_store_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_store".into()))
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
async fn move_store<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminMoveStoreRequest,
) -> Result<AdminMoveStoreResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.move_store(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_move_store_response::Code::WrongSession as i32
                || inner_resp.code == admin_move_store_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("move_store".into()))
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
async fn remove_store<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveStoreRequest,
) -> Result<AdminRemoveStoreResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.remove_store(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_store_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_store_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_store".into()))
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
async fn create_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminCreateIdeaRequest,
) -> Result<AdminCreateIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.create_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_create_idea_response::Code::WrongSession as i32
                || inner_resp.code == admin_create_idea_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_idea".into()))
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
async fn update_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateIdeaRequest,
) -> Result<AdminUpdateIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.update_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_idea_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_idea_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_idea".into()))
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
async fn move_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminMoveIdeaRequest,
) -> Result<AdminMoveIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.move_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_move_idea_response::Code::WrongSession as i32
                || inner_resp.code == admin_move_idea_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("move_idea".into()))
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
async fn remove_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveIdeaRequest,
) -> Result<AdminRemoveIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.remove_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_idea_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_idea_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_idea".into()))
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
async fn list_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminListIdeaRequest,
) -> Result<AdminListIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.list_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_list_idea_response::Code::WrongSession as i32
                || inner_resp.code == admin_list_idea_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_idea".into()))
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
async fn get_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminGetIdeaRequest,
) -> Result<AdminGetIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = IdeaStoreAdminApiClient::new(chan.unwrap());
    match client.get_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_get_idea_response::Code::WrongSession as i32
                || inner_resp.code == admin_get_idea_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_idea".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct IdeaStoreAdminApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> IdeaStoreAdminApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_store_cate,
                update_store_cate,
                remove_store_cate,
                create_store,
                update_store,
                move_store,
                remove_store,
                create_idea,
                update_idea,
                move_idea,
                remove_idea,
                list_idea,
                get_idea,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for IdeaStoreAdminApiPlugin<R> {
    fn name(&self) -> &'static str {
        "idea_store_admin_api"
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