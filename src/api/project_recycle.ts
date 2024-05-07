//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type RECYCLE_ITEM_TYPE = number;
export const RECYCLE_ITEM_IDEA: RECYCLE_ITEM_TYPE = 0;
export const RECYCLE_ITEM_REQUIREMENT: RECYCLE_ITEM_TYPE = 1;
export const RECYCLE_ITEM_TASK: RECYCLE_ITEM_TYPE = 2;
export const RECYCLE_ITEM_BUG: RECYCLE_ITEM_TYPE = 3;
export const RECYCLE_ITEM_TESTCASE: RECYCLE_ITEM_TYPE = 4;
export const RECYCLE_ITEM_BULLETIN: RECYCLE_ITEM_TYPE = 5;
export const RECYCLE_ITEM_SPRIT: RECYCLE_ITEM_TYPE = 10;
export const RECYCLE_ITEM_DOC: RECYCLE_ITEM_TYPE = 11;
export const RECYCLE_ITEM_PAGES: RECYCLE_ITEM_TYPE = 12;
export const RECYCLE_ITEM_BOARD: RECYCLE_ITEM_TYPE = 13;
export const RECYCLE_ITEM_FILE: RECYCLE_ITEM_TYPE = 14;
export const RECYCLE_ITEM_API_COLL: RECYCLE_ITEM_TYPE = 15;
export const RECYCLE_ITEM_DATA_ANNO: RECYCLE_ITEM_TYPE = 16;

export const RECYCLE_ITEM_ALL: RECYCLE_ITEM_TYPE = 999; //全部

export type RecycleItemInfo = {
    recycle_item_id: string;
    recycle_item_type: RECYCLE_ITEM_TYPE;
    title: string;
    remove_user_id: string;
    remove_display_name: string;
    remove_logo_uri: string;
    remove_time: number;
};

export type ListRequest = {
    session_id: string;
    project_id: string;
    filter_by_item_type: boolean;
    item_type: RECYCLE_ITEM_TYPE;
    offset: number;
    limit: number;
};

export type ListResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    item_list: RecycleItemInfo[];
};

export type RecoverRequest = {
    session_id: string;
    project_id: string;
    recycle_item_id: string;
};

export type RecoverResponse = {
    code: number;
    err_msg: string;
};

export type RemoveRequest = {
    session_id: string;
    project_id: string;
    recycle_item_id: string;
};

export type RemoveResponse = {
    code: number;
    err_msg: string;
};

export type ClearRequest = {
    session_id: string;
    project_id: string;
    recycle_item_type_list: RECYCLE_ITEM_TYPE[],
}

export type ClearResponse = {
    code: number;
    err_msg: string;
}

//列出删除项
export async function list(request: ListRequest): Promise<ListResponse> {
    const cmd = 'plugin:project_recycle_api|list';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListResponse>(cmd, {
        request,
    });
}

//恢复删除项
export async function recover(request: RecoverRequest): Promise<RecoverResponse> {
    const cmd = 'plugin:project_recycle_api|recover';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RecoverResponse>(cmd, {
        request,
    });
}

//永久删除
export async function remove(request: RemoveRequest): Promise<RemoveResponse> {
    const cmd = 'plugin:project_recycle_api|remove';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveResponse>(cmd, {
        request,
    });
}

//清空回收站
export async function clear(request: ClearRequest): Promise<ClearResponse> {
    const cmd = 'plugin:project_recycle_api|clear';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ClearResponse>(cmd, {
        request,
    });
}

