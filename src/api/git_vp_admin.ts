//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import type { GitVpSourceInfo } from './git_vp';

export type AdminGetSecretRequest = {
    admin_session_id: string;
    vp_source_id: string;
};

export type AdminGetSecretResponse = {
    code: number;
    err_msg: string;
    secret: string;
};

export type AdminRenewSecretRequest = {
    admin_session_id: string;
    vp_source_id: string;
};

export type AdminRenewSecretResponse = {
    code: number;
    err_msg: string;
    secret: string;
};

export type AdminAddGitVpSourceRequest = {
    admin_session_id: string;
    vp_source_info: GitVpSourceInfo;
};

export type AdminAddGitVpSourceResponse = {
    code: number;
    err_msg: string;
};

export type AdminUpdateGitVpSourceRequest = {
    admin_session_id: string;
    vp_source_info: GitVpSourceInfo;
};

export type AdminUpdateGitVpSourceResponse = {
    code: number;
    err_msg: string;
};

export type AdminRemoveGitVpSourceRequest = {
    admin_session_id: string;
    vp_source_id: string;
};

export type AdminRemoveGitVpSourceResponse = {
    code: number;
    err_msg: string;
};

export type AdminRemoveGitVpRequest = {
    admin_session_id: string;
    vp_source_id: string;
    web_url: string;
};

export type AdminRemoveGitVpResponse = {
    code: number;
    err_msg: string;
};

//获取secret
export async function get_secret(request: AdminGetSecretRequest): Promise<AdminGetSecretResponse> {
    const cmd = 'plugin:git_vp_admin_api|get_secret';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminGetSecretResponse>(cmd, {
        request,
    });
}

//重新生成secret
export async function renew_secret(request: AdminRenewSecretRequest): Promise<AdminRenewSecretResponse> {
    const cmd = 'plugin:git_vp_admin_api|renew_secret';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRenewSecretResponse>(cmd, {
        request,
    });
}

//增加VpSource
export async function add_git_vp_source(request: AdminAddGitVpSourceRequest): Promise<AdminAddGitVpSourceResponse> {
    const cmd = 'plugin:git_vp_admin_api|add_git_vp_source';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddGitVpSourceResponse>(cmd, {
        request,
    });
}

//更新VpSource
export async function update_git_vp_source(request: AdminUpdateGitVpSourceRequest): Promise<AdminUpdateGitVpSourceResponse> {
    const cmd = 'plugin:git_vp_admin_api|update_git_vp_source';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateGitVpSourceResponse>(cmd, {
        request,
    });
}

//删除VpSource
export async function remove_git_vp_source(request: AdminRemoveGitVpSourceRequest): Promise<AdminRemoveGitVpSourceResponse> {
    const cmd = 'plugin:git_vp_admin_api|remove_git_vp_source';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveGitVpSourceResponse>(cmd, {
        request,
    });
}

//删除Vp
export async function remove_git_vp(request: AdminRemoveGitVpRequest): Promise<AdminRemoveGitVpResponse> {
    const cmd = 'plugin:git_vp_admin_api|remove_git_vp';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveGitVpResponse>(cmd, {
        request,
    });
}