#[cfg(target_os = "windows")]
use mslnk::ShellLink;
use std::path::PathBuf;
use tauri::{
    plugin::{Plugin, Result as PluginResult},
    AppHandle, Invoke, PageLoadPayload, Runtime, Window,
};

#[cfg(target_os = "linux")]
use tokio::fs;
#[cfg(target_os = "linux")]
use tokio::io::AsyncWriteExt;

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
    )
    .await;
}

#[cfg(target_os = "windows")]
async fn run_create(
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

#[cfg(target_os = "linux")]
async fn run_create(
    prog_path: String,
    min_app_name: String,
    min_app_id: String,
    icon_path: String,
) -> Result<(), String> {
    let desktop_file = dirs::desktop_dir();
    if desktop_file.is_none() {
        return Err("no desktop dir".into());
    }
    let mut desktop_file = desktop_file.unwrap();
    desktop_file.push(format!("{}.desktop", &min_app_name));

    let app_link_file = dirs::home_dir();
    if app_link_file.is_none() {
        return Err("no home dir".into());
    }
    let mut app_link_file = app_link_file.unwrap();
    app_link_file.push(".local");
    app_link_file.push("share");
    app_link_file.push("applications");
    app_link_file.push(format!("{}.desktop", &min_app_name));

    let mut content = String::from("");
    content.push_str("[Desktop Entry]\n");
    content.push_str("Version=1.0\n");
    content.push_str("Name=");
    content.push_str(&min_app_name);
    content.push_str("\n");

    let exec = format!("Exec={} startMinApp  {}", &prog_path, &min_app_id);
    content.push_str(&exec);
    content.push_str("\n");

    content.push_str("Categories=Utility;\n");
    content.push_str("Type=Application\n");

    let icon = format!("Icon={}", &icon_path);
    content.push_str(&icon);
    content.push_str("\n");

    for dest_file in &(vec![desktop_file, app_link_file]) {
        if dest_file.exists() {
            let res = fs::remove_file(dest_file).await;
            if res.is_err() {
                return Err(res.err().unwrap().to_string());
            }
        }
        if let Some(parent_path) = dest_file.parent() {
            if !parent_path.exists() {
                let res = fs::create_dir_all(parent_path).await;
                if res.is_err() {
                    return Err(res.err().unwrap().to_string());
                }
            }
        }
        let f = fs::File::options()
            .create(true)
            .write(true)
            .open(dest_file)
            .await;
        if f.is_err() {
            return Err(f.err().unwrap().to_string());
        }
        let mut f = f.unwrap();
        let res = f.write_all(content.as_bytes()).await;
        if res.is_err() {
            return Err(res.err().unwrap().to_string());
        }
    }

    Ok(())
}

#[cfg(target_os = "macos")]
async fn run_create(
    _prog_path: String,
    _min_app_name: String,
    _min_app_id: String,
    _icon_path: String,
) -> Result<(), String> {
    Err("not support".into())
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
