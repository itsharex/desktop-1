//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';

export interface GiteeRepo {
    id: number;
    full_name: string;
    human_name: string;
    url: string;
    path: string;
    name: string;
    private: boolean;
    public: boolean;
    html_url: string;
    ssh_url: string;
    description: string;
    default_branch: string;
}

export async function list_user_repo(accessToken: string, per_page: number, page: number): Promise<GiteeRepo[]> {
    const res = await fetch<GiteeRepo[]>(`https://gitee.com/api/v5/user/repos?access_token=${accessToken}&visibility=all&sort=updated&direction=desc&page=${page}&per_page=${per_page}`, {
        method: "GET",
        timeout: 10,
    });
    if (res.ok && res.status == 200) {
        return res.data;
    } else {
        console.log(res);
        throw "error list repo";
    }
}