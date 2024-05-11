//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type AdminAddQuestionRequest = {
    admin_session_id: string;
    cate_id: string;
    content: string;
    weight: number;
};

export type AdminAddQuestionResponse = {
    code: number;
    err_msg: string;
    question_id: string;
};


export type AdminUpdateQuestionRequest = {
    admin_session_id: string;
    question_id: string;
    cate_id: string;
    content: string;
    weight: number;
};

export type AdminUpdateQuestionResponse = {
    code: number;
    err_msg: string;
};


export type AdminRemoveQuestionRequest = {
    admin_session_id: string;
    question_id: string;
    cate_id: string;
};

export type AdminRemoveQuestionResponse = {
    code: number;
    err_msg: string;
};

// 增加问题
export async function add_question(request: AdminAddQuestionRequest): Promise<AdminAddQuestionResponse> {
    const cmd = 'plugin:skill_test_admin_api|add_question';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminAddQuestionResponse>(cmd, {
        request,
    });
}

// 更新问题
export async function update_question(request: AdminUpdateQuestionRequest): Promise<AdminUpdateQuestionResponse> {
    const cmd = 'plugin:skill_test_admin_api|update_question';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminUpdateQuestionResponse>(cmd, {
        request,
    });
}

// 删除问题
export async function remove_question(request: AdminRemoveQuestionRequest): Promise<AdminRemoveQuestionResponse> {
    const cmd = 'plugin:skill_test_admin_api|remove_question';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AdminRemoveQuestionResponse>(cmd, {
        request,
    });
}