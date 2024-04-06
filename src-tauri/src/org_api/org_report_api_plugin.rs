use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::org_report_api::org_report_api_client::OrgReportApiClient;
use proto_gen_rust::org_report_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn add_day_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AddDayReportRequest,
) -> Result<AddDayReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.add_day_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == add_day_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("add_day_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_day_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateDayReportRequest,
) -> Result<UpdateDayReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.update_day_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_day_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_day_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_day_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListDayReportRequest,
) -> Result<ListDayReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.list_day_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_day_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_day_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_day_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetDayReportRequest,
) -> Result<GetDayReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.get_day_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_day_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_day_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_day_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveDayReportRequest,
) -> Result<RemoveDayReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.remove_day_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_day_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_day_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn add_week_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AddWeekReportRequest,
) -> Result<AddWeekReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.add_week_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == add_week_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("add_week_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn update_week_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateWeekReportRequest,
) -> Result<UpdateWeekReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.update_week_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_week_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("update_week_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn list_week_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListWeekReportRequest,
) -> Result<ListWeekReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.list_week_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_week_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("list_week_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn get_week_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetWeekReportRequest,
) -> Result<GetWeekReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.get_week_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_week_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("get_week_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

#[tauri::command]
async fn remove_week_report<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveWeekReportRequest,
) -> Result<RemoveWeekReportResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = OrgReportApiClient::new(chan.unwrap());
    match client.remove_week_report(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_week_report_response::Code::WrongSession as i32 {
                if let Err(err) = window.emit("notice", new_wrong_session_notice("remove_week_report".into())) {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}

pub struct OrgReportApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> OrgReportApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                add_day_report,
                update_day_report,
                list_day_report,
                get_day_report,
                remove_day_report,
                add_week_report,
                update_week_report,
                list_week_report,
                get_week_report,
                remove_week_report,
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for OrgReportApiPlugin<R> {
    fn name(&self) -> &'static str {
        "org_report_api"
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