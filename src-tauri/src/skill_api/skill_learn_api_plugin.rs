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
async fn list_learn_record<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListLearnRecordRequest,
) -> Result<ListLearnRecordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.list_learn_record(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_learn_record_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_learn_record".into())) {
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
async fn vote<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: VoteRequest,
) -> Result<VoteResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.vote(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == vote_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("vote".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn cancel_vote<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CancelVoteRequest,
) -> Result<CancelVoteResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = SkillLearnApiClient::new(chan.unwrap());
    match client.cancel_vote(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == cancel_vote_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("cancel_vote".into())) {
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
                list_learn_record,
                get_my_skill_state,
                list_my_learn_record,
                vote,
                cancel_vote,
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