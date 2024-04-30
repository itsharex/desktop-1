//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use proto_gen_rust::sw_store_api::sw_store_api_client::SwStoreApiClient;
use proto_gen_rust::sw_store_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

use crate::client_cfg_api_plugin::get_global_server_addr;

#[tauri::command]
async fn list_cate<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListCateRequest,
) -> Result<ListCateResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = SwStoreApiClient::new(chan.unwrap());
    match client.list_cate(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_soft_ware<R: Runtime>(
    app_handle: AppHandle<R>,
    request: ListSoftWareRequest,
) -> Result<ListSoftWareResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = SwStoreApiClient::new(chan.unwrap());
    match client.list_soft_ware(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_soft_ware<R: Runtime>(
    app_handle: AppHandle<R>,
    request: GetSoftWareRequest,
) -> Result<GetSoftWareResponse, String> {
    let serv_addr = get_global_server_addr(app_handle).await;
    let chan = crate::conn_extern_server(serv_addr).await;
    if chan.is_err() {
        return Err(chan.err().unwrap());
    }
    let mut client = SwStoreApiClient::new(chan.unwrap());
    match client.get_soft_ware(request).await {
        Ok(response) => {
            return Ok(response.into_inner());
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct SwStoreApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> SwStoreApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                list_cate,
                list_soft_ware,
                get_soft_ware,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for SwStoreApiPlugin<R> {
    fn name(&self) -> &'static str {
        "sw_store_api"
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
