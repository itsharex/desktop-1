//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';

export interface JihulabTag {
    name: string;
}

export async function list_tag(accessToken: string, repoId: number): Promise<JihulabTag[]> {
    const url = `https://jihulab.com/api/v4/projects/${repoId}/repository/tags?access_token=${accessToken}`;
    const res = await fetch<JihulabTag[]>(url, {
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