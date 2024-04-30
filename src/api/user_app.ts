//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

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
