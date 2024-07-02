//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

//列出shell
export async function list(): Promise<string[]> {
    const cmd = 'plugin:shell|list';
    return invoke<string[]>(cmd, {});
}

//执行shell
export async function exec(shellName: string, cwd: string): Promise<void> {
    const cmd = 'plugin:shell|exec';
    return invoke<void>(cmd, {
        shellName,
        cwd,
    });
}