//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

export function get_username(username: string): string {
    if (username.startsWith("atomgit:")) {
        return username.substring("atomgit:".length);
    }
    return username;
}

export interface AtomGitUser {
    id: string;
    login: string;
    url: string;
    avatar_url: string;
    html_url: string;
    type: "User" | "Bot";
}