//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type GENDER_TYPE = number;
export const GENDER_TYPE_UNKNOWN: GENDER_TYPE = 0;
export const GENDER_TYPE_MALE: GENDER_TYPE = 1;
export const GENDER_TYPE_FEMALE: GENDER_TYPE = 2;

export type WorkExpItem = {
    from_time: number;
    has_from_time: boolean;
    to_time: number;
    has_to_time: boolean;
    company: string;
    positon: string;
    work_desc: string;
};

export type WorkExpItemWithId = {
    id: string;
    workExpItem: WorkExpItem,
};

export type EduExpItem = {
    from_time: number;
    has_from_time: boolean;
    to_time: number;
    has_to_time: boolean;
    school_name: string;
    major_name: string;
};

export type EduExpItemWithId = {
    id: string;
    eduExpItem: EduExpItem;
};

export type BasicInfo = {
    true_name: string;
    gender: GENDER_TYPE;
    birthday: number;
    has_birth_day: boolean;
    mobile_phone: string;
    email: string;
    self_intro: string;
};

export type UserResumeInfo = {
    basic_info: BasicInfo;
    work_exp_item_list: WorkExpItem[];
    edu_exp_item_list: EduExpItem[];
    allow_project_access: boolean;
    allow_org_access: boolean;
};

export type SetRequest = {
    session_id: string;
    resume_info: UserResumeInfo;
};

export type SetResponse = {
    code: number;
    err_msg: string;
};

export type GetRequest = {
    session_id: string;
};

export type GetResponse = {
    code: number;
    err_msg: string;
    resume_info: UserResumeInfo;
};

export type GetFromProjectRequest = {
    session_id: string;
    project_id: string;
    member_user_id: string;
};

export type GetFromProjectResponse = {
    code: number;
    err_msg: string;
    resume_info: UserResumeInfo;
};

export type GetFromOrgRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
};

export type GetFromOrgResponse = {
    code: number;
    err_msg: string;
    resume_info: UserResumeInfo;
};

//设置简历
export async function set(request: SetRequest): Promise<SetResponse> {
    const cmd = 'plugin:user_resume_api|set';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<SetResponse>(cmd, {
        request,
    });
}

//读取简历
export async function get(request: GetRequest): Promise<GetResponse> {
    const cmd = 'plugin:user_resume_api|get';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetResponse>(cmd, {
        request,
    });
}

//从项目中读取简历
export async function get_from_project(request: GetFromProjectRequest): Promise<GetFromProjectResponse> {
    const cmd = 'plugin:user_resume_api|get_from_project';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetFromProjectResponse>(cmd, {
        request,
    });
}

//从团队中读取简历
export async function get_from_org(request: GetFromOrgRequest): Promise<GetFromOrgResponse> {
    const cmd = 'plugin:user_resume_api|get_from_org';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetFromOrgResponse>(cmd, {
        request,
    });
}