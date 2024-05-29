//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';
import { type GiteeUser, get_username } from './common';

export interface GiteeIssue {
    id: number;
    url: string;
    state: string; //状态
    title: string; //标题
    user: GiteeUser;
    assignee: GiteeUser;
    assigner: GiteeUser;
    pushed_at: string;
    created_at: string;
    updated_at: string;
    html_url: string;
}




export async function list_issue(accessToken: string, username: string, repoName: string):Promise<GiteeIssue[]> {
    const url = `https://gitee.com/api/v5/repos/${encodeURIComponent(get_username(username))}/${encodeURIComponent(repoName)}/issues?access_token=${accessToken}&state=all&sort=updated&direction=desc&page=1&per_page=100
    `;
    console.log(url);
    const res = await fetch<GiteeIssue[]>(url, {
        method: "GET",
        timeout: 10,
    });
    // console.log(res.data);
    if (res.ok && res.status == 200) {
        return res.data;
    } else {
        console.log(res);
        throw "error list issue";
    }
}