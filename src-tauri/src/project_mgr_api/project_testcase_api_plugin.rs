//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::notice_decode::new_wrong_session_notice;
use proto_gen_rust::project_testcase_api::project_test_case_api_client::ProjectTestCaseApiClient;
use proto_gen_rust::project_testcase_api::*;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateFolderRequest,
) -> Result<CreateFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.create_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_folder_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_folder".into()))
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
async fn update_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateFolderRequest,
) -> Result<UpdateFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.update_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_folder_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_folder".into()))
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
async fn set_folder_parent<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: SetFolderParentRequest,
) -> Result<SetFolderParentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.set_folder_parent(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == set_folder_parent_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("set_folder_parent".into()))
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
async fn list_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListFolderRequest,
) -> Result<ListFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_folder_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_folder".into()))
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
async fn get_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetFolderRequest,
) -> Result<GetFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.get_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_folder_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_folder".into()))
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
async fn remove_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveFolderRequest,
) -> Result<RemoveFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.remove_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_folder_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_folder".into()))
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
async fn update_folder_perm<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateFolderPermRequest,
) -> Result<UpdateFolderPermResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.update_folder_perm(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_folder_perm_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_folder_perm".into()))
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
async fn get_folder_path<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetFolderPathRequest,
) -> Result<GetFolderPathResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.get_folder_path(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_folder_path_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_folder_path".into()))
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
async fn list_all_folder<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListAllFolderRequest,
) -> Result<ListAllFolderResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_all_folder(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_all_folder_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_all_folder".into()))
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
async fn create_case<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: CreateCaseRequest,
) -> Result<CreateCaseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.create_case(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == create_case_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("create_case".into()))
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
async fn update_case<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateCaseRequest,
) -> Result<UpdateCaseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.update_case(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_case_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_case".into()))
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
async fn update_case_content<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateCaseContentRequest,
) -> Result<UpdateCaseContentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.update_case_content(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_case_content_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_case_content".into()))
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
async fn list_case<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListCaseRequest,
) -> Result<ListCaseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_case(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_case_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_case".into()))
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
async fn list_case_flat<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListCaseFlatRequest,
) -> Result<ListCaseFlatResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_case_flat(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_case_flat_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_case_flat".into()))
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
async fn list_case_by_id<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListCaseByIdRequest,
) -> Result<ListCaseByIdResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_case_by_id(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_case_by_id_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_case_by_id".into()))
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
async fn list_all_case<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListAllCaseRequest,
) -> Result<ListAllCaseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_all_case(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_all_case_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_all_case".into()))
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
async fn get_case<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: GetCaseRequest,
) -> Result<GetCaseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.get_case(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == get_case_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("get_case".into()))
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
async fn set_case_parent<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: SetCaseParentRequest,
) -> Result<SetCaseParentResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.set_case_parent(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == set_case_parent_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("set_case_parent".into()))
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
async fn remove_case<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveCaseRequest,
) -> Result<RemoveCaseResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.remove_case(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_case_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_case".into()))
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
async fn update_case_perm<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateCasePermRequest,
) -> Result<UpdateCasePermResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.update_case_perm(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_case_perm_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_case_perm".into()))
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
async fn link_sprit<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: LinkSpritRequest,
) -> Result<LinkSpritResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.link_sprit(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == link_sprit_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("link_sprit".into()))
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
async fn unlink_sprit<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UnlinkSpritRequest,
) -> Result<UnlinkSpritResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.unlink_sprit(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == unlink_sprit_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("unlink_sprit".into()))
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
async fn list_by_sprit<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListBySpritRequest,
) -> Result<ListBySpritResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_by_sprit(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_by_sprit_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_by_sprit".into()))
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
async fn add_test_result<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: AddTestResultRequest,
) -> Result<AddTestResultResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.add_test_result(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == add_test_result_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("add_test_result".into()))
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
async fn update_test_result<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: UpdateTestResultRequest,
) -> Result<UpdateTestResultResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.update_test_result(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == update_test_result_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("update_test_result".into()))
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
async fn list_test_result<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: ListTestResultRequest,
) -> Result<ListTestResultResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.list_test_result(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == list_test_result_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("list_test_result".into()))
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
async fn remove_test_result<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    request: RemoveTestResultRequest,
) -> Result<RemoveTestResultResponse, String> {
    let chan = crate::get_grpc_chan(&app_handle).await;
    if (&chan).is_none() {
        return Err("no grpc conn".into());
    }
    let mut client = ProjectTestCaseApiClient::new(chan.unwrap());
    match client.remove_test_result(request).await {
        Ok(response) => {
            let inner_resp = response.into_inner();
            if inner_resp.code == remove_test_result_response::Code::WrongSession as i32 {
                if let Err(err) =
                    window.emit("notice", new_wrong_session_notice("remove_test_result".into()))
                {
                    println!("{:?}", err);
                }
            }
            return Ok(inner_resp);
        }
        Err(status) => Err(status.message().into()),
    }
}


pub struct ProjectTestCaseApiPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> ProjectTestCaseApiPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                create_folder,
                update_folder,
                set_folder_parent,
                list_folder,
                get_folder,
                remove_folder,
                update_folder_perm,
                get_folder_path,
                list_all_folder,
                create_case,
                update_case,
                update_case_content,
                list_case,
                list_case_flat,
                list_case_by_id,
                list_all_case,
                get_case,
                set_case_parent,
                remove_case,
                update_case_perm,
                link_sprit,
                unlink_sprit,
                list_by_sprit,
                add_test_result,
                update_test_result,
                list_test_result,
                remove_test_result,
                
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for ProjectTestCaseApiPlugin<R> {
    fn name(&self) -> &'static str {
        "project_testcase_api"
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
