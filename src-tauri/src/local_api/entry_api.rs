use crate::user_api_plugin::get_session_inner;
use proto_gen_rust::project_entry_api::project_entry_api_client::ProjectEntryApiClient;
use proto_gen_rust::project_entry_api::*;
use tauri::AppHandle;

pub async fn list_folder(
    app: &AppHandle,
    project_id: &String,
    folder_id: &String,
) -> Result<ListSubFolderResponse, String> {
    let chan = crate::get_grpc_chan(app).await;
    if chan.is_none() {
        return Err("grpc连接出错".into());
    }
    let mut client = ProjectEntryApiClient::new(chan.unwrap());
    let res = client.list_sub_folder(ListSubFolderRequest {
        session_id: get_session_inner(app).await,
        project_id: project_id.clone(),
        parent_folder_id: folder_id.clone(),
    }).await;
    if res.is_err() {
        return Err("调用接口出错".into());
    }else {
        return Ok(res.unwrap().into_inner());
    }
}

pub async fn list_entry(
    app: &AppHandle,
    project_id: &String,
    folder_id: &String,
) -> Result<ListSubEntryResponse,String> {
    let chan = crate::get_grpc_chan(app).await;
    if chan.is_none() {
        return Err("grpc连接出错".into());
    }
    let mut client = ProjectEntryApiClient::new(chan.unwrap());
    let res = client.list_sub_entry(ListSubEntryRequest{
        session_id: get_session_inner(app).await,
        project_id: project_id.clone(),
        parent_folder_id: folder_id.clone(),
    }).await;
    if res.is_err() {
        return Err("调用接口出错".into());
    }else {
        return Ok(res.unwrap().into_inner());
    }
}