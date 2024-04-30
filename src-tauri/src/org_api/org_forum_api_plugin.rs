//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::org_forum_api::org_forum_api_client::OrgForumApiClient;
use proto_gen_rust::org_forum_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create_forum<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateForumRequest,
) -> Result<CreateForumResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.create_forum(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_forum_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_forum".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_forum<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateForumRequest,
) -> Result<UpdateForumResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.update_forum(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_forum_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_forum".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_forum<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListForumRequest,
) -> Result<ListForumResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.list_forum(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_forum_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_forum".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_forum<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetForumRequest,
) -> Result<GetForumResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.get_forum(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_forum_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_forum".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_forum<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveForumRequest,
) -> Result<RemoveForumResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.remove_forum(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_forum_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_forum".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn create_thread<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateThreadRequest,
) -> Result<CreateThreadResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.create_thread(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_thread_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_thread".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_thread<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateThreadRequest,
) -> Result<UpdateThreadResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.update_thread(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_thread_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_thread".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn set_thread_weight<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: SetThreadWeightRequest,
) -> Result<SetThreadWeightResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.set_thread_weight(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == set_thread_weight_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("set_thread_weight".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_thread<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListThreadRequest,
) -> Result<ListThreadResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.list_thread(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_thread_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_thread".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_thread<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetThreadRequest,
) -> Result<GetThreadResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.get_thread(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_thread_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_thread".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_thread<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveThreadRequest,
) -> Result<RemoveThreadResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.remove_thread(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_thread_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_thread".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn create_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateContentRequest,
) -> Result<CreateContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.create_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_content".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateContentRequest,
) -> Result<UpdateContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.update_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_content".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListContentRequest,
) -> Result<ListContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.list_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_content".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_content_by_id<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListContentByIdRequest,
) -> Result<ListContentByIdResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.list_content_by_id(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_content_by_id_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_content_by_id".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetContentRequest,
) -> Result<GetContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.get_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_content".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveContentRequest,
) -> Result<RemoveContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.remove_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_content".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_user_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListUserContentRequest,
) -> Result<ListUserContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgForumApiClient::new(chan.unwrap());
    match client.list_user_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_user_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_user_content".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct OrgForumApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> OrgForumApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_forum,
                update_forum,
                list_forum,
                get_forum,
                remove_forum,
                create_thread,
                update_thread,
                set_thread_weight,
                list_thread,
                get_thread,
                remove_thread,
                create_content,
                update_content,
                list_content,
                list_content_by_id,
                get_content,
                remove_content,
                list_user_content,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for OrgForumApiPlugin<R> {
    fn name(&self) -> &'static str {
        "org_forum_api"
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