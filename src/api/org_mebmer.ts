import { invoke } from '@tauri-apps/api/tauri';

export type InviteInfo = {
    invite_code: string;
    create_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    create_time: number;
    expire_time: number;
};

export type MemberInfo = {
    org_id: string;
    member_user_id: string;
    create_time: number;
    parent_depart_ment_id: string;
    display_name: string;
    logo_uri: string;
};

export type GenInviteRequest = {
    session_id: string;
    org_id: string;
    ttl: number; //单位小时
};

export type GenInviteResponse = {
    code: number;
    err_msg: string;
    invite_code: string;
};


export type ListInviteRequest = {
    session_id: string;
    org_id: string;
    offset: number;
    limit: number;
};

export type ListInviteResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    invite_info_list: InviteInfo[];
};


export type RemoveInviteRequest = {
    session_id: string;
    org_id: string;
    invite_code: string;
};

export type RemoveInviteResponse = {
    code: number;
    err_msg: string;
};


export type JoinRequest = {
    session_id: string;
    invite_code: string;
};

export type JoinResponse = {
    code: number;
    err_msg: string;
    org_id: string;
};


export type LeaveRequest = {
    session_id: string;
    org_id: string;
};

export type LeaveResponse = {
    code: number;
    err_msg: string;
};


export type RemoveMemberRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
};

export type RemoveMemberResponse = {
    code: number;
    err_msg: string;
};


export type MoveMemberRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
    parent_depart_ment_id: string;
};

export type MoveMemberResponse = {
    code: number;
    err_msg: string;
};


export type ListMemberRequest = {
    session_id: string;
    org_id: string;
};

export type ListMemberResponse = {
    code: number;
    err_msg: string;
    member_list: MemberInfo[];
};


export type GetMemberRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
};

export type GetMemberResponse = {
    code: number;
    err_msg: string;
    member: MemberInfo;
};

//创建邀请码
export async function gen_invite(request: GenInviteRequest): Promise<GenInviteResponse> {
    const cmd = 'plugin:org_member_api|gen_invite';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GenInviteResponse>(cmd, {
        request,
    });
}

//列出邀请信息
export async function list_invite(request: ListInviteRequest): Promise<ListInviteResponse> {
    const cmd = 'plugin:org_member_api|list_invite';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListInviteResponse>(cmd, {
        request,
    });
}

//删除邀请信息
export async function remove_invite(request: RemoveInviteRequest): Promise<RemoveInviteResponse> {
    const cmd = 'plugin:org_member_api|remove_invite';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveInviteResponse>(cmd, {
        request,
    });
}

//加入组织
export async function join(request: JoinRequest): Promise<JoinResponse> {
    const cmd = 'plugin:org_member_api|join';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<JoinResponse>(cmd, {
        request,
    });
}

//离开组织
export async function leave(request: LeaveRequest): Promise<LeaveResponse> {
    const cmd = 'plugin:org_member_api|leave';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<LeaveResponse>(cmd, {
        request,
    });
}

//删除成员
export async function remove_member(request: RemoveMemberRequest): Promise<RemoveMemberResponse> {
    const cmd = 'plugin:org_member_api|remove_member';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveMemberResponse>(cmd, {
        request,
    });
}

//移动成员
export async function move_member(request: MoveMemberRequest): Promise<MoveMemberResponse> {
    const cmd = 'plugin:org_member_api|move_member';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<MoveMemberResponse>(cmd, {
        request,
    });
}

//列出成员
export async function list_member(request: ListMemberRequest): Promise<ListMemberResponse> {
    const cmd = 'plugin:org_member_api|list_member';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListMemberResponse>(cmd, {
        request,
    });
}

//获取单个成员信息
export async function get_member(request: GetMemberRequest): Promise<GetMemberResponse> {
    const cmd = 'plugin:org_member_api|get_member';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetMemberResponse>(cmd, {
        request,
    });
}