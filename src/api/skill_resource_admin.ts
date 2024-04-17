import { invoke } from '@tauri-apps/api/tauri';
import type { RESOURCE_TYPE } from './skill_resource';

export type AdminAddRequest ={
    admin_session_id: string;
    cate_id: string;
    resource_type: RESOURCE_TYPE;
    title: string;
    link_url: string;
    weight: number;
};

export type AdminAddResponse ={
    code: number;
    err_msg: string;
    resource_id: string;
};

export type AdminUpdateRequest ={
    admin_session_id: string;
    resource_id: string;
    cate_id: string;
    resource_type: RESOURCE_TYPE;
    title: string;
    link_url: string;
    weight: number;
};

export type AdminUpdateResponse ={
    code: number;
    err_msg: string;
};

export type AdminRemoveRequest ={
    admin_session_id: string;
    resource_id: string;
    cate_id: string;
};

export type AdminRemoveResponse ={
    code: number;
    err_msg: string;
};

//增加资源
export async function add(request: AdminAddRequest): Promise<AdminAddResponse> {
    const cmd = 'plugin:skill_resource_admin_api|add';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddResponse>(cmd, {
        request,
    });
}

//更新资源
export async function update(request: AdminUpdateRequest): Promise<AdminUpdateResponse> {
    const cmd = 'plugin:skill_resource_admin_api|update';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateResponse>(cmd, {
        request,
    });
}

//删除资源
export async function remove(request: AdminRemoveRequest): Promise<AdminRemoveResponse> {
    const cmd = 'plugin:skill_resource_admin_api|remove';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveResponse>(cmd, {
        request,
    });
}