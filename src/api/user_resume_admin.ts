//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import type { UserResumeInfo } from './user_resume';

export type AdminGetRequest = {
    admin_session_id: string;
    target_user_id: string;
};

export type AdminGetResponse = {
    code: number;
    err_msg: string;
    resume_info: UserResumeInfo;
};

//读取简历
export async function get(request: AdminGetRequest): Promise<AdminGetResponse> {
    const cmd = 'plugin:user_resume_admin_api|get';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminGetResponse>(cmd, {
        request,
    });
}