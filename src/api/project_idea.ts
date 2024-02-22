import { invoke } from '@tauri-apps/api/tauri';

export type APPRAISE_TYPE = number;
export const APPRAISE_AGREE: APPRAISE_TYPE = 0;
export const APPRAISE_DIS_AGREE: APPRAISE_TYPE = 1;

export type IDEA_SORT_TYPE = number;
export const IDEA_SORT_UPDATE_TIME: IDEA_SORT_TYPE = 0;
export const IDEA_SORT_APPRAISE: IDEA_SORT_TYPE = 1;

export type KEYWORD_SEARCH_TYPE = number;
export const KEYWORD_SEARCH_AND: KEYWORD_SEARCH_TYPE = 0;
export const KEYWORD_SEARCH_OR: KEYWORD_SEARCH_TYPE = 1;


export type BasicIdea = {
    title: string;
    content: string;
    keyword_list: string[];
};

export type UserPerm = {
    can_update: boolean;
    can_remove: boolean;
    can_appraise: boolean;
    can_move: boolean;
};

export type IdeaGroup = {
    idea_group_id: string;
    name: string;
    weight: number;
    idea_count: number;
    create_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    update_user_id: string;
    update_display_name: string;
    update_logo_uri: string;
    create_time: number;
    update_time: number;
};

export type IdeaPerm = {
    update_for_all: boolean;
    extra_update_user_id_list: string[];
};

export type Idea = {
    idea_id: string;
    basic_info: BasicIdea;
    agree_count: number;
    disagree_count: number;
    user_perm: UserPerm;
    has_my_appraise: boolean;
    my_appraise_type: APPRAISE_TYPE;
    create_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    update_user_id: string;
    update_display_name: string;
    update_logo_uri: string;
    create_time: number;
    update_time: number;
    idea_group_id: string;
    idea_perm: IdeaPerm;
};

export type IdeaInStore = {
    idea_id: string;
    basic_info: BasicIdea;
    idea_store_id: string;
}

export type ListIdeaParam = {
    filter_by_keyword: boolean;
    keyword_list: string[];
    keyword_search_type: KEYWORD_SEARCH_TYPE;
    filter_by_group_or_store_id: boolean;
    group_or_store_id: string;
};

export type Appraise = {
    member_user_id: string;
    member_display_name: string;
    member_logo_uri: string;
    appraise_type: APPRAISE_TYPE;
    time_stamp: number;
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
};

export type CreateGroupRequest = {
    session_id: string;
    project_id: string;
    name: string;
    weight: number;
};

export type CreateGroupResponse = {
    code: number;
    err_msg: string;
    idea_group_id: string;
};

export type UpdateGroupRequest = {
    session_id: string;
    project_id: string;
    idea_group_id: string;
    name: string;
    weight: number;
};

export type UpdateGroupResponse = {
    code: number;
    err_msg: string;
};

export type ListGroupRequest = {
    session_id: string;
    project_id: string;
};

export type ListGroupResponse = {
    code: number;
    err_msg: string;
    group_list: IdeaGroup[];
};

export type RemoveGroupRequest = {
    session_id: string;
    project_id: string;
    idea_group_id: string;
};

export type RemoveGroupResponse = {
    code: number;
    err_msg: string;
};

export type CreateIdeaRequest = {
    session_id: string;
    project_id: string;
    basic_info: BasicIdea;
    idea_group_id: string;
    idea_perm: IdeaPerm;
};

export type CreateIdeaResponse = {
    code: number;
    err_msg: string;
    idea_id: string;
};

export type UpdateIdeaContentRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
    title: string;
    content: string;
};

export type UpdateIdeaContentResponse = {
    code: number;
    err_msg: string;
};

export type UpdateIdeaKeywordRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
    keyword_list: string[];
};

export type UpdateIdeaKeywordResponse = {
    code: number;
    err_msg: string;
};

export type UpdateIdeaPermRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
    idea_perm: IdeaPerm;
};

export type UpdateIdeaPermResponse = {
    code: number;
    err_msg: string;
};

export type GetIdeaRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
};

export type GetIdeaResponse = {
    code: number;
    err_msg: string;
    idea: Idea;
};

export type ListIdeaRequest = {
    session_id: string;
    project_id: string;
    list_param: ListIdeaParam;
    sort_type: IDEA_SORT_TYPE;
    offset: number;
    limit: number;
};

export type ListIdeaResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    idea_list: Idea[];
};

export type RemoveIdeaRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
};

export type RemoveIdeaResponse = {
    code: number;
    err_msg: string;
};

export type ListAllKeywordRequest = {
    session_id: string;
    project_id: string;
};

export type ListAllKeywordResponse = {
    code: number;
    err_msg: string;
    keyword_list: string[];
};

export type MoveIdeaRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
    idea_group_id: string;
}
export type MoveIdeaResponse = {
    code: number;
    err_msg: string;
};

export type SetAppraiseRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
    appraise_type: APPRAISE_TYPE;
};

export type SetAppraiseResponse = {
    code: number;
    err_msg: string;
};

export type CancelAppraiseRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
};

export type CancelAppraiseResponse = {
    code: number;
    err_msg: string;
};


export type ListAppraiseRequest = {
    session_id: string;
    project_id: string;
    idea_id: string;
};

