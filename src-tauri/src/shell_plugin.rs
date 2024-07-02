//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

use pathsearch::find_executable_in_path;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};
use tokio::io::AsyncWriteExt;
use tokio::process::Command;

#[tauri::command]
async fn list() -> Vec<String> {
    return real_list().await;
}

#[cfg(target_os = "windows")]
async fn real_list() -> Vec<String> {
    let mut ret_list: Vec<String> = Vec::new();
    if let Some(_) = find_executable_in_path("powershell") {
        ret_list.push("powershell".into());
    }
    if let Some(_) = find_executable_in_path("cmd") {
        ret_list.push("cmd".into());
    }
    return ret_list;
}

#[cfg(target_os = "linux")]
async fn real_list() -> Vec<String> {
    let mut ret_list: Vec<String> = Vec::new();
    if let Some(_) = find_executable_in_path("bash") {
        ret_list.push("bash".into());
    }
    return ret_list;
}

#[cfg(target_os = "macos")]
async fn real_list() -> Vec<String> {
    let mut ret_list: Vec<String> = Vec::new();
    if let Some(_) = find_executable_in_path("zsh") {
        ret_list.push("zsh".into());
    }
    if let Some(_) = find_executable_in_path("bash") {
        ret_list.push("bash".into());
    }
    return ret_list;
}

#[tauri::command]
async fn exec(shell_name: String, cwd: String) {
    real_exec(shell_name, cwd).await;
}

#[cfg(target_os = "windows")]
async fn real_exec(shell_name: String, cwd: String) {
    let cmd_path = find_executable_in_path(&shell_name);
    if cmd_path.is_none() {
        return;
    }
    let cmd_path = cmd_path.unwrap();
    let child = Command::new(cmd_path).current_dir(&cwd).spawn();
    if child.is_err() {
        return;
    }
    let mut child = child.unwrap();
    tauri::async_runtime::spawn(async move {
        let _ = child.wait().await;
    });
}

#[cfg(target_os = "linux")]
async fn real_exec(shell_name: String, cwd: String) {
    let cmd_path = find_executable_in_path("gnome-terminal");
    if cmd_path.is_none() {
        return;
    }
    let cmd_path = cmd_path.unwrap();
    let child = Command::new(cmd_path)
        .arg("--")
        .arg(&shell_name)
        .current_dir(&cwd)
        .spawn();
    if child.is_err() {
        return;
    }
    let mut child = child.unwrap();
    tauri::async_runtime::spawn(async move {
        let _ = child.wait().await;
    });
}

#[cfg(target_os = "macos")]
async fn real_exec(shell_name: String, cwd: String) {
    let cmd_path = find_executable_in_path("open");
    if cmd_path.is_none() {
        return;
    }
    let cmd_path = cmd_path.unwrap();

    let shell_path = find_executable_in_path(&shell_name);
    if shell_path.is_none() {
        return;
    }
    let shell_path = shell_path.unwrap();

    let script_file_path = "/tmp/open_shell.sh";
    let _ = tokio::fs::remove_file(script_file_path).await;
    let script_file = tokio::fs::File::options().mode(0o777).read(true).write(true).create(true).open(&script_file_path).await;
    if script_file.is_err() {
        return;
    }
    let mut script_file = script_file.unwrap();
    let content = format!("cd {} && {}", cwd, shell_path.to_string_lossy().to_string());
    let res = script_file.write_all(content.as_bytes()).await;
    if res.is_err(){
        return;
    }

    let child = Command::new(cmd_path).arg("-a").arg("Terminal").arg(script_file_path).spawn();
    if child.is_err() {
        return;
    }
    let mut child = child.unwrap();
    tauri::async_runtime::spawn(async move {
        let _ = child.wait().await;
    });
}

pub struct ShellPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> ShellPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![list, exec]),
        }
    }
}

impl<R: Runtime> Plugin<R> for ShellPlugin<R> {
    fn name(&self) -> &'static str {
        "shell"
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
