//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::user_api_plugin::get_session_inner;
use proto_gen_rust::project_api::project_api_client::ProjectApiClient;
use proto_gen_rust::project_api::*;
use tauri::AppHandle;

pub async fn list_project(app: &AppHandle) -> Result<ListResponse, String> {
    let chan = crate::get_grpc_chan(app).await;
    if chan.is_none() {
        return Err("grpc连接出错".into());
    }
    let mut client = ProjectApiClient::new(chan.unwrap());
    let res = client
        .list(ListRequest {
            session_id: get_session_inner(app).await,
            filter_closed: true,
            closed: false,
        })
        .await;
    if res.is_err() {
        return Err("调用接口出错".into());
    } else {
        return Ok(res.unwrap().into_inner());
    }
}


