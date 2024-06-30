//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::time::SystemTime;
use tauri::api::ipc::{format_callback, format_callback_result, CallbackFn};
use tauri::async_runtime::Mutex;
use tonic::transport::{Channel, Endpoint};

mod admin_auth_admin_api_plugin;
mod admin_auth_api_plugin;
mod minapp_api;
mod org_api;
mod project_cloud_api;
mod project_comm_api;
mod project_content_api;
mod project_mgr_api;
mod project_misc_api;
mod pubres_api;
mod skill_api;

mod client_cfg_admin_api_plugin;
mod client_cfg_api_plugin;
mod events_decode;
mod fs_api_plugin;
mod git_widget_plugin;
mod helper;
mod image_utils;
mod keyword_admin_api_plugin;
mod local_api;
mod notice_decode;
mod user_admin_api_plugin;
mod user_api_plugin;
mod user_app_api_plugin;
mod user_notice_api_plugin;
mod user_resume_admin_api_plugin;
mod user_resume_api_plugin;

mod my_updater;

mod dev_container_admin_api_plugin;
mod dev_container_api_plugin;
mod local_repo_plugin;

use std::time::Duration;
use tauri::http::ResponseBuilder;
use tauri::{
    AppHandle, CustomMenuItem, InvokeResponse, Manager, Runtime, SystemTray, SystemTrayEvent,
    SystemTrayMenu, SystemTrayMenuItem, Window, WindowBuilder, WindowUrl,
};
use tokio::fs;

// linksaas://comment/xzx6nmp5WuyhT6lHgIwkZ
const INIT_SCRIPT: &str = r#"
Object.defineProperty(window, "__TAURI_POST_MESSAGE__", {
    value: (message) => {
      if (
        window.__TAURI_METADATA__ != undefined &&
        window.__TAURI_METADATA__.__currentWindow.label.startsWith("minApp:")
      ) {
        if (message.cmd == "tauri") {
          if (message.__tauriModule == "Http") {
            if (window.minApp !== undefined && window.minApp.crossHttp === true) {
              window.ipc.postMessage(JSON.stringify(message));
              return;
            } else {
              return;
            }
          } else if (message.__tauriModule == "Clipboard") {
            window.ipc.postMessage(JSON.stringify(message));
            return;
          } else {
            return;
          }
        } else if (message.cmd.startsWith("plugin:user_api|")) {
          return;
        } else if (message.cmd.startsWith("plugin:")) {
          window.ipc.postMessage(JSON.stringify(message));
          return;
        } else if (message.cmd.startsWith("_")) {
          window.ipc.postMessage(JSON.stringify(message));
          return;
        }
      } else if (
        window.__TAURI_METADATA__ != undefined &&
        window.__TAURI_METADATA__.__currentWindow.label.startsWith("pages:")
      ) {
        return;
      } else if (
        window.__TAURI_METADATA__ != undefined &&
        window.__TAURI_METADATA__.__currentWindow.label.startsWith("gw:")
      ) {
        if (message.cmd.startsWith("plugin:git_widget|read_") || message.cmd.startsWith("plugin:git_widget|get_file_path")) {
          window.ipc.postMessage(JSON.stringify(message));
          return;
        }else{
          return;
        }
      } else {
        window.ipc.postMessage(JSON.stringify(message));
      }
    },
  });    
"#;

#[derive(Default)]
struct GrpcChan(Mutex<Option<Channel>>);

#[derive(Default)]
struct GrpcServerAddr(Mutex<String>);

