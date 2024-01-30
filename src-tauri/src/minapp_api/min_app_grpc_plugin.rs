use crate::minapp_api::min_app_plugin::get_min_app_perm;
use tauri::{
    api::process::{Command, CommandEvent},
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn exec<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    args: Vec<String>,
) -> Result<String, String> {
    //检查权限
    let perm = get_min_app_perm(app_handle.clone(), window).await;
    if perm.is_none() {
        return Err("no perm".into());
    }
    let perm = perm.unwrap();
    let perm = perm.net_perm;
    if perm.is_none() {
        return Err("no perm".into());
    }
    let perm = perm.unwrap();
    if !perm.proxy_grpc {
        return Err("no perm".into());
    }

    let cmd = Command::new_sidecar("grpcutil");
    if cmd.is_err() {
        return Err(cmd.err().unwrap().to_string());
    }
    let cmd = cmd.unwrap();
    let cmd = cmd.args(args);
    let res = cmd.output();
    if res.is_err() {
        return Err(res.err().unwrap().to_string());
    }
    let res = res.unwrap();
    return Ok(res.stdout.to_string());
}

#[tauri::command]
async fn exec_pipe<R: Runtime>(
    app_handle: AppHandle<R>,
    window: Window<R>,
    args: Vec<String>,
    pipe_data: String,
) -> Result<String, String> {
    //检查权限
    let perm = get_min_app_perm(app_handle.clone(), window).await;
    if perm.is_none() {
        return Err("no perm".into());
    }
    let perm = perm.unwrap();
    let perm = perm.net_perm;
    if perm.is_none() {
        return Err("no perm".into());
    }
    let perm = perm.unwrap();
    if !perm.proxy_grpc {
        return Err("no perm".into());
    }

    let cmd = Command::new_sidecar("grpcutil");
    if cmd.is_err() {
        return Err(cmd.err().unwrap().to_string());
    }
    let cmd = cmd.unwrap();
    let cmd = cmd.args(args);
    let res = cmd.spawn();
    if res.is_err() {
        return Err(res.err().unwrap().to_string());
    }
    let (mut rx, mut child) = res.unwrap();
    if let Err(err) = child.write(pipe_data.as_bytes()) {
        return Err(err.to_string());
    }
    if let Err(err) = child.write("\n".as_bytes()) {
        return Err(err.to_string());
    }
    let mut ret = String::from("");
    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event {
            ret += &line;
            ret += "\n";
        }
    }
    return Ok(ret);
}

#[tauri::command]
async fn get_file(file_name: String) -> Result<String, String> {
    let cache_path = crate::get_cache_dir();
    if cache_path.is_none() {
        return Err("no file".into());
    }
    let mut file_path = std::path::PathBuf::from(cache_path.unwrap());
    file_path.push(file_name);
    return Ok(file_path.to_string_lossy().to_string());
}

pub struct MinAppGrpcPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> MinAppGrpcPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![exec, exec_pipe, get_file]),
        }
    }
}

impl<R: Runtime> Plugin<R> for MinAppGrpcPlugin<R> {
    fn name(&self) -> &'static str {
        "min_app_grpc"
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
