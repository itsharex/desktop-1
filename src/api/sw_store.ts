import { invoke } from '@tauri-apps/api/tauri';

export type OS_TYPE = number;
export const OS_WINDOWS: OS_TYPE = 0;
export const OS_MAC: OS_TYPE = 1;
export const OS_LINUX: OS_TYPE = 2;


export type SoftWareCateInfo = {
    cate_id: string;
    cate_name: string;
    weight: number;
    soft_ware_count: number;
    create_time: number;
    update_time: number;
};

export type SoftWareInfo = {
    sw_id: string;
    sw_name: string;
    sw_desc: string;
    cate_id: string;
    cate_name: string;
    weight: number;
    recommend: boolean;
    os_list: OS_TYPE[];
    download_url: string;
    icon_file_id: string;
    create_time: number;
    update_time: number;
};

export type ListSoftWareParam = {
    filterby_os_type: boolean;
    os_type: OS_TYPE;
    filter_by_cate_id: boolean;
    cate_id: string;
    filter_by_recommend: boolean;
    recommend: boolean;
};

export type ListCateRequest = {};

export type ListCateResponse = {
    code: number;
    err_msg: string;
    cate_list: SoftWareCateInfo[];
};


export type ListSoftWareRequest = {
    list_param: ListSoftWareParam;
    offset: number;
    limit: number;
};

export type ListSoftWareResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    soft_ware_list: SoftWareInfo[];
};


export type GetSoftWareRequest = {
    sw_id: string;
};

export type GetSoftWareResponse = {
    code: number;
    err_msg: string;
    soft_ware: SoftWareInfo;
};

//列出所有分类
export async function list_cate(request: ListCateRequest): Promise<ListCateResponse> {
    const cmd = 'plugin:sw_store_api|list_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListCateResponse>(cmd, {
        request,
    });
}

// 列出软件信息
export async function list_soft_ware(request: ListSoftWareRequest): Promise<ListSoftWareResponse> {
    const cmd = 'plugin:sw_store_api|list_soft_ware';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListSoftWareResponse>(cmd, {
        request,
    });
}

//获取单个软件信息
export async function get_soft_ware(request: GetSoftWareRequest): Promise<GetSoftWareResponse> {
    const cmd = 'plugin:sw_store_api|get_soft_ware';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetSoftWareResponse>(cmd, {
        request,
    });
}