#[tauri::command]
async fn conn_grpc_server(app_handle: AppHandle, _window: Window, addr: String) -> bool {
    let new_addr = if addr.starts_with("http://") {
        addr
    } else {
        format!("http://{}", &addr)
    };
    let u = url::Url::parse(&new_addr);
    if u.is_err() {
        return false;
    }
    let mut u = u.unwrap();
    if u.port().is_none() {
        if let Err(_) = u.set_port(Some(5000)) {
            return false;
        }
    }
    if let Ok(endpoint) = Endpoint::from_shared(String::from(u)) {
        let chan = endpoint
            .connect_timeout(Duration::from_secs(5))
            .tcp_keepalive(Some(Duration::from_secs(30)))
            .concurrency_limit(16)
            .buffer_size(1024 * 1024)
            .connect_lazy();

        {
            let grpc_chan = app_handle.state::<GrpcChan>().inner();
            *grpc_chan.0.lock().await = Some(chan);
            let gprc_server_addr = app_handle.state::<GrpcServerAddr>().inner();
            *gprc_server_addr.0.lock().await = new_addr;
            return true;
        }
    }
    false
}

#[tauri::command]
async fn is_conn_server(app_handle: AppHandle, _window: Window) -> bool {
    let grpc_chan = app_handle.state::<GrpcChan>().inner();
    let chan = grpc_chan.0.lock().await;
    return chan.is_some();
}

#[tauri::command]
async fn get_conn_server_addr(app_handle: AppHandle) -> String {
    let grpc_server_addr = app_handle.state::<GrpcServerAddr>().inner();
    let addr = grpc_server_addr.0.lock().await;
    return addr.clone();
}

async fn get_grpc_chan<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) -> Option<Channel> {
    let grpc_chan = app_handle.state::<GrpcChan>().inner();
    let chan = grpc_chan.0.lock().await;
    return chan.clone();
}

async fn conn_extern_server(addr: String) -> Result<Channel, String> {
    let new_addr = if addr.starts_with("http://") {
        addr
    } else {
        format!("http://{}", &addr)
    };
    let u = url::Url::parse(&new_addr);
    if u.is_err() {
        return Err(u.err().unwrap().to_string());
    }
    let u = u.unwrap();
    if u.port().is_none() {
        return Err("miss port".into());
    }
    let end_point = Endpoint::from_shared(String::from(u));
    if end_point.is_err() {
        return Err(end_point.err().unwrap().to_string());
    }
    let end_point = end_point.unwrap();
    let chan = end_point
        .connect_timeout(Duration::from_secs(5))
        .tcp_keepalive(Some(Duration::from_secs(30)))
        .concurrency_limit(16)
        .buffer_size(1024 * 1024)
        .connect_lazy();
    return Ok(chan);
}

fn get_base_dir() -> Option<String> {
    if let Some(mut home_dir) = dirs::home_dir() {
        home_dir.push(".linksaas");
        return Some(home_dir.to_str().unwrap().into());
    }
    None
}

fn get_cache_dir() -> Option<String> {
    if let Some(mut home_dir) = dirs::home_dir() {
        home_dir.push(".linksaas");
        home_dir.push("cache");
        return Some(home_dir.to_str().unwrap().into());
    }
    None
}

fn get_user_dir() -> Option<String> {
    if let Some(mut home_dir) = dirs::home_dir() {
        home_dir.push(".linksaas");
        home_dir.push("user");
        return Some(home_dir.to_str().unwrap().into());
    }
    None
}

fn get_tmp_dir() -> Option<String> {
    if let Some(mut home_dir) = dirs::home_dir() {
        home_dir.push(".linksaas");
        home_dir.push("tmp");
        return Some(home_dir.to_str().unwrap().into());
    }
    None
}

fn get_minapp_dir() -> Option<String> {
    if let Some(mut home_dir) = dirs::home_dir() {
        home_dir.push(".linksaas");
        home_dir.push("minapp");
        return Some(home_dir.to_str().unwrap().into());
    }
    None
}

