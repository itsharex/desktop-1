//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type AdminCreateSkillCateRequest = {
    admin_session_id: string;
    cate_name: string;
    weight: number;
};

export type AdminCreateSkillCateResponse ={
    code: number
    err_msg: string;
    cate_id: string;
};


export type AdminUpdateSkillCateRequest = {
    admin_session_id: string;
    cate_id: string;
    cate_name: string;
    weight: number;
    publish: boolean;
};

export type AdminUpdateSkillCateResponse ={
    code: number
    err_msg: string;
};


export type AdminRemoveSkillCateRequest ={
    admin_session_id: string;
    cate_id: string;
};

export type AdminRemoveSkillCateResponse ={
    code: number
    err_msg: string;
};


export type AdminCreateSkillFolderRequest ={
    admin_session_id: string;
    folder_name: string;
    parent_folder_id: string;
    cate_id: string;
    weight: number;
};

export type AdminCreateSkillFolderResponse ={
    code: number
    err_msg: string;
    folder_id: string;
};


export type AdminUpdateSkillFolderRequest ={
    admin_session_id: string;
    cate_id: string;
    folder_id: string;
    folder_name: string;
    weight: number;
};

export type AdminUpdateSkillFolderResponse ={
    code: number
    err_msg: string;
};


export type AdminRemoveSkillFolderRequest ={
    admin_session_id: string;
    cate_id: string;
    folder_id: string;
};

export type AdminRemoveSkillFolderResponse ={
    code: number
    err_msg: string;
};


export type AdminMoveSkillFolderRequest ={
    admin_session_id: string;
    cate_id: string;
    folder_id: string;
    parent_folder_id: string;
};

export type AdminMoveSkillFolderResponse ={
    code: number
    err_msg: string;
};


export type AdminCreateSkillPointRequest ={
    admin_session_id: string;
    point_name: string;
    parent_folder_id: string;
    cate_id: string;
    weight: number;
};

export type AdminCreateSkillPointResponse ={
    code: number
    err_msg: string;
    point_id: string;
};


export type AdminUpdateSkillPointRequest ={
    admin_session_id: string;
    cate_id: string;
    point_id: string;
    point_name: string;
    weight: number;
};

export type AdminUpdateSkillPointResponse ={
    code: number
    err_msg: string;
};


export type AdminRemoveSkillPointRequest ={
    admin_session_id: string;
    cate_id: string;
    point_id: string;
};

export type AdminRemoveSkillPointResponse ={
    code: number
    err_msg: string;
};


export type AdminMoveSkillPointRequest ={
    admin_session_id: string;
    cate_id: string;
    point_id: string;
    parent_folder_id: string;
};

export type AdminMoveSkillPointResponse ={
    code: number  
    err_msg: string;
};

// 创建技能类别
export async function create_skill_cate(request: AdminCreateSkillCateRequest): Promise<AdminCreateSkillCateResponse> {
    const cmd = 'plugin:skill_center_admin_api|create_skill_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminCreateSkillCateResponse>(cmd, {
        request,
    });
}

// 更新技能类别
export async function update_skill_cate(request: AdminUpdateSkillCateRequest): Promise<AdminUpdateSkillCateResponse> {
    const cmd = 'plugin:skill_center_admin_api|update_skill_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateSkillCateResponse>(cmd, {
        request,
    });
}

// 删除技能类别
export async function remove_skill_cate(request: AdminRemoveSkillCateRequest): Promise<AdminRemoveSkillCateResponse> {
    const cmd = 'plugin:skill_center_admin_api|remove_skill_cate';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveSkillCateResponse>(cmd, {
        request,
    });
}

// 创建技能目录
export async function create_skill_folder(request: AdminCreateSkillFolderRequest): Promise<AdminCreateSkillFolderResponse> {
    const cmd = 'plugin:skill_center_admin_api|create_skill_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminCreateSkillFolderResponse>(cmd, {
        request,
    });
}

// 更新技能目录
export async function update_skill_folder(request: AdminUpdateSkillFolderRequest): Promise<AdminUpdateSkillFolderResponse> {
    const cmd = 'plugin:skill_center_admin_api|update_skill_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateSkillFolderResponse>(cmd, {
        request,
    });
}

// 删除技能目录
export async function remove_skill_folder(request: AdminRemoveSkillFolderRequest): Promise<AdminRemoveSkillFolderResponse> {
    const cmd = 'plugin:skill_center_admin_api|remove_skill_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveSkillFolderResponse>(cmd, {
        request,
    });
}

// 移动技能目录
export async function move_skill_folder(request: AdminMoveSkillFolderRequest): Promise<AdminMoveSkillFolderResponse> {
    const cmd = 'plugin:skill_center_admin_api|move_skill_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminMoveSkillFolderResponse>(cmd, {
        request,
    });
}

// 创建技能点
export async function create_skill_point(request: AdminCreateSkillPointRequest): Promise<AdminCreateSkillPointResponse> {
    const cmd = 'plugin:skill_center_admin_api|create_skill_point';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminCreateSkillPointResponse>(cmd, {
        request,
    });
}

// 更新技能点
export async function update_skill_point(request: AdminUpdateSkillPointRequest): Promise<AdminUpdateSkillPointResponse> {
    const cmd = 'plugin:skill_center_admin_api|update_skill_point';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateSkillPointResponse>(cmd, {
        request,
    });
}

// 删除技能点
export async function remove_skill_point(request: AdminRemoveSkillPointRequest): Promise<AdminRemoveSkillPointResponse> {
    const cmd = 'plugin:skill_center_admin_api|remove_skill_point';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveSkillPointResponse>(cmd, {
        request,
    });
}

// 移动技能点
export async function move_skill_point(request: AdminMoveSkillPointRequest): Promise<AdminMoveSkillPointResponse> {
    const cmd = 'plugin:skill_center_admin_api|move_skill_point';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminMoveSkillPointResponse>(cmd, {
        request,
    });
}