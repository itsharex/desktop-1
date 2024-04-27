//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { fetch } from '@tauri-apps/api/http';

export interface AtomGitOrg {
    login: string;
    id: string;
    url: string;
    repos_url: string;
    events_url: string;
    hooks_url: string;
    issues_url: string;
    members_url: string;
    public_members_url: string;
    avatar_url: string;
    description: string;
}

export async function list_user_org(accessToken: string):Promise<AtomGitOrg[]> {
    const res = await fetch<AtomGitOrg[]>(`https://api.atomgit.com/user/orgs`,{
        method:"GET",
        timeout:10,
        headers:{
            "Authorization":`Bearer ${accessToken}`,
        },
    });
    if(res.ok && res.status == 200){
        return res.data;
    }else{
        console.log(res);
        throw "error list org";
    }
}