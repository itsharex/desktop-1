import { invoke } from '@tauri-apps/api/tauri';


//列出软件包
export async function create(min_app_name: string, min_app_id: string, icon_file_id: string): Promise<void> {
    const cmd = 'plugin:desktop_link|create';
    const request = {
        minAppName: min_app_name,
        minAppId: min_app_id,
        iconFileId: icon_file_id,
    };
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<void>(cmd, request);
}