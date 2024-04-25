import { invoke } from '@tauri-apps/api/tauri';

export type OrgForumInfo = {
    forum_id: string;
    forum_name: string;
    org_id: string;
    weight: number;
    fs_id: string;
    thread_count: number;
};

export type ForumThreadInfo = {
    thread_id: string;
    forum_id: string;
    title: string;
    weight: number;
    first_content_id: string;
    user_id: string;
    user_display_name: string;
    user_logo_uri: string;
    create_time: number;
    update_time: number;
    content_count: number;
};

export type ThreadContentInfo = {
    content_id: string;
    thread_id: string;
    content: string;
    user_id: string;
    user_display_name: string;
    user_logo_uri: string;
    create_time: number;
    update_time: number;
};

export type UserContentInfo = {
    content_id: string;
    forum_id: string;
    forum_name: string;
    thread_id: string;
    thread_title: string;
    thread_content_id: string;
    content: string;
    user_id: string;
    user_display_name: string;
    user_logo_uri: string;
    create_time: number;
    update_time: number;
};

export type CreateForumRequest = {
    session_id: string;
    org_id: string;
    forum_name: string;
    weight: number;
};

export type CreateForumResponse = {
    code: number;
    err_msg: string;
    forum_id: string;
};


export type UpdateForumRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    forum_name: string;
    weight: number;
};

export type UpdateForumResponse = {
    code: number;
    err_msg: string;
};


export type ListForumRequest = {
    session_id: string;
    org_id: string;
};

export type ListForumResponse = {
    code: number;
    err_msg: string;
    forum_list: OrgForumInfo[];
};

export type GetForumRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
};

export type GetForumResponse = {
    code: number;
    err_msg: string;
    forum_info: OrgForumInfo;
}

export type RemoveForumRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
};

export type RemoveForumResponse = {
    code: number;
    err_msg: string;
};


export type CreateThreadRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    title: string;
    content: string;
};

export type CreateThreadResponse = {
    code: number;
    err_msg: string;
    thread_id: string;
    content_id: string;
};


export type UpdateThreadRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
    title: string;
};

export type UpdateThreadResponse = {
    code: number;
    err_msg: string;
};


export type SetThreadWeightRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
    weight: number;
};

export type SetThreadWeightResponse = {
    code: number;
    err_msg: string;
};


export type ListThreadRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    offset: number;
    limit: number;
};

export type ListThreadResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    thread_list: ForumThreadInfo[];
};


export type GetThreadRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
};

export type GetThreadResponse = {
    code: number;
    err_msg: string;
    thread_info: ForumThreadInfo;
};


export type RemoveThreadRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
};

export type RemoveThreadResponse = {
    code: number;
    err_msg: string;
};


export type CreateContentRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
    content: string;
};

export type CreateContentResponse = {
    code: number;
    err_msg: string;
    content_id: string;
};


export type UpdateContentRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
    content_id: string;
    content: string;
};

export type UpdateContentResponse = {
    code: number;
    err_msg: string;
};


export type ListContentRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
    offset: number;
    limit: number;
};

export type ListContentResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    content_list: ThreadContentInfo[];
};

export type ListContentByIdRequest = {
    session_id: string;
    org_id: string;
    content_id_list: string[];
};

export type ListContentByIdResponse = {
    code: number;
    err_msg: string;
    content_list: ThreadContentInfo[];
};

export type GetContentRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
    content_id: string;
};

export type GetContentResponse = {
    code: number;
    err_msg: string;
    content_info: ThreadContentInfo;
};

export type RemoveContentRequest = {
    session_id: string;
    org_id: string;
    forum_id: string;
    thread_id: string;
    content_id: string;
};

export type RemoveContentResponse = {
    code: number;
    err_msg: string;
};

export type ListUserContentRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
    offset: number;
    limit: number;
};

export type ListUserContentResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    content_list: UserContentInfo[];
}

//创建论坛
export async function create_forum(request: CreateForumRequest): Promise<CreateForumResponse> {
    const cmd = 'plugin:org_forum_api|create_forum';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateForumResponse>(cmd, {
        request,
    });
}

