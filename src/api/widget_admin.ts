//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type AdminAddWidgetRequest = {
    admin_session_id: string;
    widget_name: string;
    extension_list: string[];
    file_list: string[];
    file_id: string;
    icon_file_id: string;
    weight: number;
};

export type AdminAddWidgetResponse = {
    code: number;
    err_msg: string;
    widget_id: string;
};


export type AdminUpdateWidgetRequest = {
    admin_session_id: string;
    widget_id: string;
    widget_name: string;
    extension_list: string[];
    file_list: string[];
};

export type AdminUpdateWidgetResponse = {
    code: number;
    err_msg: string;
};


export type AdminUpdateIconFileRequest = {
    admin_session_id: string;
    widget_id: string;
    icon_file_id: string;
};

export type AdminUpdateIconFileResponse = {
    code: number;
    err_msg: string;
};


export type AdminUpdateFileRequest = {
    admin_session_id: string;
    widget_id: string;
    file_id: string;
};

export type AdminUpdateFileResponse = {
    code: number;
    err_msg: string;
};

export type AdminUpdateWeightRequest = {
    admin_session_id: string;
    widget_id: string;
    weight: number;
};

export type AdminUpdateWeightResponse = {
    code: number;
    err_msg: string;
};

export type AdminRemoveWidgetRequest = {
    admin_session_id: string;
    widget_id: string;
};

export type AdminRemoveWidgetResponse = {
    code: number;
    err_msg: string;
};

// 上传插件
export async function add_widget(request: AdminAddWidgetRequest): Promise<AdminAddWidgetResponse> {
    const cmd = 'plugin:widget_store_admin_api|add_widget';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddWidgetResponse>(cmd, {
        request,
    });
}

// 更新插件信息
export async function update_widget(request: AdminUpdateWidgetRequest): Promise<AdminUpdateWidgetResponse> {
    const cmd = 'plugin:widget_store_admin_api|update_widget';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateWidgetResponse>(cmd, {
        request,
    });
}

// 更新icon
export async function update_icon_file(request: AdminUpdateIconFileRequest): Promise<AdminUpdateIconFileResponse> {
    const cmd = 'plugin:widget_store_admin_api|update_icon_file';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateIconFileResponse>(cmd, {
        request,
    });
}

// 更新文件
export async function update_file(request: AdminUpdateFileRequest): Promise<AdminUpdateFileResponse> {
    const cmd = 'plugin:widget_store_admin_api|update_file';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateFileResponse>(cmd, {
        request,
    });
}

//更新权重
export async function update_weight(request: AdminUpdateWeightRequest): Promise<AdminUpdateWeightResponse> {
    const cmd = 'plugin:widget_store_admin_api|update_weight';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateWeightResponse>(cmd, {
        request,
    });
}

// 删除插件
export async function remove_widget(request: AdminRemoveWidgetRequest): Promise<AdminRemoveWidgetResponse> {
    const cmd = 'plugin:widget_store_admin_api|remove_widget';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveWidgetResponse>(cmd, {
        request,
    });
}