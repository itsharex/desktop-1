//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import type { MemberInfo } from './org_mebmer';

export type AdminListRequest = {
     admin_session_id: string;
     org_id: string;
};

export type AdminListResponse = {
    code: number;
    err_msg: string;
    member_info_list: MemberInfo[];
};

//列出团队/组织成员
export async function list(request: AdminListRequest): Promise<AdminListResponse> {
    const cmd = 'plugin:org_member_admin_api|list';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminListResponse>(cmd, {
        request,
    });
}