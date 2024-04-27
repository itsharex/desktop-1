//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { uniqId } from '@/utils/utils';
import { invoke } from '@tauri-apps/api/tauri';

export type OkrItemInfo = {
    objective: string;
    key_result_list: string[];
};

export type KeyResultWithId = {
    id: string;
    key_result: string;
};

export type OkrItemInfoWithId = {
    id: string;
    objective: string;
    key_result_list: KeyResultWithId[];
};

export type OkrInfo = {
    okr_id: string;
    org_id: string;
    member_user_id: string;
    member_display_name: string;
    member_logo_uri: string;
    okr_item_list: OkrItemInfo[];
    start_time: number;
    end_time: number;
    create_time: number;
    update_time: number;
};

export type OkrInfoWithId = {
    okr_id: string;
    org_id: string;
    member_user_id: string;
    member_display_name: string;
    member_logo_uri: string;
    okr_item_list: OkrItemInfoWithId[];
    start_time: number;
    end_time: number;
    create_time: number;
    update_time: number;
};

export type CreateRequest = {
    session_id: string;
    org_id: string;
    okr_item_list: OkrItemInfo[];
    start_time: number;
    end_time: number;
};

export type CreateResponse = {
    code: number;
    err_msg: string;
    okr_id: string;
};


export type UpdateRequest = {
    session_id: string;
    org_id: string;
    okr_id: string;
    okr_item_list: OkrItemInfo[];
    start_time: number;
    end_time: number;
};

export type UpdateResponse = {
    code: number;
    err_msg: string;
};

export type ListRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
    offset: number;
    limit: number;
};

export type ListResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    okr_list: OkrInfo[];
};


export type GetRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
    okr_id: string;
};

export type GetResponse = {
    code: number;
    err_msg: string;
    okr: OkrInfo;
};


export type RemoveRequest = {
    session_id: string;
    org_id: string;
    okr_id: string;
}

export type RemoveResponse = {
    code: number;
    err_msg: string;
}

//对okr增加id
export function convert_okr_info(okr: OkrInfo): OkrInfoWithId {
    const okrItemList = [] as OkrItemInfoWithId[];
    for (const okrItem of okr.okr_item_list) {
        okrItemList.push({
            id: uniqId(),
            objective: okrItem.objective,
            key_result_list: okrItem.key_result_list.map(keyResult => (
                {
                    id: uniqId(),
                    key_result: keyResult,
                }
            ))
        });
    }

    return {
        okr_id: okr.okr_id,
        org_id: okr.org_id,
        member_user_id: okr.member_user_id,
        member_display_name: okr.member_display_name,
        member_logo_uri: okr.member_logo_uri,
        okr_item_list: okrItemList,
        start_time: okr.start_time,
        end_time: okr.end_time,
        create_time: okr.create_time,
        update_time: okr.update_time,
    };
}

//创建okr
export async function create(request: CreateRequest): Promise<CreateResponse> {
    const cmd = 'plugin:org_okr_api|create';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateResponse>(cmd, {
        request,
    });
}

//更新okr
export async function update(request: UpdateRequest): Promise<UpdateResponse> {
    const cmd = 'plugin:org_okr_api|update';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateResponse>(cmd, {
        request,
    });
}

//列出okr
export async function list(request: ListRequest): Promise<ListResponse> {
    const cmd = 'plugin:org_okr_api|list';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListResponse>(cmd, {
        request,
    });
}

//获取单个okr
export async function get(request: GetRequest): Promise<GetResponse> {
    const cmd = 'plugin:org_okr_api|get';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetResponse>(cmd, {
        request,
    });
}

//删除okr
export async function remove(request: RemoveRequest): Promise<RemoveResponse> {
    const cmd = 'plugin:org_okr_api|remove';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveResponse>(cmd, {
        request,
    });
}