use crate::minapp_api::min_app_plugin::get_min_app_perm;
use tauri::{
    api::process::Command,
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

pub struct MinAppGrpcPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> MinAppGrpcPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![exec]),
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
