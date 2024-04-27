//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type StoreStatus = {
    total_size: number;
    key_count: number;
};

//清空微应用存储
export async function clear_data(label: string): Promise<void> {
    return invoke<void>("plugin:min_app_store|clear_data", {
        label,
    });
}

//获取微应用存储状态
export async function get_status(label: string): Promise<StoreStatus> {
    return invoke<StoreStatus>("plugin:min_app_store|get_status", {
        label,
    });
}