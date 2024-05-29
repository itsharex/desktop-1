//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';
import { get_username } from './common';

export interface GiteeTag {
    name: string;
}

export async function list_tag(accessToken: string, username: string, repoName: string): Promise<GiteeTag[]> {
    const url = `https://gitee.com/api/v5/repos/${encodeURIComponent(get_username(username))}/${encodeURIComponent(repoName)}/tags?access_token=${accessToken}&sort=name&direction=asc&page=1&per_page=100`;
    const res = await fetch<GiteeTag[]>(url, {
        method: "GET",
        timeout: 10,
    });
    if (res.ok && res.status == 200) {
        return res.data;
    } else {
        console.log(res);
        throw "error list tag";
    }
}