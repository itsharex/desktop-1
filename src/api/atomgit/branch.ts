import { fetch } from '@tauri-apps/api/http';
import { get_username } from './common';

export interface AtomGitBranch {
    name: string;
    protected: boolean;
}

export async function list_branch(accessToken: string, username: string, repoName: string): Promise<AtomGitBranch[]> {
    const url = `https://api.atomgit.com/repos/${encodeURIComponent(get_username(username))}/${encodeURIComponent(repoName)}/branches`;
    const res = await fetch<AtomGitBranch[]>(url, {
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
        throw "error list branch";
    }
}