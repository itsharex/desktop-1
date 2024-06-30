//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type ACCESS_SCOPE = number;
export const ACCESS_SCOPE_NONE: ACCESS_SCOPE = 0;
export const ACCESS_SCOPE_PROJECT: ACCESS_SCOPE = 1;
export const ACCESS_SCOPE_ORG: ACCESS_SCOPE = 2;
export const ACCESS_SCOPE_ALL: ACCESS_SCOPE = 3;


export type GENDER_TYPE = number;
export const GENDER_TYPE_UNKNOWN: GENDER_TYPE = 0;
export const GENDER_TYPE_MALE: GENDER_TYPE = 1;
export const GENDER_TYPE_FEMALE: GENDER_TYPE = 2;

export type WorkExpItem = {
    access_scope: ACCESS_SCOPE;
    from_time: number;
    has_from_time: boolean;
    to_time: number;
    has_to_time: boolean;
    positon: string;
    work_desc: string;
};

export type EduExpItem = {
    access_scope: ACCESS_SCOPE;
    from_time: number;
    has_from_time: boolean;
    to_time: number;
    has_to_time: boolean;
    school_name: string;
    major_name: string;
};

export type BasicInfo = {
    true_name: string;
    true_name_access_scope: ACCESS_SCOPE;
    gender: GENDER_TYPE;
    gender_access_scope: ACCESS_SCOPE;
    birthday: number;
    has_birth_day: boolean;
    birthday_access_scope: ACCESS_SCOPE;
    province: string;
    province_access_scope: ACCESS_SCOPE;
    city: string;
    city_access_scope: ACCESS_SCOPE;
    mobile_phone: string;
    mobile_phone_access_scope: ACCESS_SCOPE;
    email: string;
    email_access_scope: ACCESS_SCOPE;
    self_intro: string;
    self_intro_access_scope: ACCESS_SCOPE;
};

export type UserResumeInfo = {
    basic_info: BasicInfo;
    work_exp_item_list: WorkExpItem[];
    edu_exp_item_list: EduExpItem[];
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