//更新论坛
export async function update_forum(request: UpdateForumRequest): Promise<UpdateForumResponse> {
    const cmd = 'plugin:org_forum_api|update_forum';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateForumResponse>(cmd, {
        request,
    });
}

//列出论坛
export async function list_forum(request: ListForumRequest): Promise<ListForumResponse> {
    const cmd = 'plugin:org_forum_api|list_forum';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListForumResponse>(cmd, {
        request,
    });
}

//获取单个论坛信息
export async function get_forum(request: GetForumRequest): Promise<GetForumResponse> {
    const cmd = 'plugin:org_forum_api|get_forum';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetForumResponse>(cmd, {
        request,
    });
}

//删除论坛
export async function remove_forum(request: RemoveForumRequest): Promise<RemoveForumResponse> {
    const cmd = 'plugin:org_forum_api|remove_forum';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveForumResponse>(cmd, {
        request,
    });
}

//创建会话
export async function create_thread(request: CreateThreadRequest): Promise<CreateThreadResponse> {
    const cmd = 'plugin:org_forum_api|create_thread';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateThreadResponse>(cmd, {
        request,
    });
}

//更新会话
export async function update_thread(request: UpdateThreadRequest): Promise<UpdateThreadResponse> {
    const cmd = 'plugin:org_forum_api|update_thread';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateThreadResponse>(cmd, {
        request,
    });
}

//设置会话权重
export async function set_thread_weight(request: SetThreadWeightRequest): Promise<SetThreadWeightResponse> {
    const cmd = 'plugin:org_forum_api|set_thread_weight';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<SetThreadWeightResponse>(cmd, {
        request,
    });
}

//列出会话
export async function list_thread(request: ListThreadRequest): Promise<ListThreadResponse> {
    const cmd = 'plugin:org_forum_api|list_thread';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListThreadResponse>(cmd, {
        request,
    });
}

//获取单个会话
export async function get_thread(request: GetThreadRequest): Promise<GetThreadResponse> {
    const cmd = 'plugin:org_forum_api|get_thread';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetThreadResponse>(cmd, {
        request,
    });
}

//删除会话
export async function remove_thread(request: RemoveThreadRequest): Promise<RemoveThreadResponse> {
    const cmd = 'plugin:org_forum_api|remove_thread';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveThreadResponse>(cmd, {
        request,
    });
}

//发布内容
export async function create_content(request: CreateContentRequest): Promise<CreateContentResponse> {
    const cmd = 'plugin:org_forum_api|create_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateContentResponse>(cmd, {
        request,
    });
}

//更新内容
export async function update_content(request: UpdateContentRequest): Promise<UpdateContentResponse> {
    const cmd = 'plugin:org_forum_api|update_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateContentResponse>(cmd, {
        request,
    });
}

//列出内容
export async function list_content(request: ListContentRequest): Promise<ListContentResponse> {
    const cmd = 'plugin:org_forum_api|list_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListContentResponse>(cmd, {
        request,
    });
}

//按ID列出内容
export async function list_content_by_id(request: ListContentByIdRequest): Promise<ListContentByIdResponse> {
    const cmd = 'plugin:org_forum_api|list_content_by_id';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListContentByIdResponse>(cmd, {
        request,
    });
}

//获取单个内容
export async function get_content(request: GetContentRequest): Promise<GetContentResponse> {
    const cmd = 'plugin:org_forum_api|get_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetContentResponse>(cmd, {
        request,
    });
}

//删除内容
export async function remove_content(request: RemoveContentRequest): Promise<RemoveContentResponse> {
    const cmd = 'plugin:org_forum_api|remove_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveContentResponse>(cmd, {
        request,
    });
}

//列出用户内容
export async function list_user_content(request: ListUserContentRequest): Promise<ListUserContentResponse> {
    const cmd = 'plugin:org_forum_api|list_user_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListUserContentResponse>(cmd, {
        request,
    });
}