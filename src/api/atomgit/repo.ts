import { fetch } from '@tauri-apps/api/http';
import { get_username } from './common';

export interface AtomGitRepo {
    private: boolean; //是否为私有库
    id: number; //代码库Id
    full_name: string;//代码库绝对路径
    name: string;//代码库名称
    description: string;//代码库描述
    default_branch: string;//代码库默认分支
    git_url: string;//代码库ssh clone地址
    html_url: string;//代码库http clone地址
}

export async function list_user_repo(accessToken: string, username: string, per_page: number, page: number): Promise<AtomGitRepo[]> {
    const res = await fetch<AtomGitRepo[]>(`https://api.atomgit.com/users/${encodeURIComponent(get_username(username))}/repos?per_page=${per_page}&page=${page}`, {
        method: "GET",
        timeout: 10,
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    if (res.ok && res.status == 200) {
        console.log("xxxxxxxxxx",res.data);
        return res.data;
    } else {
        console.log(res);
        throw "error list repo";
    }
}

export async function list_org_repo(accessToken: string, orgname: string, per_page: number, page: number): Promise<AtomGitRepo[]> {
    const res = await fetch<AtomGitRepo[]>(`https://api.atomgit.com/orgs/${encodeURIComponent(get_username(orgname))}/repos?per_page=${per_page}&page=${page}`, {
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
        throw "error list repo";
    }
}