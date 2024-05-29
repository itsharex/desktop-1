//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';
import { get_username } from './common';

export interface GiteeBranch {
    name: string;
    protected: boolean;
}

export async function list_branch(accessToken: string, username: string, repoName: string): Promise<GiteeBranch[]> {
    const url = `https://gitee.com/api/v5/repos/${encodeURIComponent(get_username(username))}/${encodeURIComponent(repoName)}/branches?access_token=${accessToken}&sort=name&direction=asc&page=1&per_page=100
    `;
    const res = await fetch<GiteeBranch[]>(url, {
        method: "GET",
        timeout: 10,
    });
    console.log(res.data);
    if (res.ok && res.status == 200) {
        return res.data;
    } else {
        console.log(res);
        throw "error list branch";
    }
}