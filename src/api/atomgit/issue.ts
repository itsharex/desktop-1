//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';
import { type AtomGitUser, get_username } from './common';

export interface ListAtomGitIssueParam {
    creator?: string; //创建用户uid
    assignee?: string; //负责人uid
    state: "open" | "closed" | "all"; //状态枚举
    sort: "created" | "updated"; // 排序
    direction: "asc" | "desc"; //排序方向
    page: number; // 页码(默认为1)
    per_page: number; //页面大小(默认 30,最大 100)
}

export interface AtomGitIssue {
    id: string;
    url: string;
    number: number;
    state: string; //状态
    title: string; //标题
    user: AtomGitUser;
    assignee: AtomGitUser;
    locked: boolean;
    repository_url: string;
    html_url: string;
    closed_at: string;
    created_at: string;
    updated_at: string;
}

export async function list_issue(accessToken: string, username: string, repoName: string, listParam: ListAtomGitIssueParam): Promise<AtomGitIssue[]> {
    const url = `https://api.atomgit.com/repos/${encodeURIComponent(get_username(username))}/${encodeURIComponent(repoName)}/issues?creator=${encodeURIComponent(listParam.creator ?? "")}&assignee=${encodeURIComponent(listParam.assignee ?? "")}&state=${listParam.state}&sort=${listParam.sort}&direction=${listParam.direction}&page=${listParam.page}&per_page=${listParam.per_page}`;
    const res = await fetch<AtomGitIssue[]>(url, {
        method: "GET",
        timeout: 10,
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    if (res.ok && res.status == 200) {
        return res.data;
    } else {
        console.log(res);
        throw "error list issue";
    }
}