import { invoke } from '@tauri-apps/api/tauri';

export type AddToProjectFromOrgData = {
    org_id: string;
    org_name: string;
    project_id: string;
    project_name: string;
};

export type NoticeData  = {
    AddToProjectFromOrgData?: AddToProjectFromOrgData;
};


export type UserNoticeInfo = {
    notice_from_id: string;
    time_stamp: number;
    has_read: boolean;
    send_user_id: string;
    send_user_display_name: string;
    send_user_logo_uri: string;
    notice_data: NoticeData;
};


export type GetStatusRequest ={
    session_id: string;
};

export type GetStatusResponse = {

    code: number;

    err_msg: string;

    un_read_count: number;

    total_count: number;
};


export type ListNoticeRequest = {
    session_id: string;
    filter_by_has_read: boolean;
    has_read: boolean;
    offset: number;
    limit: number;
};

export type ListNoticeResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    user_notice_list: UserNoticeInfo[];
};

export type GetNoticeRequest = {
    session_id: string;
    notice_from_id: string;
};

export type GetNoticeResponse = {
    code: number;
    err_msg: string;
    user_notice: UserNoticeInfo;
};

export type RemoveNoticeRequest = {
    session_id: string;
    notice_from_id: string;
};

export type RemoveNoticeResponse = {
    code: number;
    err_msg: string;
};


export type MarkHasReadRequest = {
    session_id: string;
    notice_from_id: string;
};

export type MarkHasReadResponse = {
    code: number;
    err_msg: string;
};

//获取状态
export async function get_status(request: GetStatusRequest): Promise<GetStatusResponse> {
    const cmd = 'plugin:user_notice_api|get_status';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetStatusResponse>(cmd, {
        request,
    });
}

//列出消息
export async function list_notice(request: ListNoticeRequest): Promise<ListNoticeResponse> {
    const cmd = 'plugin:user_notice_api|list_notice';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListNoticeResponse>(cmd, {
        request,
    });
}

//获取单条消息
export async function get_notice(request: GetNoticeRequest): Promise<GetNoticeResponse> {
    const cmd = 'plugin:user_notice_api|get_notice';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetNoticeResponse>(cmd, {
        request,
    });
}

//删除消息
export async function remove_notice(request: RemoveNoticeRequest): Promise<RemoveNoticeResponse> {
    const cmd = 'plugin:user_notice_api|remove_notice';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveNoticeResponse>(cmd, {
        request,
    });
}

//标记为已读
export async function mark_has_read(request: MarkHasReadRequest): Promise<MarkHasReadResponse> {
    const cmd = 'plugin:user_notice_api|mark_has_read';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<MarkHasReadResponse>(cmd, {
        request,
    });
}