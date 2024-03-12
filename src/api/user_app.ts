import { invoke } from '@tauri-apps/api/tauri';

//列出应用
export async function list_app(): Promise<string[]> {
    const cmd = 'plugin:user_app_api|list_app';
    return invoke<string[]>(cmd, {});
}

//保存应用列表
export async function save_app_list(appIdList: string[]): Promise<void> {
    const cmd = 'plugin:user_app_api|save_app_list';
    return invoke<void>(cmd, { appIdList: appIdList });
}
