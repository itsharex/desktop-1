//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import type { RoleInfo, MemberInfo } from './project_member';

export type AdminListRoleRequest = {
    admin_session_id: string;
    project_id: string;
};

export type AdminListRoleResponse = {
    code: number;
    err_msg: string;
    role_info_list: RoleInfo[];
};


export type AdminListRequest = {
    admin_session_id: string;
    project_id: string;
};

export type AdminListResponse = {
    code: number;
    err_msg: string;
    member_info_list: MemberInfo[];
};

//列出项目角色
export async function list_role(request: AdminListRoleRequest): Promise<AdminListRoleResponse> {
    const cmd = 'plugin:project_member_admin_api|list_role';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminListRoleResponse>(cmd, {
        request,
    });
}

//列出项目成员
export async function list(request: AdminListRequest): Promise<AdminListResponse> {
    const cmd = 'plugin:project_member_admin_api|list';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminListResponse>(cmd, {
        request,
    });
}