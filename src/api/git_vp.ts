//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type VP_SORT_BY = number;
export const VP_SORT_BY_TIMESTAMP: VP_SORT_BY = 0;
export const VP_SORT_BY_STAR_COUNT: VP_SORT_BY = 1;
export const VP_SORT_BY_FORK_COUNT: VP_SORT_BY = 2;

export type GitVpSourceInfo = {
    git_vp_source_id: string;
    weight: number;
};

export type GitVpInfo = {
    web_url: string;
    logo_url: string;
    name: string;
    desc: string;
    git_ssh_url: string;
    git_http_url: string;
    site_url: string;
    star_count: number;
    fork_count: number;
    branch_count: number;
    tag_count: number;
    release_count: number;

    time_stamp: number;
    not_repo: boolean;
};

export type ListGitVpSourceRequest = {};

export type ListGitVpSourceResponse = {
    code: number;
    err_msg: string;
    vp_source_list: GitVpSourceInfo[];
};

export type ListGitVpRequest = {
    git_vp_source_id: string;
    sort_by: VP_SORT_BY;
    offset: number;
    limit: number;
};

export type ListGitVpResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    vp_list: GitVpInfo[];
};

//列出数据来源
export async function list_git_vp_source(request: ListGitVpSourceRequest): Promise<ListGitVpSourceResponse> {
    const cmd = 'plugin:git_vp_api|list_git_vp_source';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListGitVpSourceResponse>(cmd, {
        request,
    });
}

//列出Git仓库
export async function list_git_vp(request: ListGitVpRequest): Promise<ListGitVpResponse> {
    const cmd = 'plugin:git_vp_api|list_git_vp';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListGitVpResponse>(cmd, {
        request,
    });
}