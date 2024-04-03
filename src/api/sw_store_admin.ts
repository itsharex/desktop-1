import { invoke } from '@tauri-apps/api/tauri';
import type { OS_TYPE } from './sw_store';


export type AdminAddCateRequest = {
    admin_session_id: string;
    cate_name: string;
    weight: number;
};

export type AdminAddCateResponse = {
    code: number;
    err_msg: string;
    cate_id: string;
};


export type AdminUpdateCateRequest = {
    admin_session_id: string;
    cate_id: string;
    cate_name: string;
    weight: number;
};

export type AdminUpdateCateResponse = {
    code: number;
    err_msg: string;
};


export type AdminRemoveCateRequest = {
    admin_session_id: string;
    cate_id: string;
};

export type AdminRemoveCateResponse = {
    code: number;
    err_msg: string;
};


export type AdminAddSoftWareRequest = {
    admin_session_id: string;
    sw_name: string;
    sw_desc: string;
    cate_id: string;
    weight: number;
    recommend: boolean;
    os_list: OS_TYPE[];
    download_url: string;
    icon_file_id: string;
};

export type AdminAddSoftWareResponse = {
    code: number;
    err_msg: string;
    sw_id: string;
};


export type AdminUpdateSoftWareRequest = {
    admin_session_id: string;
    sw_id: string;
    sw_name: string;
    sw_desc: string;
    cate_id: string;
    weight: number;
    recommend: boolean;
    os_list: OS_TYPE[];
    download_url: string;
    icon_file_id: string;
};

export type AdminUpdateSoftWareResponse = {
    code: number;
    err_msg: string;
};


export type AdminRemoveSoftWareRequest = {
    admin_session_id: string;
    sw_id: string;
};

export type AdminRemoveSoftWareResponse = {
    code: number;
    err_msg: string;
};

// 增加分类
export async function add_cate(request: AdminAddCateRequest): Promise<AdminAddCateResponse> {
    const cmd = 'plugin:sw_store_admin_api|add_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddCateResponse>(cmd, {
        request,
    });
}

// 更新分类
export async function update_cate(request: AdminUpdateCateRequest): Promise<AdminUpdateCateResponse> {
    const cmd = 'plugin:sw_store_admin_api|update_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateCateResponse>(cmd, {
        request,
    });
}

// 删除分类
export async function remove_cate(request: AdminRemoveCateRequest): Promise<AdminRemoveCateResponse> {
    const cmd = 'plugin:sw_store_admin_api|remove_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveCateResponse>(cmd, {
        request,
    });
}

//增加软件
export async function add_soft_ware(request: AdminAddSoftWareRequest): Promise<AdminAddSoftWareResponse> {
    const cmd = 'plugin:sw_store_admin_api|add_soft_ware';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddSoftWareResponse>(cmd, {
        request,
    });
}

//更新软件
export async function update_soft_ware(request: AdminUpdateSoftWareRequest): Promise<AdminUpdateSoftWareResponse> {
    const cmd = 'plugin:sw_store_admin_api|update_soft_ware';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateSoftWareResponse>(cmd, {
        request,
    });
}

//删除软件
export async function remove_soft_ware(request: AdminRemoveSoftWareRequest): Promise<AdminRemoveSoftWareResponse> {
    const cmd = 'plugin:sw_store_admin_api|xx';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveSoftWareResponse>(cmd, {
        request,
    });
}