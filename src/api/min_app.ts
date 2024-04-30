//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import type { AppPerm } from '@/api/appstore';

export type StartRequest = {
    user_id: string;
    user_display_name: string;
    label: string;
    title: string;
    path: string;
};

//启动微应用
export async function start(request: StartRequest, perm: AppPerm): Promise<void> {
    return invoke<void>("plugin:min_app|start", {
        request,
        perm,
    });
}

//打包目录
export async function pack_min_app(path: string, trace: string): Promise<string> {
    return invoke<string>("plugin:min_app|pack_min_app", {
        path,
        trace,
    });
}

//检查是否已经解包
export async function check_unpark(fs_id: string, file_id: string): Promise<boolean> {
    return invoke<boolean>("plugin:min_app|check_unpark", {
        fsId: fs_id,
        fileId: file_id,
    });
}

//获取解包路径
export async function get_min_app_path(fs_id: string, file_id: string): Promise<string> {
    return invoke<string>("plugin:min_app|get_min_app_path", {
        fsId: fs_id,
        fileId: file_id,
    });
}

//解zip包
export async function unpack_min_app(fs_id: string, file_id: string, trace: string): Promise<void> {
    return invoke<void>("plugin:min_app|unpack_min_app", {
        fsId: fs_id,
        fileId: file_id,
        trace,
    });
}