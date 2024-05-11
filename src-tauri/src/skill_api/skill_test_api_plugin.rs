//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::skill_test_api::skill_test_api_client::SkillTestApiClient;
use proto_gen_rust::skill_test_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn list_question<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListQuestionRequest,
) -> Result<ListQuestionResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillTestApiClient::new(chan.unwrap());
    match client.list_question(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_question_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_question".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_question<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetQuestionRequest,
) -> Result<GetQuestionResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillTestApiClient::new(chan.unwrap());
    match client.get_question(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_question_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_question".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct SkillTestApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> SkillTestApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                list_question,
                get_question,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for SkillTestApiPlugin<R> {
    fn name(&self) -> &'static str {
        "skill_test_api"
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