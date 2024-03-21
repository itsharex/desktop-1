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