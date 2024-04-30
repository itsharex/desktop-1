//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use crate::helper::http::start_http_serv;
use std::collections::HashMap;
use std::time::Duration;
use tauri::async_runtime::Mutex;
use tauri::Manager;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window, WindowBuilder, WindowUrl,
};
use tokio::time::sleep;

#[derive(Default)]
pub struct HttpServerMap(pub Mutex<HashMap<String, tokio::sync::oneshot::Sender<()>>>);

#[derive(Default)]
pub struct FilePathMap(pub Mutex<HashMap<String, String>>);

pub async fn clear_by_close<R: Runtime>(app_handle: AppHandle<R>, label: String) {
    println!("clear git widget resource");

    let file_path_map = app_handle.state::<FilePathMap>().inner();
    let mut file_path_map_data = file_path_map.0.lock().await;
    file_path_map_data.remove(&label);

    let serv_map = app_handle.state::<HttpServerMap>().inner();
    let mut serv_map_data = serv_map.0.lock().await;
    let tx = serv_map_data.remove(&label);
    if tx.is_some() {
        tx.unwrap().send(()).ok();
    }
}

#[tauri::command]
async fn start<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    label: String,
    title: String,
    path: String,
    file_path: String,
) -> Result<(), String> {
    if window.label() != "main" {
        return Err("no permission".into());
    }
    if &label == "main" {
        return Err("no permission".into());
    }
    //关闭之前的窗口
    let dest_win = app_handle.get_window(&label);
    if dest_win.is_some() {
        if let Err(err) = dest_win.unwrap().close() {
            return Err(err.to_string());
        }
        sleep(Duration::from_millis(500)).await;
    }

    let mut dest_url = String::from("");
    if path.starts_with("http://") {
        dest_url.clone_from(&path);
    } else {
        let serv = start_http_serv(path, false).await;
        if serv.is_err() {
            return Err(serv.err().unwrap());
        }
        let serv = serv.unwrap();
        {
            let serv_map = app_handle.state::<HttpServerMap>().inner();
            let mut serv_map_data = serv_map.0.lock().await;
            serv_map_data.insert(label.clone(), serv.1);
        }
        let tmp_url = format!("http://localhost:{}/index.html", serv.0);
        dest_url.clone_from(&tmp_url);
    }
    let open_url = url::Url::parse(dest_url.as_str());
    if open_url.is_err() {
        clear_by_close(app_handle.clone(), label.clone()).await;
        return Err(open_url.err().unwrap().to_string());
    }

    {
        let file_path_map = app_handle.state::<FilePathMap>().inner();
        let mut file_path_map = file_path_map.0.lock().await;
        file_path_map.insert(label.clone(), file_path);
    }

    let pos = window.inner_position();
    if pos.is_err() {
        return Err(pos.err().unwrap().to_string());
    }
    let pos = pos.unwrap();

    let res = WindowBuilder::new(
        &app_handle,
        label.clone(),
        WindowUrl::External(open_url.unwrap()),
    )
    .title(title)
    .visible(true)
    .inner_size(800.0, 600.0)
    .position(pos.x as f64 + 100.0, pos.y as f64 + 100.0)
    .build();
    if res.is_err() {
        clear_by_close(app_handle.clone(), label.clone()).await;
        return Err(res.err().unwrap().to_string());
    }
    Ok(())
}

#[tauri::command]
async fn read_binary<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
) -> Result<Vec<u8>, String> {
    let label = window.label();

    let file_path_map = app_handle.state::<FilePathMap>().inner();
    let file_path_map_data = file_path_map.0.lock().await;
    let file_path = file_path_map_data.get(label);
    if file_path.is_none() {
        return Err("no file find".into());
    }
    let file_path = file_path.unwrap();
    let data = tauri::api::file::read_binary(file_path);
    if data.is_err() {
        return Err(data.err().unwrap().to_string());
    }
    return Ok(data.unwrap());
}

#[tauri::command]
async fn read_text<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
) -> Result<String, String> {
    let label = window.label();

    let file_path_map = app_handle.state::<FilePathMap>().inner();
    let file_path_map_data = file_path_map.0.lock().await;
    let file_path = file_path_map_data.get(label);
    if file_path.is_none() {
        return Err("no file find".into());
    }
    let file_path = file_path.unwrap();
    let data = tauri::api::file::read_string(file_path);
    if data.is_err() {
        return Err(data.err().unwrap().to_string());
    }
    return Ok(data.unwrap());
}

#[tauri::command]
async fn get_file_path<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
) -> Result<String, String> {
    let label = window.label();

    let file_path_map = app_handle.state::<FilePathMap>().inner();
    let file_path_map_data = file_path_map.0.lock().await;
    let file_path = file_path_map_data.get(label);
    if file_path.is_none() {
        return Err("no file find".into());
    }
    let file_path = file_path.unwrap();

    return Ok(String::from(file_path));
}

pub struct GitWidgetPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> GitWidgetPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![
                start,
                read_binary,
                read_text,
                get_file_path
            ]),
        }
    }
}

impl<R: Runtime> Plugin<R> for GitWidgetPlugin<R> {
    fn name(&self) -> &'static str {
        "git_widget"
    }
    fn initialization_script(&self) -> Option<String> {
        None
    }

    fn initialize(&mut self, app: &AppHandle<R>, _config: serde_json::Value) -> PluginResult<()> {
        app.manage(HttpServerMap(Default::default()));
        app.manage(FilePathMap(Default::default()));
        Ok(())
    }

    fn created(&mut self, _window: Window<R>) {}

    fn on_page_load(&mut self, _window: Window<R>, _payload: PageLoadPayload) {}

    fn extend_api(&mut self, message: Invoke<R>) {
        (self.invoke_handler)(message)
    }
}
