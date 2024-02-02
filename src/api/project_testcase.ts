import { invoke } from '@tauri-apps/api/tauri';

export type PermSetting = {
    update_for_all: boolean;
    extra_update_user_id_list: string[];
};

export type UserPerm = {
    can_update: boolean;
    can_remove: boolean;
};

export type FolderInfo = {
    folder_id: string;
    title: string;
    parent_folder_id: string;
    perm_setting: PermSetting;
    sub_folder_count: number;
    sub_case_count: number;
    create_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    create_time: number;
    update_user_id: string;
    update_display_name: string;
    update_logo_uri: string;
    update_time: number;
    user_perm: UserPerm;
};

export type FolderPathItem = {
    folder_id: string;
    title: string;
};

export type SimpleFolderInfo = {
    folder_id: string;
    title: string;
    parent_folder_id: string;
};

export type TestMethod = {
    unit_test: boolean;///单元测试
    ci_test: boolean; ///集成测试
    load_test: boolean;///压力测试
    manual_test: boolean;///手动测试
};

export type CaseInfo = {
    case_id: string;
    title: string;
    parent_folder_id: string;
    perm_setting: PermSetting;
    test_method: TestMethod;
    create_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    create_time: number;
    update_user_id: string;
    update_display_name: string;
    update_logo_uri: string;
    update_time: number;
    user_perm: UserPerm;
    my_watch: boolean;
    result_count: number;
};

export type ListCaseFlatParam = {
    filter_by_title: boolean;
    title: string;
    my_watch: boolean;
};

export type CaseDetailInfo = {
    case_info: CaseInfo;
    content: string;
};

export type TestResultInfo = {
    test_result_id: string;
    test_ok: boolean;
    content: string;
    case_id: string;
    case_title: string;
    sprit_id: string;
    sprit_title: string;
    create_user_id: string;
    create_display_name: string;
    create_logo_uri: string;
    create_time: number;
    update_user_id: string;
    update_display_name: string;
    update_logo_uri: string;
    update_time: number;
};

export type CreateFolderRequest = {
    session_id: string;
    project_id: string;
    title: string;
    parent_folder_id: string;
    perm_setting: PermSetting;
};

export type CreateFolderResponse = {
    code: number;
    err_msg: string;
    folder_id: string;
};


export type UpdateFolderRequest = {
    session_id: string;
    project_id: string;
    folder_id: string;
    title: string;
};

export type UpdateFolderResponse = {
    code: number;
    err_msg: string;
};


export type SetFolderParentRequest = {
    session_id: string;
    project_id: string;
    folder_id: string;
    parent_folder_id: string;
};

export type SetFolderParentResponse = {
    code: number;
    err_msg: string;
};

export type ListFolderRequest = {
    session_id: string;
    project_id: string;
    parent_folder_id: string;
};

export type ListFolderResponse = {
    code: number;
    err_msg: string;
    folder_list: FolderInfo[];
};

export type GetFolderRequest = {
    session_id: string;
    project_id: string;
    folder_id: string;
};

export type GetFolderResponse = {
    code: number;
    err_msg: string;
    folder_info: FolderInfo;
};


export type RemoveFolderRequest = {
    session_id: string;
    project_id: string;
    folder_id: string;
};

export type RemoveFolderResponse = {
    code: number;
    err_msg: string;
};


export type UpdateFolderPermRequest = {
    session_id: string;
    project_id: string;
    folder_id: string;
    perm_setting: PermSetting;
};

export type UpdateFolderPermResponse = {
    code: number;
    err_msg: string;
};


export type GetFolderPathRequest = {
    session_id: string;
    project_id: string;
    folder_id: string;
};

export type GetFolderPathResponse = {
    code: number;
    err_msg: string;
    path_list: FolderPathItem[];
};

export type ListAllFolderRequest = {
    session_id: string;
    project_id: string;
};

export type ListAllFolderResponse = {
    code: number;
    err_msg: string;
    folder_list: SimpleFolderInfo[];
};

export type CreateCaseRequest = {
    session_id: string;
    project_id: string;
    title: string;
    parent_folder_id: string;
    perm_setting: PermSetting;
    test_method: TestMethod;
    content: string;
};

export type CreateCaseResponse = {
    code: number;
    err_msg: string;
    case_id: string;
};


export type UpdateCaseRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    title: string;
    test_method: TestMethod;
};

export type UpdateCaseResponse = {
    code: number;
    err_msg: string;
};

export type UpdateCaseContentRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    content: string;
};

