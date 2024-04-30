//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::skill_learn_api::skill_learn_api_client::SkillLearnApiClient;
use proto_gen_rust::skill_learn_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};


#[tauri::command]
async fn add_learn_record<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AddLearnRecordRequest,
) -> Result<AddLearnRecordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.add_learn_record(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == add_learn_record_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("add_learn_record".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_learn_record<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateLearnRecordRequest,
) -> Result<UpdateLearnRecordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.update_learn_record(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_learn_record_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_learn_record".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_learn_record<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveLearnRecordRequest,
) -> Result<RemoveLearnRecordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.remove_learn_record(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_learn_record_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_learn_record".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_learn_record_in_org<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListLearnRecordInOrgRequest,
) -> Result<ListLearnRecordInOrgResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.list_learn_record_in_org(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_learn_record_in_org_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_learn_record_in_org".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}


#[tauri::command]
async fn get_my_skill_state<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetMySkillStateRequest,
) -> Result<GetMySkillStateResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.get_my_skill_state(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_my_skill_state_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_my_skill_state".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_my_learn_record<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListMyLearnRecordRequest,
) -> Result<ListMyLearnRecordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.list_my_learn_record(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_my_learn_record_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_my_learn_record".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_my_learn_record<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetMyLearnRecordRequest,
) -> Result<GetMyLearnRecordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.get_my_learn_record(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_my_learn_record_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_my_learn_record".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_my_learn_summary<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetMyLearnSummaryRequest,
) -> Result<GetMyLearnSummaryResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.get_my_learn_summary(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_my_learn_summary_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_my_learn_summary".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_learn_summary_in_project<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetLearnSummaryInProjectRequest,
) -> Result<GetLearnSummaryInProjectResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.get_learn_summary_in_project(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_learn_summary_in_project_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_learn_summary_in_project".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_learn_summary_in_org<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetLearnSummaryInOrgRequest,
) -> Result<GetLearnSummaryInOrgResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.get_learn_summary_in_org(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_learn_summary_in_org_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_learn_summary_in_org".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct SkillLearnApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> SkillLearnApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                add_learn_record,
                update_learn_record,
                remove_learn_record,
                list_learn_record_in_org,
                get_my_skill_state,
                list_my_learn_record,
                get_my_learn_record,
                get_my_learn_summary,
                get_learn_summary_in_project,
                get_learn_summary_in_org,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for SkillLearnApiPlugin<R> {
    fn name(&self) -> &'static str {
        "skill_learn_api"
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