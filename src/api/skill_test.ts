//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type SkillQuestion = {
    question_id: string;
    content: string;
    weight: number;
    cate_id: string;
    cate_name: string;
    create_time: number;
    update_time: number;
};

export type ListQuestionRequest = {
    session_id: string;
    cate_id: string;
    offset: number;
    limit: number;
};

export type ListQuestionResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    question_list: SkillQuestion[];
};

export type GetQuestionRequest = {
    session_id: string;
    cate_id: string;
    question_id: string;
};

export type GetQuestionResponse = {
    code: number;
    err_msg: string;
    question: SkillQuestion;
};

// 列出问题
export async function list_question(request: ListQuestionRequest): Promise<ListQuestionResponse> {
    const cmd = 'plugin:skill_test_api|list_question';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListQuestionResponse>(cmd, {
        request,
    });
}

// 获取单个问题
export async function get_question(request: GetQuestionRequest): Promise<GetQuestionResponse> {
    const cmd = 'plugin:skill_test_api|get_question';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetQuestionResponse>(cmd, {
        request,
    });
}