export type UpdateCaseContentResponse = {
    code: number;
    err_msg: string;
};

export type ListCaseRequest = {
    session_id: string;
    project_id: string;
    parent_folder_id: string;
};

export type ListCaseResponse = {
    code: number;
    err_msg: string;
    case_list: CaseInfo[];
};


export type ListCaseFlatRequest = {
    session_id: string;
    project_id: string;
    list_param: ListCaseFlatParam;
    offset: number;
    limit: number;
};

export type ListCaseFlatResponse = {
    code: number;
    err_msg: string;
    count: number;
    case_list: CaseInfo[];
};


export type GetCaseRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    sprit_id: string;    //工作计划场景

};

export type GetCaseResponse = {
    code: number;
    err_msg: string;
    case_detail: CaseDetailInfo;
};


export type SetCaseParentRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    parent_folder_id: string;
};

export type SetCaseParentResponse = {
    code: number;
    err_msg: string;
};


export type RemoveCaseRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
};

export type RemoveCaseResponse = {
    code: number;
    err_msg: string;
};


export type UpdateCasePermRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    perm_setting: PermSetting;
};

export type UpdateCasePermResponse = {
    code: number;
    err_msg: string;
};


export type LinkSpritRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    sprit_id: string;
};

export type LinkSpritResponse = {
    code: number;
    err_msg: string;
};


export type UnlinkSpritRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    sprit_id: string;
};

export type UnlinkSpritResponse = {
    code: number;
    err_msg: string;
};


export type ListBySpritRequest = {
    session_id: string;
    project_id: string;
    sprit_id: string;
};

export type ListBySpritResponse = {
    code: number;
    err_msg: string;
    case_list: CaseInfo[];
};


export type AddTestResultRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    sprit_id: string;
    test_ok: boolean;
    content: string;
};

export type AddTestResultResponse = {
    code: number;
    err_msg: string;
    test_result_id: string;
};


export type UpdateTestResultRequest = {
    session_id: string;
    project_id: string;
    test_result_id: string;
    test_ok: boolean;
    content: string;
};

export type UpdateTestResultResponse = {
    code: number;
    err_msg: string;
};

export type ListTestResultRequest = {
    session_id: string;
    project_id: string;
    case_id: string;
    filter_by_sprit_id: boolean;
    sprit_id: string;
    offset: number;
    limit: number;
};

export type ListTestResultResponse = {
    code: number;
    err_msg: string;
    count: number;
    result_list: TestResultInfo[];
};


export type RemoveTestResultRequest = {
    session_id: string;
    project_id: string;
    test_result_id: string;
};

export type RemoveTestResultResponse = {
    code: number;
    err_msg: string;
};

// 创建目录
export async function create_folder(request: CreateFolderRequest): Promise<CreateFolderResponse> {
    const cmd = 'plugin:project_testcase_api|create_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateFolderResponse>(cmd, {
        request,
    });
}

// 更新目录
export async function update_folder(request: UpdateFolderRequest): Promise<UpdateFolderResponse> {
    const cmd = 'plugin:project_testcase_api|update_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateFolderResponse>(cmd, {
        request,
    });
}

// 设置父目录
export async function set_folder_parent(request: SetFolderParentRequest): Promise<SetFolderParentResponse> {
    const cmd = 'plugin:project_testcase_api|set_folder_parent';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<SetFolderParentResponse>(cmd, {
        request,
    });
}

// 列出目录
export async function list_folder(request: ListFolderRequest): Promise<ListFolderResponse> {
    const cmd = 'plugin:project_testcase_api|list_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListFolderResponse>(cmd, {
        request,
    });
}

// 获取单个目录
export async function get_folder(request: GetFolderRequest): Promise<GetFolderResponse> {
    const cmd = 'plugin:project_testcase_api|get_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetFolderResponse>(cmd, {
        request,
    });
}

// 删除目录
export async function remove_folder(request: RemoveFolderRequest): Promise<RemoveFolderResponse> {
    const cmd = 'plugin:project_testcase_api|remove_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveFolderResponse>(cmd, {
        request,
    });
}

// 设置目录权限
export async function update_folder_perm(request: UpdateFolderPermRequest): Promise<UpdateFolderPermResponse> {
    const cmd = 'plugin:project_testcase_api|update_folder_perm';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateFolderPermResponse>(cmd, {
        request,
    });
}

// 获取目录路径
export async function get_folder_path(request: GetFolderPathRequest): Promise<GetFolderPathResponse> {
    const cmd = 'plugin:project_testcase_api|get_folder_path';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetFolderPathResponse>(cmd, {
        request,
    });
}

