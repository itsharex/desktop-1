//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import type { AdminPermInfo } from './admin_auth';

export type AdminUserInfo = {
    user_name: string;
    user_desc: string;
    pub_key: string;
    perm_info: AdminPermInfo;
};

export type AdminAddUserRequest = {
    admin_session_id: string;
    user_name: string;
    user_desc: string;
    pub_key: string;
    perm_info: AdminPermInfo;
};

export type AdminAddUserResponse = {
    code: number;
    err_msg: string;
};

export type AdminUpdateUserPubKeyRequest = {
    admin_session_id: string;
    user_name: string;
    pub_key: string;
};

export type AdminUpdateUserPubKeyResponse = {
    code: number;
    err_msg: string;
};

export type AdminUpdateUserPermRequest = {
    admin_session_id: string;
    user_name: string;
    perm_info: AdminPermInfo;
};

export type AdminUpdateUserPermResponse = {
    code: number;
    err_msg: string;
};

export type AdminUpdateUserDescRequest = {
    admin_session_id: string;
    user_name: string;
    user_desc: string;
};

export type AdminUpdateUserDescResponse = {
    code: number;
    err_msg: string;
};

export type AdminListUserRequest = {
    admin_session_id: string;
    offset: number;
    limit: number;
};

export type AdminListUserResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    admin_user_list: AdminUserInfo[];
};

export type AdminGetUserRequest = {
    admin_session_id: string;
    user_name: string;
};

export type AdminGetUserResponse = {
    code: number;
    err_msg: string;
    admin_user: AdminUserInfo;
};

export type AdminRemoveUserRequest = {
    admin_session_id: string;
    user_name: string;
};

export type AdminRemoveUserResponse = {
    code: number;
    err_msg: string;
};

//创建用户
export async function add_user(request: AdminAddUserRequest): Promise<AdminAddUserResponse> {
    const cmd = 'plugin:admin_auth_admin_api|add_user';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddUserResponse>(cmd, {
        request,
    });
}

//更新用户公钥
export async function update_user_pub_key(request: AdminUpdateUserPubKeyRequest): Promise<AdminUpdateUserPubKeyResponse> {
    const cmd = 'plugin:admin_auth_admin_api|update_user_pub_key';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateUserPubKeyResponse>(cmd, {
        request,
    });
}

//更新用户权限
export async function update_user_perm(request: AdminUpdateUserPermRequest): Promise<AdminUpdateUserPermResponse> {
    const cmd = 'plugin:admin_auth_admin_api|update_user_perm';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateUserPermResponse>(cmd, {
        request,
    });
}

//更新用户备注
export async function update_user_desc(request: AdminUpdateUserDescRequest): Promise<AdminUpdateUserDescResponse> {
    const cmd = 'plugin:admin_auth_admin_api|update_user_desc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateUserDescResponse>(cmd, {
        request,
    });
}

//列出用户
export async function list_user(request: AdminListUserRequest): Promise<AdminListUserResponse> {
    const cmd = 'plugin:admin_auth_admin_api|list_user';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminListUserResponse>(cmd, {
        request,
    });
}

//获取单个用户
export async function get_user(request: AdminGetUserRequest): Promise<AdminGetUserResponse> {
    const cmd = 'plugin:admin_auth_admin_api|get_user';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminGetUserResponse>(cmd, {
        request,
    });
}

//删除用户
export async function remove_user(request: AdminRemoveUserRequest): Promise<AdminRemoveUserResponse> {
    const cmd = 'plugin:admin_auth_admin_api|remove_user';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveUserResponse>(cmd, {
        request,
    });
}