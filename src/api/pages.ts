//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

//启动pages
export async function start(label: string, title: string, path: string): Promise<void> {
    const cmd = 'plugin:pages|start';
    const request = {
        label, title, path,
    }
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<void>(cmd, request);
}