//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use proto_gen_rust::idea_store_api::idea_store_api_client::IdeaStoreApiClient;
use proto_gen_rust::idea_store_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

use crate::client_cfg_api_plugin::get_global_server_addr;

#[tauri::command]
async fn list_store_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListStoreCateRequest,
) -> Result<ListStoreCateResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
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
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = IdeaStoreApiClient::new(chan.unwrap());
    match client.list_store(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListIdeaRequest,
) -> Result<ListIdeaResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = IdeaStoreApiClient::new(chan.unwrap());
    match client.list_idea(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_idea_by_id<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListIdeaByIdRequest,
) -> Result<ListIdeaByIdResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = IdeaStoreApiClient::new(chan.unwrap());
    match client.list_idea_by_id(request).await {
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
            invoke_handler: Box::new(tauri::generate_handler![
                list_store_cate, 
                list_store,
                list_idea,
                list_idea_by_id,
                ]),
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
