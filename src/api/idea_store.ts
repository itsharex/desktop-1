import { invoke } from '@tauri-apps/api/tauri';

export type BasicIdea = {
    title: string;
    content: string;
    keyword_list: string[];
};

export type IdeaStoreCate = {
    store_cate_id: string;
    name: string;
    weight: number;
    store_count: number;
};

export type IdeaStore = {
    idea_store_id: string;
    name: string;
    weight: number;
    idea_count: number;
    store_cate_id: string;
};

export type IdeaInStore = {
    idea_id: string;
    basic_info: BasicIdea;
    idea_store_id: string;
};

export type ListIdeaParam = {
    filter_by_store_id: boolean;
    store_id: string;
    filter_by_title_keyword: boolean;
    title_keyword: string;
};

export type ListStoreCateRequest = {};

export type ListStoreCateResponse = {
    code: number;
    err_msg: string;
    cate_list: IdeaStoreCate[];
};


export type ListStoreRequest = {
    filter_by_store_cate_id: boolean;
    store_cate_id: string;
}

export type ListStoreResponse = {
    code: number;
    err_msg: string;
    store_list: IdeaStore[];
}

//列出点子库类别
export async function list_store_cate(request: ListStoreCateRequest): Promise<ListStoreCateResponse> {
    const cmd = 'plugin:idea_store_api|list_store_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListStoreCateResponse>(cmd, {
        request,
    });
}

//列出点子库
export async function list_store(request: ListStoreRequest): Promise<ListStoreResponse> {
    const cmd = 'plugin:idea_store_api|list_store';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListStoreResponse>(cmd, {
        request,
    });
}