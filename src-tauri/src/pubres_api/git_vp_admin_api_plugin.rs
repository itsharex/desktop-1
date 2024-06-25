//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::git_vp_api::git_vp_admin_api_client::GitVpAdminApiClient;
use proto_gen_rust::git_vp_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn get_secret<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminGetSecretRequest,
) -> Result<AdminGetSecretResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = GitVpAdminApiClient::new(chan.unwrap());
    match client.get_secret(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_get_secret_response::Code::WrongSession as i32
                || inner_resp.code == admin_get_secret_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_secret".into()))
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
async fn renew_secret<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRenewSecretRequest,
) -> Result<AdminRenewSecretResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = GitVpAdminApiClient::new(chan.unwrap());
    match client.renew_secret(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_renew_secret_response::Code::WrongSession as i32
                || inner_resp.code == admin_renew_secret_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("renew_secret".into()))
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
async fn add_git_vp_source<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminAddGitVpSourceRequest,
) -> Result<AdminAddGitVpSourceResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = GitVpAdminApiClient::new(chan.unwrap());
    match client.add_git_vp_source(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_add_git_vp_source_response::Code::WrongSession as i32
                || inner_resp.code == admin_add_git_vp_source_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("add_git_vp_source".into()),
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
async fn update_git_vp_source<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminUpdateGitVpSourceRequest,
) -> Result<AdminUpdateGitVpSourceResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = GitVpAdminApiClient::new(chan.unwrap());
    match client.update_git_vp_source(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_update_git_vp_source_response::Code::WrongSession as i32
                || inner_resp.code == admin_update_git_vp_source_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("update_git_vp_source".into()),
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
async fn remove_git_vp_source<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveGitVpSourceRequest,
) -> Result<AdminRemoveGitVpSourceResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = GitVpAdminApiClient::new(chan.unwrap());
    match client.remove_git_vp_source(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_git_vp_source_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_git_vp_source_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("remove_git_vp_source".into()),
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
async fn remove_git_vp<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AdminRemoveGitVpRequest,
) -> Result<AdminRemoveGitVpResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = GitVpAdminApiClient::new(chan.unwrap());
    match client.remove_git_vp(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == admin_remove_git_vp_response::Code::WrongSession as i32
                || inner_resp.code == admin_remove_git_vp_response::Code::NotAuth as i32
            {
                crate::admin_auth_api_plugin::logout(app_handle).await;
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_git_vp".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct GitVpAdminApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> GitVpAdminApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                get_secret,
                renew_secret,
                add_git_vp_source,
                update_git_vp_source,
                remove_git_vp_source,
                remove_git_vp,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for GitVpAdminApiPlugin<R> {
    fn name(&self) -> &'static str {
        "git_vp_admin_api"
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