async fn init_local_storage() -> Result<(), Box<dyn std::error::Error>> {
    if let Some(base_dir) = get_base_dir() {
        let meta = fs::metadata((&base_dir).as_str()).await;
        if meta.is_err() {
            if let Err(err) = fs::create_dir_all((&base_dir).as_str()).await {
                return Err(Box::new(err));
            }
        }
    }
    if let Some(cache_dir) = get_cache_dir() {
        let meta = fs::metadata((&cache_dir).as_str()).await;
        if meta.is_err() {
            if let Err(err) = fs::create_dir_all((&cache_dir).as_str()).await {
                return Err(Box::new(err));
            }
        }
    }
    if let Some(tmp_dir) = get_tmp_dir() {
        let meta = fs::metadata((&tmp_dir).as_str()).await;
        if meta.is_err() {
            if let Err(err) = fs::create_dir_all((&tmp_dir).as_str()).await {
                return Err(Box::new(err));
            }
        }
    }
    if let Some(tmp_dir) = get_user_dir() {
        let meta = fs::metadata((&tmp_dir).as_str()).await;
        if meta.is_err() {
            if let Err(err) = fs::create_dir_all((&tmp_dir).as_str()).await {
                return Err(Box::new(err));
            }
        }
    }
    if let Some(tmp_dir) = get_minapp_dir() {
        let meta = fs::metadata((&tmp_dir).as_str()).await;
        if meta.is_err() {
            if let Err(err) = fs::create_dir_all((&tmp_dir).as_str()).await {
                return Err(Box::new(err));
            }
        }
    }
    Ok(())
}

#[tauri::command]
async fn check_update(app_handle: AppHandle) {
    my_updater::check_update_with_dialog(app_handle).await;
}

pub fn window_invoke_responder<R: Runtime>(
    window: Window<R>,
    response: InvokeResponse,
    success_callback: CallbackFn,
    error_callback: CallbackFn,
) {
    let callback_string =
        match format_callback_result(response.into_result(), success_callback, error_callback) {
            Ok(callback_string) => callback_string,
            Err(e) => format_callback(error_callback, &e.to_string())
                .expect("unable to serialize response string to json"),
        };

    let _ = window.eval(&callback_string);
}

