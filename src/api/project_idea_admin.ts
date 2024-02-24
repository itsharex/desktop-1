import { invoke } from '@tauri-apps/api/tauri';
import type { BasicIdea, IdeaInStore, ListIdeaParam } from "./project_idea";

export type AdminCreateStoreCateRequest = {
    admin_session_id: string;
    name: string;
    weight: number;
};

export type AdminCreateStoreCateResponse = {
    code: number;
    err_msg: string;
    store_cate_id: string;
};

export type AdminUpdateStoreCateRequest = {
    admin_session_id: string;
    store_cate_id: string;
    name: string;
    weight: number;
};

export type AdminUpdateStoreCateResponse = {
    code: number;
    err_msg: string;
};

export type AdminRemoveStoreCateRequest = {
    admin_session_id: string;
    store_cate_id: string;
};

export type AdminRemoveStoreCateResponse = {
    code: number;
    err_msg: string;
};

export type AdminCreateStoreRequest = {
    admin_session_id: string;
    store_cate_id: string;
    name: string;
    weight: number;
};

export type AdminCreateStoreResponse = {
    code: number;
    err_msg: string;
    idea_store_id: string;
};

export type AdminUpdateStoreRequest = {
    admin_session_id: string;
    idea_store_id: string;
    name: string;
    weight: number;
};

export type AdminUpdateStoreResponse = {
    code: number;
    err_msg: string;
};

export type AdminMoveStoreRequest = {
    admin_session_id: string;
    idea_store_id: string;
    store_cate_id: string;
};

export type AdminMoveStoreResponse = {
    code: number;
    err_msg: string;
};

export type AdminRemoveStoreRequest = {
    admin_session_id: string;
    idea_store_id: string;
};

export type AdminRemoveStoreResponse = {
    code: number;
    err_msg: string;
};


export type AdminCreateIdeaRequest = {
    admin_session_id: string;
    idea_store_id: string;
    basic_info: BasicIdea;
};

export type AdminCreateIdeaResponse = {
    code: number;
    err_msg: string;
    idea_id: string;
};


export type AdminUpdateIdeaRequest = {
    admin_session_id: string;
    idea_id: string;
    basic_info: BasicIdea;
};

export type AdminUpdateIdeaResponse = {
    code: number;
    err_msg: string;
};

export type AdminMoveIdeaRequest = {
    admin_session_id: string;
    idea_id: string;
    idea_store_id: string;
};

export type AdminMoveIdeaResponse = {
    code: number;
    err_msg: string;
};

export type AdminRemoveIdeaRequest = {
    admin_session_id: string;
    idea_id: string;
};

export type AdminRemoveIdeaResponse = {
    code: number;
    err_msg: string;
};


export type AdminListIdeaRequest = {
    admin_session_id: string;
    list_param: ListIdeaParam;
    offset: number;
    limit: number;
};

export type AdminListIdeaResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    idea_list: IdeaInStore[];
};

export type AdminGetIdeaRequest = {
    admin_session_id: string;
    idea_id: string;
};

export type AdminGetIdeaResponse = {
    code: number;
    err_msg: string;
    idea: IdeaInStore;
};

//创建点子库类别
export async function create_store_cate(request: AdminCreateStoreCateRequest): Promise<AdminCreateStoreCateResponse> {
    const cmd = 'plugin:project_idea_admin_api|create_store_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminCreateStoreCateResponse>(cmd, {
        request,
    });
}

//更新点子库类别
export async function update_store_cate(request: AdminUpdateStoreCateRequest): Promise<AdminUpdateStoreCateResponse> {
    const cmd = 'plugin:project_idea_admin_api|update_store_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateStoreCateResponse>(cmd, {
        request,
    });
}

//删除点子库类别
export async function remove_store_cate(request: AdminRemoveStoreCateRequest): Promise<AdminRemoveStoreCateResponse> {
    const cmd = 'plugin:project_idea_admin_api|remove_store_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveStoreCateResponse>(cmd, {
        request,
    });
}

//创建点子库
export async function create_store(request: AdminCreateStoreRequest): Promise<AdminCreateStoreResponse> {
    const cmd = 'plugin:project_idea_admin_api|create_store';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminCreateStoreResponse>(cmd, {
        request,
    });
}

//更新点子库
export async function update_store(request: AdminUpdateStoreRequest): Promise<AdminUpdateStoreResponse> {
    const cmd = 'plugin:project_idea_admin_api|update_store';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateStoreResponse>(cmd, {
        request,
    });
}

//移动点子库
export async function move_store(request: AdminMoveStoreRequest): Promise<AdminMoveStoreResponse> {
    const cmd = 'plugin:project_idea_admin_api|move_store';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminMoveStoreResponse>(cmd, {
        request,
    });
}

//删除点子库
export async function remove_store(request: AdminRemoveStoreRequest): Promise<AdminRemoveStoreResponse> {
    const cmd = 'plugin:project_idea_admin_api|remove_store';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveStoreResponse>(cmd, {
        request,
    });
}

//创建点子
export async function create_idea(request: AdminCreateIdeaRequest): Promise<AdminCreateIdeaResponse> {
    const cmd = 'plugin:project_idea_admin_api|create_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminCreateIdeaResponse>(cmd, {
        request,
    });
}

//更新点子
export async function update_idea(request: AdminUpdateIdeaRequest): Promise<AdminUpdateIdeaResponse> {
    const cmd = 'plugin:project_idea_admin_api|update_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateIdeaResponse>(cmd, {
        request,
    });
}

//移动点子
export async function move_idea(request: AdminMoveIdeaRequest): Promise<AdminMoveIdeaResponse> {
    const cmd = 'plugin:project_idea_admin_api|move_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminMoveIdeaResponse>(cmd, {
        request,
    });
}

//删除点子
export async function remove_idea(request: AdminRemoveIdeaRequest): Promise<AdminRemoveIdeaResponse> {
    const cmd = 'plugin:project_idea_admin_api|remove_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveIdeaResponse>(cmd, {
        request,
    });
}

//列出点子
export async function list_idea(request: AdminListIdeaRequest): Promise<AdminListIdeaResponse> {
    const cmd = 'plugin:project_idea_admin_api|list_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminListIdeaResponse>(cmd, {
        request,
    });
}

//获取单个点子
export async function get_idea(request: AdminGetIdeaRequest): Promise<AdminGetIdeaResponse> {
    const cmd = 'plugin:project_idea_admin_api|get_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminGetIdeaResponse>(cmd, {
        request,
    });
}