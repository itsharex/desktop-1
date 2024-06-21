//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use proto_gen_rust::git_vp_api::git_vp_api_client::GitVpApiClient;
use proto_gen_rust::git_vp_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

use crate::client_cfg_api_plugin::get_global_server_addr;

#[tauri::command]
async fn list_git_vp_source<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListGitVpSourceRequest,
) -> Result<ListGitVpSourceResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = GitVpApiClient::new(chan.unwrap());
    match client.list_git_vp_source(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_git_vp<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListGitVpRequest,
) -> Result<ListGitVpResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = GitVpApiClient::new(chan.unwrap());
    match client.list_git_vp(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct GitVpApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> GitVpApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![list_git_vp_source, list_git_vp]),
        }
    }
}

impl<R: Runtime> Plugin<R> for GitVpApiPlugin<R> {
    fn name(&self) -> &'static str {
        "git_vp_api"
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