fn main() {
    let mut cmd_post_hook = false;
    let args: Vec<String> = std::env::args().collect();
    if args.len() == 2 && args[1] == "postHook" {
        cmd_post_hook = true;
    }

    if local_api::is_instance_run() {
        if cmd_post_hook {
            local_api::call_git_post_hook();
        }
        return;
    }

    if cmd_post_hook {
        return;
    }

    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show_app", "显示界面"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("check_update", "检查更新"))
        .add_item(CustomMenuItem::new("about", "关于"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("exit_app", "退出"));
    let app = tauri::Builder::default()
        .manage(GrpcChan(Default::default()))
        .manage(GrpcServerAddr(Default::default()))
        .setup(|_app| {
            return tauri::async_runtime::block_on(async {
                let init_res = init_local_storage().await;
                if init_res.is_err() {
                    return init_res;
                }
                Ok(())
            });
        })
        .invoke_handler(tauri::generate_handler![
            conn_grpc_server,
            is_conn_server,
            get_conn_server_addr,
            check_update,
        ])
        .on_window_event(|ev| match ev.event() {
            tauri::WindowEvent::Destroyed => {
                let win = ev.window().clone();
                //清除微应用相关资源
                let app_handle = win.app_handle();
                let label = String::from(win.label());
                tauri::async_runtime::spawn(async move {
                    minapp_api::min_app_plugin::clear_by_close(app_handle.clone(), label.clone())
                        .await;
                    project_content_api::pages_plugin::clear_by_close(
                        app_handle.clone(),
                        label.clone(),
                    )
                    .await;
                    dev_container_api_plugin::clear_by_close(label.clone()).await;
                    git_widget_plugin::clear_by_close(app_handle.clone(), label.clone()).await;
                });
            }
            _ => {}
        })
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let all_windows = app.windows();
                for (_, win) in &all_windows {
                    win.show().unwrap();
                    win.unminimize().unwrap();
                    win.set_always_on_top(true).unwrap();
                    win.set_always_on_top(false).unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show_app" => {
                    let all_windows = app.windows();
                    for (_, win) in &all_windows {
                        win.show().unwrap();
                        win.unminimize().unwrap();
                        win.set_always_on_top(true).unwrap();
                        win.set_always_on_top(false).unwrap();
                    }
                }
                "about" => {
                    let about_win = app.get_window("about");
                    if about_win.is_none() {
                        if let Ok(_) =
                            WindowBuilder::new(app, "about", WindowUrl::App("about.html".into()))
                                .inner_size(250.0, 140.0)
                                .resizable(false)
                                .skip_taskbar(true)
                                .title("关于")
                                .always_on_top(true)
                                .center()
                                .decorations(false)
                                .visible(true)
                                .build()
                        {}
                    }
                }
                "exit_app" => {
                    local_api::remove_info_file();
                    app.exit(0);
                }
                "check_update" => {
                    let handle = app.clone();
                    tauri::async_runtime::spawn(async move {
                        my_updater::check_update_with_dialog(handle).await;
                    });
                }
                _ => {}
            },
            _ => {}
        })
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .plugin(client_cfg_api_plugin::ClientCfgApiPlugin::new())
        .plugin(project_comm_api::project_api_plugin::ProjectApiPlugin::new())
        .plugin(project_comm_api::project_member_api_plugin::ProjectMemberApiPlugin::new())
        .plugin(user_api_plugin::UserApiPlugin::new())
        .plugin(user_notice_api_plugin::UserNoticeApiPlugin::new())
        .plugin(user_resume_api_plugin::UserResumeApiPlugin::new())
        .plugin(user_resume_admin_api_plugin::UserResumeAdminApiPlugin::new())
        .plugin(project_comm_api::events_api_plugin::EventsApiPlugin::new())
        .plugin(project_misc_api::external_events_api_plugin::ExternalEventsApiPlugin::new())
        .plugin(project_content_api::project_sprit_api_plugin::ProjectSpritApiPlugin::new())
        .plugin(project_content_api::project_doc_api_plugin::ProjectDocApiPlugin::new())
        .plugin(project_content_api::data_anno_project_api_plugin::DataAnnoProjectApiPlugin::new())
        .plugin(project_content_api::data_anno_task_api_plugin::DataAnnoTaskApiPlugin::new())
        .plugin(fs_api_plugin::FsApiPlugin::new())
        .plugin(project_misc_api::short_note_api_plugin::ShortNoteApiPlugin::new())
        .plugin(local_api::LocalApiPlugin::new())
        .plugin(project_misc_api::events_subscribe_api_plugin::EventsSubscribeApiPlugin::new())
        .plugin(admin_auth_api_plugin::AdminAuthApiPlugin::new())
        .plugin(admin_auth_admin_api_plugin::AdminAuthAdminApiPlugin::new())
        .plugin(project_comm_api::project_admin_api_plugin::ProjectAdminApiPlugin::new())
        .plugin(
            project_comm_api::project_member_admin_api_plugin::ProjectMemberAdminApiPlugin::new(),
        )
        .plugin(git_widget_plugin::GitWidgetPlugin::new())
        .plugin(user_admin_api_plugin::UserAdminApiPlugin::new())
        .plugin(client_cfg_admin_api_plugin::ClientCfgAdminApiPlugin::new())
        .plugin(project_comm_api::events_admin_api_plugin::EventsAdminApiPlugin::new())
        .plugin(minapp_api::min_app_plugin::MinAppPlugin::new())
        .plugin(minapp_api::min_app_fs_plugin::MinAppFsPlugin::new())
        .plugin(minapp_api::min_app_shell_plugin::MinAppShellPlugin::new())
        .plugin(minapp_api::min_app_store_plugin::MinAppStorePlugin::new())
        .plugin(minapp_api::min_app_grpc_plugin::MinAppGrpcPlugin::new())
        .plugin(project_mgr_api::project_issue_api_plugin::ProjectIssueApiPlugin::new())
        .plugin(project_mgr_api::project_requirement_api_plugin::ProjectRequirementApiPlugin::new())
        .plugin(project_mgr_api::project_alarm_api_plugin::ProjectAlarmApiPlugin::new())
        .plugin(project_mgr_api::project_testcase_api_plugin::ProjectTestCaseApiPlugin::new())
        .plugin(pubres_api::appstore_api_plugin::AppstoreApiPlugin::new())
        .plugin(pubres_api::appstore_admin_api_plugin::AppstoreAdminApiPlugin::new())
        .plugin(user_app_api_plugin::UserAppApiPlugin::new())
        .plugin(project_misc_api::project_chat_api_plugin::ProjectChatApiPlugin::new())
        .plugin(project_misc_api::project_code_api_plugin::ProjectCodeApiPlugin::new())
        .plugin(project_misc_api::project_idea_api_plugin::ProjectIdeaApiPlugin::new())
        .plugin(project_misc_api::project_tool_api_plugin::ProjectToolApiPlugin::new())
        .plugin(project_misc_api::project_bulletin_api_plugin::ProjectBulletinApiPlugin::new())
        .plugin(project_misc_api::project_recycle_api_plugin::ProjectRecycleApiPlugin::new())
        .plugin(local_repo_plugin::LocalRepoPlugin::new())
        .plugin(pubres_api::docker_template_api_plugin::DockerTemplateApiPlugin::new())
        .plugin(pubres_api::docker_template_admin_api_plugin::DockerTemplateAdminApiPlugin::new())
        .plugin(project_content_api::api_collection_api_plugin::ApiCollectionApiPlugin::new())
        .plugin(pubres_api::pub_search_api_plugin::PubSearchApiPlugin::new())
        .plugin(project_content_api::http_custom_api_plugin::HttpCustomApiPlugin::new())
        .plugin(project_content_api::project_entry_api_plugin::ProjectEntryApiPlugin::new())
        .plugin(project_misc_api::project_watch_api_plugin::ProjectWatchApiPlugin::new())
        .plugin(project_misc_api::project_comment_api_plugin::ProjectCommentApiPlugin::new())
        .plugin(pubres_api::idea_store_admin_api_plugin::IdeaStoreAdminApiPlugin::new())
        .plugin(pubres_api::idea_store_api_plugin::IdeaStoreApiPlugin::new())
        .plugin(pubres_api::widget_store_api_plugin::WidgetStoreApiPlugin::new())
        .plugin(pubres_api::widget_store_admin_api_plugin::WidgetStoreAdminApiPlugin::new())
        .plugin(pubres_api::sw_store_api_plugin::SwStoreApiPlugin::new())
        .plugin(pubres_api::sw_store_admin_api_plugin::SwStoreAdminApiPlugin::new())
        .plugin(pubres_api::git_vp_api_plugin::GitVpApiPlugin::new())
        .plugin(pubres_api::git_vp_admin_api_plugin::GitVpAdminApiPlugin::new())
        .plugin(project_content_api::pages_plugin::PagesPlugin::new())
        .plugin(project_content_api::project_board_api_plugin::ProjectBoardApiPlugin::new())
        .plugin(project_cloud_api::k8s_proxy_api_plugin::K8sProxyApiPlugin::new())
        .plugin(project_cloud_api::swarm_proxy_api_plugin::SwarmProxyApiPlugin::new())
        .plugin(project_cloud_api::trace_proxy_api_plugin::TraceProxyApiPlugin::new())
        .plugin(project_cloud_api::net_proxy_api_plugin::NetProxyApiPlugin::new())
        .plugin(dev_container_api_plugin::DevContainerApiPlugin::new())
        .plugin(dev_container_admin_api_plugin::DevContainerAdminApiPlugin::new())
        .plugin(org_api::org_api_plugin::OrgApiPlugin::new())
        .plugin(org_api::org_member_api_plugin::OrgMemberApiPlugin::new())
        .plugin(org_api::org_okr_api_plugin::OrgOkrApiPlugin::new())
        .plugin(org_api::org_report_api_plugin::OrgReportApiPlugin::new())
        .plugin(org_api::org_forum_api_plugin::OrgForumApiPlugin::new())
        .plugin(org_api::org_admin_api_plugin::OrgAdminApiPlugin::new())
        .plugin(org_api::org_member_admin_api_plugin::OrgMemberAdminApiPlugin::new())
        .plugin(skill_api::skill_center_admin_api_plugin::SkillCenterAdminApiPlugin::new())
        .plugin(skill_api::skill_center_api_plugin::SkillCenterApiPlugin::new())
        .plugin(skill_api::skill_learn_api_plugin::SkillLearnApiPlugin::new())
        .plugin(skill_api::skill_resource_api_plugin::SkillResourceApiPlugin::new())
        .plugin(skill_api::skill_resource_admin_api_plugin::SkillResourceAdminApiPlugin::new())
        .plugin(skill_api::skill_test_api_plugin::SkillTestApiPlugin::new())
        .plugin(skill_api::skill_test_admin_api_plugin::SkillTestAdminApiPlugin::new())
        .plugin(keyword_admin_api_plugin::KeywordAdminApiPlugin::new())
        .invoke_system(String::from(INIT_SCRIPT), window_invoke_responder)
        .register_uri_scheme_protocol("fs", move |app_handle, request| {
            match url::Url::parse(request.uri()) {
                Err(_) => ResponseBuilder::new()
                    .header("Access-Control-Allow-Origin", "*")
                    .status(404)
                    .body("wrong url".into()),
                Ok(req_url) => {
                    let user_value = app_handle.state::<user_api_plugin::CurSession>().inner();
                    let admin_value = app_handle
                        .state::<admin_auth_api_plugin::CurAdminSession>()
                        .inner();
                    return tauri::async_runtime::block_on(async move {
                        if req_url.path().starts_with("/global") {
                            return fs_api_plugin::http_download_file(
                                app_handle,
                                String::from("main"),
                                req_url.path(),
                                "",
                            )
                            .await;
                        }
                        let cur_session = user_value.0.lock().await;
                        if let Some(cur_session_id) = cur_session.clone() {
                            return fs_api_plugin::http_download_file(
                                app_handle,
                                String::from("main"),
                                req_url.path(),
                                cur_session_id.as_str(),
                            )
                            .await;
                        } else {
                            let cur_session = admin_value.0.lock().await;
                            if let Some(cur_session_id) = cur_session.clone() {
                                return fs_api_plugin::http_download_file(
                                    app_handle,
                                    String::from("main"),
                                    req_url.path(),
                                    cur_session_id.as_str(),
                                )
                                .await;
                            } else {
                                return ResponseBuilder::new()
                                    .header("Access-Control-Allow-Origin", "*")
                                    .status(403)
                                    .body("wrong session".into());
                            }
                        }
                    });
                }
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building  tauri application");
    let mut last_ts = 0 as u128;
    let mut total_download = 0 as f32;
    app.run(move |app_handle, event| match event {
        tauri::RunEvent::Updater(updater_event) => {
            let win = app_handle.get_window("main");
            match updater_event {
                tauri::UpdaterEvent::DownloadProgress {
                    chunk_length,
                    content_length,
                } => {
                    total_download += chunk_length as f32;
                    if win.is_some() && content_length.is_some() {
                        let content_length: u64 = content_length.unwrap();
                        if content_length > 0 {
                            let ts = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH);
                            if ts.is_ok() {
                                let ts = ts.unwrap().as_millis();
                                if ts - last_ts > 200
                                    || (total_download as usize) == (content_length as usize)
                                {
                                    last_ts = ts;
                                    if let Err(err) = win.unwrap().emit(
                                        "updateProgress",
                                        total_download / (content_length as f32),
                                    ) {
                                        println!("{}", err);
                                    }
                                }
                            }
                        }
                    }
                }
                tauri::UpdaterEvent::Error(_) => {
                    if win.is_some() {
                        if let Err(err) = win.unwrap().emit("updateProgress", -1) {
                            println!("{}", err);
                        }
                    }
                }
                _ => {}
            }
        }
        _ => {}
    });
}
