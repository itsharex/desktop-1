use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::org_api::org_api_client::OrgApiClient;
use proto_gen_rust::org_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create_org<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateOrgRequest,
) -> Result<CreateOrgResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.create_org(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_org_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_org".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_org<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateOrgRequest,
) -> Result<UpdateOrgResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.update_org(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_org_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_org".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_org<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListOrgRequest,
) -> Result<ListOrgResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.list_org(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_org_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_org".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_org<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetOrgRequest,
) -> Result<GetOrgResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.get_org(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_org_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_org".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_org<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveOrgRequest,
) -> Result<RemoveOrgResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.remove_org(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_org_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_org".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn change_org_owner<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ChangeOrgOwnerRequest,
) -> Result<ChangeOrgOwnerResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.change_org_owner(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == change_org_owner_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("change_org_owner".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn create_depart_ment<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateDepartMentRequest,
) -> Result<CreateDepartMentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.create_depart_ment(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_depart_ment_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("create_depart_ment".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_depart_ment<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateDepartMentRequest,
) -> Result<UpdateDepartMentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.update_depart_ment(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_depart_ment_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_depart_ment".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_depart_ment<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListDepartMentRequest,
) -> Result<ListDepartMentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.list_depart_ment(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_depart_ment_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_depart_ment".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_depart_ment<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDepartMentRequest,
) -> Result<GetDepartMentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.get_depart_ment(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_depart_ment_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_depart_ment".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_depart_ment<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveDepartMentRequest,
) -> Result<RemoveDepartMentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.remove_depart_ment(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_depart_ment_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_depart_ment".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn move_depart_ment<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: MoveDepartMentRequest,
) -> Result<MoveDepartMentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgApiClient::new(chan.unwrap());
    match client.move_depart_ment(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == move_depart_ment_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("move_depart_ment".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct OrgApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> OrgApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_org,
                update_org,
                list_org,
                get_org,
                remove_org,
                change_org_owner,
                create_depart_ment,
                update_depart_ment,
                list_depart_ment,
                get_depart_ment,
                remove_depart_ment,
                move_depart_ment,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for OrgApiPlugin<R> {
    fn name(&self) -> &'static str {
        "org_api"
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
