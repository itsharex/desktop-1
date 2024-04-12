import { invoke } from '@tauri-apps/api/tauri';

export type SkillCateInfo = {
    cate_id: string;
    cate_name: string;
    weight: number;
    publish: boolean;
    folder_count: number;
    point_count: number;
    create_time: number;
    update_time: number;
};

export type SkillFolderInfo = {
    folder_id: string;
    folder_name: string;
    parent_folder_id: string;
    cate_id: string;
    cate_name: string;
    weight: number;
    sub_folder_count: number;
    sub_point_count: number;
    create_time: number;
    update_time: number;
};

export type FolderPathInfo = {
    folder_id: string;
    folder_name: string;
};

export type SkillPointInfo = {
    point_id: string;
    point_name: string;
    parent_folder_id: string;
    cate_id: string;
    cate_name: string;
    weight: number;
    full_point_name: string;
    total_learn_count: number;
    create_time: number;
    update_time: number;
    has_learn: boolean;
};

export type ListSkillCateRequest = {
    session_id: string;
    filter_publish: boolean;
    publish: boolean;
};

export type ListSkillCateResponse = {
    code: number;
    err_msg: string;
    cate_list: SkillCateInfo[];
};


export type GetSkillCateRequest = {
    session_id: string;
    cate_id: string;
};

export type GetSkillCateResponse ={
    code: number;
    err_msg: string;
    cate_info: SkillCateInfo;
};


export type ListSkillFolderRequest = {
    session_id: string;
    cate_id: string;
    filter_by_parent_folder_id: boolean;
    parent_folder_id: string;
};

export type ListSkillFolderResponse = {
    code: number;
    err_msg: string;
    folder_list: SkillFolderInfo[];
};


export type GetSkillFolderRequest = {
    session_id: string;
    cate_id: string;
    folder_id: string;
};

export type GetSkillFolderResponse = {
    code: number;
    err_msg: string;
    folder_info: SkillFolderInfo;
};


export type GetFolderPathRequest = {
    session_id: string;
    cate_id: string;
    folder_id: string;
};

export type GetFolderPathResponse = {
    code: number;
    err_msg: string;
    path_list: FolderPathInfo[];
};


export type ListSkillPointRequest = {
    session_id: string;
    cate_id: string;
    filter_by_parent_folder_id: boolean;
    parent_folder_id: string;
};

export type ListSkillPointResponse = {
    code: number;
    err_msg: string;
    point_list: SkillPointInfo[];
};


export type GetSkillPointRequest = {
    session_id: string;
    cate_id: string;
    point_id: string;
};

export type GetSkillPointResponse = {
    code: number;
    err_msg: string;
    point_info: SkillPointInfo;
};

//列出技能类别
export async function list_skill_cate(request: ListSkillCateRequest): Promise<ListSkillCateResponse> {
    const cmd = 'plugin:skill_center_api|list_skill_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListSkillCateResponse>(cmd, {
        request,
    });
}

//获取单个技能类别
export async function get_skill_cate(request: GetSkillCateRequest): Promise<GetSkillCateResponse> {
    const cmd = 'plugin:skill_center_api|get_skill_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetSkillCateResponse>(cmd, {
        request,
    });
}

//列出技能目录
export async function list_skill_folder(request: ListSkillFolderRequest): Promise<ListSkillFolderResponse> {
    const cmd = 'plugin:skill_center_api|list_skill_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListSkillFolderResponse>(cmd, {
        request,
    });
}

//获取单个技能目录
export async function get_skill_folder(request: GetSkillFolderRequest): Promise<GetSkillFolderResponse> {
    const cmd = 'plugin:skill_center_api|get_skill_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetSkillFolderResponse>(cmd, {
        request,
    });
}

//获取目录路径
export async function get_folder_path(request: GetFolderPathRequest): Promise<GetFolderPathResponse> {
    const cmd = 'plugin:skill_center_api|get_folder_path';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetFolderPathResponse>(cmd, {
        request,
    });
}

//列出技能点
export async function list_skill_point(request: ListSkillPointRequest): Promise<ListSkillPointResponse> {
    const cmd = 'plugin:skill_center_api|list_skill_point';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListSkillPointResponse>(cmd, {
        request,
    });
}

//获取单个技能点
export async function get_skill_point(request: GetSkillPointRequest): Promise<GetSkillPointResponse> {
    const cmd = 'plugin:skill_center_api|get_skill_point';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetSkillPointResponse>(cmd, {
        request,
    });
}