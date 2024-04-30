//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';
import { get_username } from './common';

export interface AtomGitTag {
    name: string;
}

export async function list_tag(accessToken: string, username: string, repoName: string): Promise<AtomGitTag[]> {
    const url = `https://api.atomgit.com/repos/${encodeURIComponent(get_username(username))}/${encodeURIComponent(repoName)}/tags`;
    const res = await fetch<AtomGitTag[]>(url, {
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
        throw "error list tag";
    }
}