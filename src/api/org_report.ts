//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type BasicDayReportInfo = {
    day_time: number;
    content: string;
};

export type BasicWeekReportInfo ={
    from_time: number;
    to_time: number;
    content: string;
};

export type UserPerm ={
    can_update: boolean;
    can_remove: boolean;
};

export type DayReportInfo ={
    report_id: string;
    basic_info: BasicDayReportInfo;
    member_user_id: string;
    member_display_name: string;
    member_logo_uri: string;
    create_time: number;
    update_time: number;
    user_perm: UserPerm;
};

export type WeekReportInfo = {
    report_id: string;
    basic_info: BasicWeekReportInfo;
    member_user_id: string;
    member_display_name: string;
    member_logo_uri: string;
    create_time: number;
    update_time: number;
    user_perm: UserPerm;
};

export type ListDayReportParam = {
    filter_by_day_time: boolean;
    from_day_time: number;
    to_day_time: number;
};

export type AddDayReportRequest = {
    session_id: string;
    org_id: string;
    basic_info: BasicDayReportInfo;
};

export type AddDayReportResponse = {
    code: number;
    err_msg: string;
    report_id: string;
};

export type UpdateDayReportRequest = {    
    session_id: string;
    org_id: string;
    report_id: string;
    basic_info: BasicDayReportInfo;
};

export type UpdateDayReportResponse = {
    code: number;
    err_msg: string;
};


export type ListDayReportRequest = {
    session_id: string;
    org_id: string;
    member_user_id: string;
    list_param: ListDayReportParam;
    offset: number;
    limit: number;
};

export type ListDayReportResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    report_list: DayReportInfo[];
};


export type GetDayReportRequest = {
    session_id: string;
    org_id: string;
    report_id: string;
};

export type GetDayReportResponse = {
    code: number;
    err_msg: string;
    report: DayReportInfo;
};

export type RemoveDayReportRequest = {
    session_id: string;
    org_id: string;
    report_id: string;
};

export type RemoveDayReportResponse = {    
    code: number;
    err_msg: string;
};


export type AddWeekReportRequest = {    
    session_id: string;
    org_id: string;
    basic_info: BasicWeekReportInfo;
};

export type AddWeekReportResponse = {
    code: number;
    err_msg: string;
    report_id: string;
};

export type UpdateWeekReportRequest = {
    session_id: string;
    org_id: string;
    report_id: string;
    basic_info: BasicWeekReportInfo;
};

export type UpdateWeekReportResponse = {
    code: number;
    err_msg: string;
};

export type ListWeekReportRequest = {    
    session_id: string;
    org_id: string;
    member_user_id: string;
    offset: number;
    limit: number;
};

export type ListWeekReportResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    report_list: WeekReportInfo[];
};

export type GetWeekReportRequest = {    
    session_id: string;
    org_id: string;
    report_id: string;
};

export type GetWeekReportResponse = {
    code: number;
    err_msg: string;
    report: WeekReportInfo;
};


export type RemoveWeekReportRequest ={
    session_id: string;
    org_id: string;
    report_id: string;
};

export type RemoveWeekReportResponse = {
    code: number;
    err_msg: string;
};

//创建日报
export async function add_day_report(request: AddDayReportRequest): Promise<AddDayReportResponse> {
    const cmd = 'plugin:org_report_api|add_day_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AddDayReportResponse>(cmd, {
        request,
    });
}

//更新日报
export async function update_day_report(request: UpdateDayReportRequest): Promise<UpdateDayReportResponse> {
    const cmd = 'plugin:org_report_api|update_day_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateDayReportResponse>(cmd, {
        request,
    });
}

//列出日报
export async function list_day_report(request: ListDayReportRequest): Promise<ListDayReportResponse> {
    const cmd = 'plugin:org_report_api|list_day_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListDayReportResponse>(cmd, {
        request,
    });
}

//获取单个日报
export async function get_day_report(request: GetDayReportRequest): Promise<GetDayReportResponse> {
    const cmd = 'plugin:org_report_api|get_day_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetDayReportResponse>(cmd, {
        request,
    });
}

//删除日报
export async function remove_day_report(request: RemoveDayReportRequest): Promise<RemoveDayReportResponse> {
    const cmd = 'plugin:org_report_api|remove_day_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveDayReportResponse>(cmd, {
        request,
    });
}

//创建周报
export async function add_week_report(request: AddWeekReportRequest): Promise<AddWeekReportResponse> {
    const cmd = 'plugin:org_report_api|add_week_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AddWeekReportResponse>(cmd, {
        request,
    });
}

//更新周报
export async function update_week_report(request: UpdateWeekReportRequest): Promise<UpdateWeekReportResponse> {
    const cmd = 'plugin:org_report_api|update_week_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateWeekReportResponse>(cmd, {
        request,
    });
}

//列出周报
export async function list_week_report(request: ListWeekReportRequest): Promise<ListWeekReportResponse> {
    const cmd = 'plugin:org_report_api|list_week_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListWeekReportResponse>(cmd, {
        request,
    });
}

//获取单个周报
export async function get_week_report(request: GetWeekReportRequest): Promise<GetWeekReportResponse> {
    const cmd = 'plugin:org_report_api|get_week_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetWeekReportResponse>(cmd, {
        request,
    });
}

//删除周报
export async function remove_week_report(request: RemoveWeekReportRequest): Promise<RemoveWeekReportResponse> {
    const cmd = 'plugin:org_report_api|remove_week_report';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveWeekReportResponse>(cmd, {
        request,
    });
}