export type ListAppraiseResponse = {
    code: number;
    err_msg: string;
    appraise_list: Appraise[];
}

export type ListStoreCateRequest = {};

export type ListStoreCateResponse = {
    code: number;
    err_msg: string;
    cate_list: IdeaStoreCate[];
};

export type ListStoreRequest = {
    store_cate_id: string;
};

export type ListStoreResponse = {
    code: number;
    err_msg: string;
    store_list: IdeaStore[];
};

export type ImportStoreRequest = {
    session_id: string;
    project_id: string;
    idea_store_id: string;
};

export type ImportStoreResponse = {
    code: number;
    err_msg: string;
};

//创建点子分组
export async function create_group(request: CreateGroupRequest): Promise<CreateGroupResponse> {
    const cmd = 'plugin:project_idea_api|create_group';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateGroupResponse>(cmd, {
        request,
    });
}

//更新点子分组
export async function update_group(request: UpdateGroupRequest): Promise<UpdateGroupResponse> {
    const cmd = 'plugin:project_idea_api|update_group';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateGroupResponse>(cmd, {
        request,
    });
}

//列出点子分组
export async function list_group(request: ListGroupRequest): Promise<ListGroupResponse> {
    const cmd = 'plugin:project_idea_api|list_group';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListGroupResponse>(cmd, {
        request,
    });
}

//删除点子分组
export async function remove_group(request: RemoveGroupRequest): Promise<RemoveGroupResponse> {
    const cmd = 'plugin:project_idea_api|remove_group';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveGroupResponse>(cmd, {
        request,
    });
}

//创建点子
export async function create_idea(request: CreateIdeaRequest): Promise<CreateIdeaResponse> {
    const cmd = 'plugin:project_idea_api|create_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateIdeaResponse>(cmd, {
        request,
    });
}

//更新点子内容
export async function update_idea_content(request: UpdateIdeaContentRequest): Promise<UpdateIdeaContentResponse> {
    const cmd = 'plugin:project_idea_api|update_idea_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateIdeaContentResponse>(cmd, {
        request,
    });
}

//更新点子关键词
export async function update_idea_keyword(request: UpdateIdeaKeywordRequest): Promise<UpdateIdeaKeywordResponse> {
    const cmd = 'plugin:project_idea_api|update_idea_keyword';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateIdeaKeywordResponse>(cmd, {
        request,
    });
}

//更新点子权限
export async function update_idea_perm(request: UpdateIdeaPermRequest): Promise<UpdateIdeaPermResponse> {
    const cmd = 'plugin:project_idea_api|update_idea_perm';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateIdeaPermResponse>(cmd, {
        request,
    });
}

//获取点子
export async function get_idea(request: GetIdeaRequest): Promise<GetIdeaResponse> {
    const cmd = 'plugin:project_idea_api|get_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetIdeaResponse>(cmd, {
        request,
    });
}

//列出点子
export async function list_idea(request: ListIdeaRequest): Promise<ListIdeaResponse> {
    const cmd = 'plugin:project_idea_api|list_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListIdeaResponse>(cmd, {
        request,
    });
}

//删除点子
export async function remove_idea(request: RemoveIdeaRequest): Promise<RemoveIdeaResponse> {
    const cmd = 'plugin:project_idea_api|remove_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveIdeaResponse>(cmd, {
        request,
    });
}

//获取所有关键词
export async function list_all_keyword(request: ListAllKeywordRequest): Promise<ListAllKeywordResponse> {
    const cmd = 'plugin:project_idea_api|list_all_keyword';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListAllKeywordResponse>(cmd, {
        request,
    });
}

//移动点子
export async function move_idea(request: MoveIdeaRequest): Promise<MoveIdeaResponse> {
    const cmd = 'plugin:project_idea_api|move_idea';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<MoveIdeaResponse>(cmd, {
        request,
    });
}

//设置评价
export async function set_appraise(request: SetAppraiseRequest): Promise<SetAppraiseResponse> {
    const cmd = 'plugin:project_idea_api|set_appraise';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<SetAppraiseResponse>(cmd, {
        request,
    });
}

//取消评价
export async function cancel_appraise(request: CancelAppraiseRequest): Promise<CancelAppraiseResponse> {
    const cmd = 'plugin:project_idea_api|cancel_appraise';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CancelAppraiseResponse>(cmd, {
        request,
    });
}

//列出评价
export async function list_appraise(request: ListAppraiseRequest): Promise<ListAppraiseResponse> {
    const cmd = 'plugin:project_idea_api|list_appraise';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListAppraiseResponse>(cmd, {
        request,
    });
}

//列出点子库类别
export async function list_store_cate(request: ListStoreCateRequest): Promise<ListStoreCateResponse> {
    const cmd = 'plugin:project_idea_api|list_store_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListStoreCateResponse>(cmd, {
        request,
    });
}

//列出点子库
export async function list_store(request: ListStoreRequest): Promise<ListStoreResponse> {
    const cmd = 'plugin:project_idea_api|list_store';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListStoreResponse>(cmd, {
        request,
    });
}


//导入点子库
export async function import_store(request: ImportStoreRequest): Promise<ImportStoreResponse> {
    const cmd = 'plugin:project_idea_api|import_store';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ImportStoreResponse>(cmd, {
        request,
    });
}