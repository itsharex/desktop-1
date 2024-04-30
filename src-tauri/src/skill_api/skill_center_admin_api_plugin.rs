//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::skill_center_api::skill_center_admin_api_client::SkillCenterAdminApiClient;
use proto_gen_rust::skill_center_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};


#[tauri::command]
async fn create_skill_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminCreateSkillCateRequest,
) -> Result<AdminCreateSkillCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.create_skill_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_create_skill_cate_response::Code::WrongSession as i32
                || inner_resp.code == admin_create_skill_cate_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_skill_cate".into()))
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
async fn update_skill_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateSkillCateRequest,
) -> Result<AdminUpdateSkillCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.update_skill_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_skill_cate_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_skill_cate_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_skill_cate".into()))
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
async fn remove_skill_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveSkillCateRequest,
) -> Result<AdminRemoveSkillCateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.remove_skill_cate(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_skill_cate_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_skill_cate_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_skill_cate".into()))
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
async fn create_skill_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminCreateSkillFolderRequest,
) -> Result<AdminCreateSkillFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.create_skill_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_create_skill_folder_response::Code::WrongSession as i32
                || inner_resp.code == admin_create_skill_folder_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_skill_folder".into()))
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
async fn update_skill_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateSkillFolderRequest,
) -> Result<AdminUpdateSkillFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.update_skill_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_skill_folder_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_skill_folder_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_skill_folder".into()))
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
async fn remove_skill_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveSkillFolderRequest,
) -> Result<AdminRemoveSkillFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.remove_skill_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_skill_folder_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_skill_folder_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_skill_folder".into()))
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
async fn move_skill_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminMoveSkillFolderRequest,
) -> Result<AdminMoveSkillFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.move_skill_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_move_skill_folder_response::Code::WrongSession as i32
                || inner_resp.code == admin_move_skill_folder_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("move_skill_folder".into()))
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
async fn create_skill_point<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminCreateSkillPointRequest,
) -> Result<AdminCreateSkillPointResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.create_skill_point(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_create_skill_point_response::Code::WrongSession as i32
                || inner_resp.code == admin_create_skill_point_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_skill_point".into()))
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
async fn update_skill_point<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateSkillPointRequest,
) -> Result<AdminUpdateSkillPointResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.update_skill_point(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_skill_point_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_skill_point_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_skill_point".into()))
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
async fn remove_skill_point<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveSkillPointRequest,
) -> Result<AdminRemoveSkillPointResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.remove_skill_point(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_skill_point_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_skill_point_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_skill_point".into()))
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
async fn move_skill_point<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminMoveSkillPointRequest,
) -> Result<AdminMoveSkillPointResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillCenterAdminApiClient::new(chan.unwrap());
    match client.move_skill_point(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_move_skill_point_response::Code::WrongSession as i32
                || inner_resp.code == admin_move_skill_point_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit("notice", new_wrong_session_notice("move_skill_point".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct SkillCenterAdminApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> SkillCenterAdminApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_skill_cate,
                update_skill_cate,
                remove_skill_cate,
                create_skill_folder,
                update_skill_folder,
                remove_skill_folder,
                move_skill_folder,
                create_skill_point,
                update_skill_point,
                remove_skill_point,
                move_skill_point,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for SkillCenterAdminApiPlugin<R> {
    fn name(&self) -> &'static str {
        "skill_center_admin_api"
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