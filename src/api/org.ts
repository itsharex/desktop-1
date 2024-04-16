import { invoke } from '@tauri-apps/api/tauri';
import type { MemberInfo } from "./org_mebmer";

export type BasicOrgInfo = {
    org_name: string;
    org_desc: string;
};

export type Setting = {
    enable_day_report: boolean;
    enble_week_report: boolean;
    enable_okr: boolean;
}

export type OrgInfo = {
    org_id: string;
    basic_info: BasicOrgInfo;
    create_time: number;
    update_time: number;
    owner_user_id: string;
    owner_display_name: string;
    owner_logo_uri: string;
    new_member_depart_ment_id: string;
    depart_ment_count: number;
    member_count: number;
    setting: Setting;
};

export type DepartMentInfo = {
    depart_ment_id: string;
    depart_ment_name: string;
    parent_depart_ment_id: string;
    create_time: number;
    create_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    update_time: number;
    sub_depart_ment_count: number;
    sub_member_count: number;
};

export type DepartMentOrMember = {
    type: "departMent" | "member";
    id: string;
    value: DepartMentInfo | MemberInfo | undefined;
};

export type CreateOrgRequest = {
    session_id: string;
    basic_info: BasicOrgInfo;
    setting: Setting;
};

export type CreateOrgResponse = {
    code: number;
    err_msg: string;
    org_id: string;
};


export type UpdateOrgRequest = {
    session_id: string;
    org_id: string;
    basic_info: BasicOrgInfo;
};

export type UpdateOrgResponse = {
    code: number;
    err_msg: string;
};

export type UpdateOrgSettingRequest = {
    session_id: string;
    org_id: string;
    setting: Setting;
};

export type UpdateOrgSettingResponse = {
    code: number;
    err_msg: string;
};

export type ListOrgRequest = {
    session_id: string;
};

export type ListOrgResponse = {
    code: number;
    err_msg: string;
    org_list: OrgInfo[];
};


export type GetOrgRequest = {
    session_id: string;
    org_id: string;
};

export type GetOrgResponse = {
    code: number;
    err_msg: string;
    org_info: OrgInfo;
};


export type RemoveOrgRequest = {
    session_id: string;
    org_id: string;
};

export type RemoveOrgResponse = {
    code: number;
    err_msg: string;
};


export type ChangeOrgOwnerRequest = {
    session_id: string;
    org_id: string;
    target_member_user_id: string;
};

export type ChangeOrgOwnerResponse = {
    code: number;
    err_msg: string;
};


export type CreateDepartMentRequest = {
    session_id: string;
    org_id: string;
    parent_depart_ment_id: string;
    depart_ment_name: string;
};

export type CreateDepartMentResponse = {
    code: number;
    err_msg: string;
    depart_ment_id: string;
};


export type UpdateDepartMentRequest = {
    session_id: string;
    org_id: string;
    depart_ment_id: string;
    depart_ment_name: string;
};

export type UpdateDepartMentResponse = {
    code: number;
    err_msg: string;
};


export type ListDepartMentRequest = {
    session_id: string;
    org_id: string;
};

export type ListDepartMentResponse = {
    code: number;
    err_msg: string;
    depart_ment_list: DepartMentInfo[];
};


export type GetDepartMentRequest = {
    session_id: string;
    org_id: string;
    depart_ment_id: string;
};

export type GetDepartMentResponse = {
    code: number;
    err_msg: string;
    depart_ment_info: DepartMentInfo;
};


export type RemoveDepartMentRequest = {
    session_id: string;
    org_id: string;
    depart_ment_id: string;
};

export type RemoveDepartMentResponse = {
    code: number;
    err_msg: string;
};


export type MoveDepartMentRequest = {
    session_id: string;
    org_id: string;
    depart_ment_id: string;
    parent_depart_ment_id: string;
};

export type MoveDepartMentResponse = {
    code: number;
    err_msg: string;
};

//创建组织
export async function create_org(request: CreateOrgRequest): Promise<CreateOrgResponse> {
    const cmd = 'plugin:org_api|create_org';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateOrgResponse>(cmd, {
        request,
    });
}

//更新组织
export async function update_org(request: UpdateOrgRequest): Promise<UpdateOrgResponse> {
    const cmd = 'plugin:org_api|update_org';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateOrgResponse>(cmd, {
        request,
    });
}

//更新组织设置
export async function update_org_setting(request: UpdateOrgSettingRequest): Promise<UpdateOrgSettingResponse> {
    const cmd = 'plugin:org_api|update_org_setting';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateOrgSettingResponse>(cmd, {
        request,
    });
}

//列出组织
export async function list_org(request: ListOrgRequest): Promise<ListOrgResponse> {
    const cmd = 'plugin:org_api|list_org';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListOrgResponse>(cmd, {
        request,
    });
}

//获取单个组织信息
export async function get_org(request: GetOrgRequest): Promise<GetOrgResponse> {
    const cmd = 'plugin:org_api|get_org';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetOrgResponse>(cmd, {
        request,
    });
}

//删除组织
export async function remove_org(request: RemoveOrgRequest): Promise<RemoveOrgResponse> {
    const cmd = 'plugin:org_api|remove_org';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveOrgResponse>(cmd, {
        request,
    });
}

//转让超级管理员
export async function change_org_owner(request: ChangeOrgOwnerRequest): Promise<ChangeOrgOwnerResponse> {
    const cmd = 'plugin:org_api|change_org_owner';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ChangeOrgOwnerResponse>(cmd, {
        request,
    });
}

//创建部门
export async function create_depart_ment(request: CreateDepartMentRequest): Promise<CreateDepartMentResponse> {
    const cmd = 'plugin:org_api|create_depart_ment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateDepartMentResponse>(cmd, {
        request,
    });
}

//更新部门
export async function update_depart_ment(request: UpdateDepartMentRequest): Promise<UpdateDepartMentResponse> {
    const cmd = 'plugin:org_api|update_depart_ment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateDepartMentResponse>(cmd, {
        request,
    });
}

//列出部门
export async function list_depart_ment(request: ListDepartMentRequest): Promise<ListDepartMentResponse> {
    const cmd = 'plugin:org_api|list_depart_ment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListDepartMentResponse>(cmd, {
        request,
    });
}

//获取单个部门信息
export async function get_depart_ment(request: GetDepartMentRequest): Promise<GetDepartMentResponse> {
    const cmd = 'plugin:org_api|get_depart_ment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDepartMentResponse>(cmd, {
        request,
    });
}

//删除部门
export async function remove_depart_ment(request: RemoveDepartMentRequest): Promise<RemoveDepartMentResponse> {
    const cmd = 'plugin:org_api|remove_depart_ment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveDepartMentResponse>(cmd, {
        request,
    });
}

//移动部门
export async function move_depart_ment(request: MoveDepartMentRequest): Promise<MoveDepartMentResponse> {
    const cmd = 'plugin:org_api|move_depart_ment';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<MoveDepartMentResponse>(cmd, {
        request,
    });
}