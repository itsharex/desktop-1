//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type RESOURCE_TYPE = number;
export const RESOURCE_ARTICLE: RESOURCE_TYPE = 0;
export const RESOURCE_VIDEO: RESOURCE_TYPE = 1;
export const RESOURCE_MANUAL: RESOURCE_TYPE = 2;  //参考手册
export const RESOURCE_EVAL: RESOURCE_TYPE = 3;    //能力评测

export type ResourceInfo = {
    resource_id: string;
    resource_type: RESOURCE_TYPE;
    title: string;
    link_url: string;
    weight: number;
    cate_id: string;
    cate_name: string;
    create_time: number;
    update_time: number;
};

export type ListRequest = {
    session_id: string;
    cate_id: string;
};

export type ListResponse = {
    code: number;
    err_msg: string;
    resource_list: ResourceInfo[];
};

export type GetRequest = {
    session_id: string;
    cate_id: string;
    resource_id: string;
};

export type GetResponse = {
    code: number;
    err_msg: string;
    resource: ResourceInfo;
};

//列出资源
export async function list(request: ListRequest): Promise<ListResponse> {
    const cmd = 'plugin:skill_resource_api|list';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListResponse>(cmd, {
        request,
    });
}

//获取单个资源
export async function get(request: GetRequest): Promise<GetResponse> {
    const cmd = 'plugin:skill_resource_api|get';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetResponse>(cmd, {
        request,
    });
}