//列出所有目录
export async function list_all_folder(request: ListAllFolderRequest): Promise<ListAllFolderResponse> {
    const cmd = 'plugin:project_testcase_api|list_all_folder';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListAllFolderResponse>(cmd, {
        request,
    });
}

// 创建测试条目
export async function create_case(request: CreateCaseRequest): Promise<CreateCaseResponse> {
    const cmd = 'plugin:project_testcase_api|create_case';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateCaseResponse>(cmd, {
        request,
    });
}

// 更新测试条目
export async function update_case(request: UpdateCaseRequest): Promise<UpdateCaseResponse> {
    const cmd = 'plugin:project_testcase_api|update_case';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateCaseResponse>(cmd, {
        request,
    });
}

//更新测试条目内容
export async function update_case_content(request: UpdateCaseContentRequest): Promise<UpdateCaseContentResponse> {
    const cmd = 'plugin:project_testcase_api|update_case_content';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateCaseContentResponse>(cmd, {
        request,
    });
}


// 列出测试条目(目录模式)
export async function list_case(request: ListCaseRequest): Promise<ListCaseResponse> {
    const cmd = 'plugin:project_testcase_api|list_case';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListCaseResponse>(cmd, {
        request,
    });
}

// 列出测试条目(列表模式)
export async function list_case_flat(request: ListCaseFlatRequest): Promise<ListCaseFlatResponse> {
    const cmd = 'plugin:project_testcase_api|list_case_flat';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListCaseFlatResponse>(cmd, {
        request,
    });
}

// 获取测试条目
export async function get_case(request: GetCaseRequest): Promise<GetCaseResponse> {
    const cmd = 'plugin:project_testcase_api|get_case';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetCaseResponse>(cmd, {
        request,
    });
}

// 设置测试条目父目录
export async function set_case_parent(request: SetCaseParentRequest): Promise<SetCaseParentResponse> {
    const cmd = 'plugin:project_testcase_api|set_case_parent';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<SetCaseParentResponse>(cmd, {
        request,
    });
}

// 删除测试条目
export async function remove_case(request: RemoveCaseRequest): Promise<RemoveCaseResponse> {
    const cmd = 'plugin:project_testcase_api|remove_case';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveCaseResponse>(cmd, {
        request,
    });
}

// 设置测试条目权限
export async function update_case_perm(request: UpdateCasePermRequest): Promise<UpdateCasePermResponse> {
    const cmd = 'plugin:project_testcase_api|update_case_perm';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateCasePermResponse>(cmd, {
        request,
    });
}

// 关联sprit
export async function link_sprit(request: LinkSpritRequest): Promise<LinkSpritResponse> {
    const cmd = 'plugin:project_testcase_api|link_sprit';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<LinkSpritResponse>(cmd, {
        request,
    });
}

// 取消关联sprit
export async function unlink_sprit(request: UnlinkSpritRequest): Promise<UnlinkSpritResponse> {
    const cmd = 'plugin:project_testcase_api|unlink_sprit';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UnlinkSpritResponse>(cmd, {
        request,
    });
}

// 按sprit列出测试条目
export async function list_by_sprit(request: ListBySpritRequest): Promise<ListBySpritResponse> {
    const cmd = 'plugin:project_testcase_api|list_by_sprit';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListBySpritResponse>(cmd, {
        request,
    });
}

// 增加测试结果
export async function add_test_result(request: AddTestResultRequest): Promise<AddTestResultResponse> {
    const cmd = 'plugin:project_testcase_api|add_test_result';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AddTestResultResponse>(cmd, {
        request,
    });
}

// 更新测试结果
export async function update_test_result(request: UpdateTestResultRequest): Promise<UpdateTestResultResponse> {
    const cmd = 'plugin:project_testcase_api|update_test_result';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateTestResultResponse>(cmd, {
        request,
    });
}

// 列出测试结果
export async function list_test_result(request: ListTestResultRequest): Promise<ListTestResultResponse> {
    const cmd = 'plugin:project_testcase_api|list_test_result';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListTestResultResponse>(cmd, {
        request,
    });
}

// 删除测试结果
export async function remove_test_result(request: RemoveTestResultRequest): Promise<RemoveTestResultResponse> {
    const cmd = 'plugin:project_testcase_api|remove_test_result';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveTestResultResponse>(cmd, {
        request,
    });
}