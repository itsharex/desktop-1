//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import type { OrgInfo,BasicOrgInfo } from './org';


export type AdminListRequest = {
    admin_session_id: string;
    filter_by_user_id: boolean;
    user_id: string;
    filter_by_keyword: boolean;
    keyword: string;
    offset:number;
    limit:number;
};

export type AdminListResponse = {
    code: number;
    err_msg: string;
    total_count:number;
    org_list: OrgInfo[];
};


export type AdminGetRequest = {
    admin_session_id: string;
    org_id: string;
};

export type AdminGetResponse = {
    code: number;
    err_msg: string;
    org_info: OrgInfo;
};

export type AdminUpdateRequest = {
    admin_session_id: string;
    org_id: string;
    basic_info: BasicOrgInfo;
};

export type AdminUpdateResponse = {
    code: number;
    err_msg: string;
};


//列出组织
export async function list(request: AdminListRequest): Promise<AdminListResponse> {
    const cmd = 'plugin:org_admin_api|list';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminListResponse>(cmd, {
        request,
    });
}


//获取单个组织信息
export async function get(request: AdminGetRequest): Promise<AdminGetResponse> {
    const cmd = 'plugin:org_admin_api|get';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminGetResponse>(cmd, {
        request,
    });
}


//更新组织
export async function update(request: AdminUpdateRequest): Promise<AdminUpdateResponse> {
    const cmd = 'plugin:org_admin_api|update';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateResponse>(cmd, {
        request,
    });
}