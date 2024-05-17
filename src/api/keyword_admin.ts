//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type KeywordInfo ={
    keyword: string;
    time_stamp: number;
};

export type AdminAddRequest ={
    admin_session_id: string;
    keyword: string;
};

export type AdminAddResponse ={
    code: number;
    err_msg: string;
};

export type AdminListRequest ={
    admin_session_id: string;
    filter_by_search_str: boolean;
    search_str: string;
    offset: number;
    limit: number;
};

export type AdminListResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    keyword_list: KeywordInfo[];
};

export type AdminRemoveRequest = {
    admin_session_id: string;
    keyword: string;
};

export type AdminRemoveResponse ={
    code: number;
    err_msg: string;
};

export type AdminTestRequest = {
    admin_session_id: string;
    content: string;
};

export type AdminTestResponse = {
    code: number;
    err_msg: string;
    keyword_list: string[];
}

//新增关键词
export async function add(request: AdminAddRequest): Promise<AdminAddResponse> {
    const cmd = 'plugin:keyword_admin_api|add';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddResponse>(cmd, {
        request,
    });
}

//列出关键词
export async function list(request: AdminListRequest): Promise<AdminListResponse> {
    const cmd = 'plugin:keyword_admin_api|list';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminListResponse>(cmd, {
        request,
    });
}

//删除关键词
export async function remove(request: AdminRemoveRequest): Promise<AdminRemoveResponse> {
    const cmd = 'plugin:keyword_admin_api|remove';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveResponse>(cmd, {
        request,
    });
}

//测试关键词
export async function test(request: AdminTestRequest): Promise<AdminTestResponse> {
    const cmd = 'plugin:keyword_admin_api|test';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminTestResponse>(cmd, {
        request,
    });
}