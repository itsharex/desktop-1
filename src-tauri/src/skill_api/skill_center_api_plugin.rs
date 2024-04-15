use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::skill_center_api::skill_center_api_client::SkillCenterApiClient;
use proto_gen_rust::skill_center_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn list_skill_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListSkillCateRequest,
) -> Result<ListSkillCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterApiClient::new(chan.unwrap());
    match client.list_skill_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_skill_cate_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_skill_cate".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_skill_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetSkillCateRequest,
) -> Result<GetSkillCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterApiClient::new(chan.unwrap());
    match client.get_skill_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_skill_cate_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_skill_cate".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_skill_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListSkillFolderRequest,
) -> Result<ListSkillFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterApiClient::new(chan.unwrap());
    match client.list_skill_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_skill_folder_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_skill_folder".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_skill_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetSkillFolderRequest,
) -> Result<GetSkillFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterApiClient::new(chan.unwrap());
    match client.get_skill_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_skill_folder_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_skill_folder".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_folder_path<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetFolderPathRequest,
) -> Result<GetFolderPathResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterApiClient::new(chan.unwrap());
    match client.get_folder_path(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_folder_path_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_folder_path".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_skill_point<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListSkillPointRequest,
) -> Result<ListSkillPointResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterApiClient::new(chan.unwrap());
    match client.list_skill_point(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_skill_point_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_skill_point".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_skill_point<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetSkillPointRequest,
) -> Result<GetSkillPointResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterApiClient::new(chan.unwrap());
    match client.get_skill_point(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_skill_point_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_skill_point".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct SkillCenterApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> SkillCenterApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                list_skill_cate,
                get_skill_cate,
                list_skill_folder,
                get_skill_folder,
                get_folder_path,
                list_skill_point,
                get_skill_point,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for SkillCenterApiPlugin<R> {
    fn name(&self) -> &'static str {
        "skill_center_api"
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