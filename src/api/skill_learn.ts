import { invoke } from '@tauri-apps/api/tauri';

export type LearnRecordInfo = {
    user_id: string;
    point_id: string;
    learn_material_content: string;
    my_learned_content: string;
    learn_hour: number;
    user_display_name: string;
    user_logo_uri: string;
    point_name: string;
    full_point_name: string;
    create_time: number;
    update_time: number;
    vote_count: number;
    my_vote: boolean;
};

export type MyLearnStateInfo ={
    learn_point_count: number;
    last_learn_time: number;
};

export type AddLearnRecordRequest ={
    session_id: string;
    cate_id: string;
    point_id: string;
    learn_material_content: string;
    my_learned_content: string;
    learn_hour: number;
};

export type AddLearnRecordResponse ={
    code: number;
    err_msg: string;
};

export type UpdateLearnRecordRequest ={
    session_id: string;
    cate_id: string;
    point_id: string;
    learn_material_content: string;
    my_learned_content: string;
    learn_hour: number;
};

export type UpdateLearnRecordResponse ={
    code: number;
    err_msg: string;
};

export type RemoveLearnRecordRequest = {
    session_id: string;
    cate_id: string;
    point_id: string;
};

export type RemoveLearnRecordResponse = {
    code: number;
    err_msg: string;
};


export type ListLearnRecordRequest = {
    session_id: string;
    cate_id: string;
    point_id: string;
    offset: number;
    limit: number;
};

export type ListLearnRecordResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    record_list: LearnRecordInfo[];
};


export type GetMySkillStateRequest = {
    session_id: string;
};

export type GetMySkillStateResponse ={
    code: number;
    err_msg: string;
    state_info: MyLearnStateInfo;
};


export type ListMyLearnRecordRequest = {
    session_id: string;
    offset: number;
    limit: number;
};

export type ListMyLearnRecordResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    record_list: LearnRecordInfo[];
};


export type VoteRequest = {
    session_id: string;
    cate_id: string;
    point_id: string;
    learn_user_id: string;
};

export type VoteResponse = {
    code: number;
    err_msg: string;
};


export type CancelVoteRequest = {
    session_id: string;
    cate_id: string;
    point_id: string;
    learn_user_id: string;
};

export type CancelVoteResponse = {
    code: number;  
    err_msg: string;
};

//增加学习记录
export async function add_learn_record(request: AddLearnRecordRequest): Promise<AddLearnRecordResponse> {
    const cmd = 'plugin:skill_learn_api|add_learn_record';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AddLearnRecordResponse>(cmd, {
        request,
    });
}

//更新学习记录
export async function update_learn_record(request: UpdateLearnRecordRequest): Promise<UpdateLearnRecordResponse> {
    const cmd = 'plugin:skill_learn_api|update_learn_record';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateLearnRecordResponse>(cmd, {
        request,
    });
}

//删除学习记录
export async function remove_learn_record(request: RemoveLearnRecordRequest): Promise<RemoveLearnRecordResponse> {
    const cmd = 'plugin:skill_learn_api|remove_learn_record';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveLearnRecordResponse>(cmd, {
        request,
    });
}

//列出学习记录
export async function list_learn_record(request: ListLearnRecordRequest): Promise<ListLearnRecordResponse> {
    const cmd = 'plugin:skill_learn_api|list_learn_record';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListLearnRecordResponse>(cmd, {
        request,
    });
}

//获取我的技能状态
export async function get_my_skill_state(request: GetMySkillStateRequest): Promise<GetMySkillStateResponse> {
    const cmd = 'plugin:skill_learn_api|get_my_skill_state';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetMySkillStateResponse>(cmd, {
        request,
    });
}

//列出我的学习记录
export async function list_my_learn_record(request: ListMyLearnRecordRequest): Promise<ListMyLearnRecordResponse> {
    const cmd = 'plugin:skill_learn_api|list_my_learn_record';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListMyLearnRecordResponse>(cmd, {
        request,
    });
}

//投票
export async function vote(request: VoteRequest): Promise<VoteResponse> {
    const cmd = 'plugin:skill_learn_api|vote';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<VoteResponse>(cmd, {
        request,
    });
}

//取消投票
export async function cancel_vote(request: CancelVoteRequest): Promise<CancelVoteResponse> {
    const cmd = 'plugin:skill_learn_api|cancel_vote';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CancelVoteResponse>(cmd, {
        request,
    });
}