use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::project_idea_api::project_idea_api_client::ProjectIdeaApiClient;
use proto_gen_rust::project_idea_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create_group<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateGroupRequest,
) -> Result<CreateGroupResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.create_group(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_group_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_group".into()))
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
async fn update_group<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateGroupRequest,
) -> Result<UpdateGroupResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.update_group(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_group_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_group".into()))
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
async fn list_group<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListGroupRequest,
) -> Result<ListGroupResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.list_group(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_group_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_group".into()))
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
async fn get_group<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetGroupRequest,
) -> Result<GetGroupResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.get_group(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_group_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_group".into()))
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
async fn remove_group<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveGroupRequest,
) -> Result<RemoveGroupResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.remove_group(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_group_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_group".into()))
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
async fn clear_group<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ClearGroupRequest,
) -> Result<ClearGroupResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.clear_group(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == clear_group_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("clear_group".into()))
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
async fn create_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateIdeaRequest,
) -> Result<CreateIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.create_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_idea_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_idea".into()))
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
async fn update_idea_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateIdeaContentRequest,
) -> Result<UpdateIdeaContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.update_idea_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_idea_content_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("update_idea_content".into()),
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
async fn update_idea_keyword<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateIdeaKeywordRequest,
) -> Result<UpdateIdeaKeywordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.update_idea_keyword(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_idea_keyword_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("update_idea_keyword".into()),
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
async fn update_idea_perm<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateIdeaPermRequest,
) -> Result<UpdateIdeaPermResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.update_idea_perm(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_idea_perm_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("update_idea_perm".into()),
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
async fn get_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetIdeaRequest,
) -> Result<GetIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.get_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_idea_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_idea".into()))
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
async fn list_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListIdeaRequest,
) -> Result<ListIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.list_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_idea_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_idea".into()))
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
async fn remove_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveIdeaRequest,
) -> Result<RemoveIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.remove_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_idea_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_idea".into()))
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
async fn list_all_keyword<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListAllKeywordRequest,
) -> Result<ListAllKeywordResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.list_all_keyword(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_all_keyword_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit(
                    "notice",
                    new_wrong_session_notice("list_all_keyword".into()),
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
async fn move_idea<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: MoveIdeaRequest,
) -> Result<MoveIdeaResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.move_idea(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == move_idea_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("move_idea".into()))
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
async fn set_appraise<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: SetAppraiseRequest,
) -> Result<SetAppraiseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.set_appraise(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == set_appraise_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("set_appraise".into()))
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
async fn cancel_appraise<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CancelAppraiseRequest,
) -> Result<CancelAppraiseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.cancel_appraise(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == cancel_appraise_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("cancel_appraise".into()))
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
async fn list_appraise<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListAppraiseRequest,
) -> Result<ListAppraiseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.list_appraise(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_appraise_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_appraise".into()))
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
async fn import_store<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ImportStoreRequest,
) -> Result<ImportStoreResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectIdeaApiClient::new(chan.unwrap());
    match client.import_store(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == import_store_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("import_store".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct ProjectIdeaApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> ProjectIdeaApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_group,
                update_group,
                list_group,
                get_group,
                remove_group,
                clear_group,
                create_idea,
                update_idea_content,
                update_idea_keyword,
                update_idea_perm,
                get_idea,
                list_idea,
                remove_idea,
                list_all_keyword,
                move_idea,
                set_appraise,
                cancel_appraise,
                list_appraise,
                import_store,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for ProjectIdeaApiPlugin<R> {
    fn name(&self) -> &'static str {
        "project_idea_api"
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
