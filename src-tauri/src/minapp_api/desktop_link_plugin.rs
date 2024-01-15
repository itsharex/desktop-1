#[cfg(target_os = "windows")]
use mslnk::ShellLink;
use std::path::PathBuf;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[tauri::command]
async fn create<R: Runtime>(
    window: Window<R>,
    min_app_name: String,
    min_app_id: String,
    icon_file_id: String,
) -> Result<(), String> {
    if window.label() != "main" {
        return Err("no permission".into());
    }
    //获取当前应用路径
    let prog_path = std::env::current_exe();
    if prog_path.is_err() {
        return Err(prog_path.err().unwrap().to_string());
    }
    let prog_path = prog_path.unwrap().to_string_lossy().to_string();
    //获取图标路径
    let mut icon_file = PathBuf::from(crate::get_cache_dir().unwrap());
    icon_file.push("globalAppStore");
    icon_file.push(&icon_file_id);
    icon_file.push("icon.png");

    return run_create(
        prog_path,
        min_app_name,
        min_app_id,
        icon_file.to_string_lossy().to_string(),
    );
}

#[cfg(target_os = "windows")]
fn run_create(
    prog_path: String,
    min_app_name: String,
    min_app_id: String,
    icon_path: String,
) -> Result<(), String> {
    let dest_file = dirs::desktop_dir();
    if dest_file.is_none() {
        return Err("no desktop dir".into());
    }
    let mut dest_file = dest_file.unwrap();
    dest_file.push(format!("{}.lnk", &min_app_name));

    let link = ShellLink::new(prog_path);
    if link.is_err() {
        return Err(link.err().unwrap().to_string());
    }
    let mut link = link.unwrap();
    link.set_name(Some(min_app_name));
    link.set_arguments(Some(format!("startMinApp {}", &min_app_id)));
    link.set_icon_location(Some(icon_path));

    let res = link.create_lnk(dest_file);
    if res.is_err() {
        return Err(res.err().unwrap().to_string());
    }

    Ok(())
}

pub struct DesktopLinkPlugin<R: Runtime> {
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync + 'static>,
}

impl<R: Runtime> DesktopLinkPlugin<R> {
    pub fn new() -> Self {
        Self {
            invoke_handler: Box::new(tauri::generate_handler![create]),
        }
    }
}

impl<R: Runtime> Plugin<R> for DesktopLinkPlugin<R> {
    fn name(&self) -> &'static str {
        "desktop_link"
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