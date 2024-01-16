import { invoke } from '@tauri-apps/api/tauri';
import {
    ANNO_PROJECT_AUDIO_CLASSIFI, ANNO_PROJECT_AUDIO_SEG, ANNO_PROJECT_AUDIO_SEG_TRANS,
    ANNO_PROJECT_AUDIO_TRANS, ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT, ANNO_PROJECT_IMAGE_BRUSH_SEG,
    ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT, ANNO_PROJECT_IMAGE_CLASSIFI, ANNO_PROJECT_IMAGE_KEYPOINT,
    ANNO_PROJECT_IMAGE_POLYGON_SEG, ANNO_PROJECT_TEXT_CLASSIFI, ANNO_PROJECT_TEXT_NER, ANNO_PROJECT_TEXT_SUMMARY,
    type ANNO_PROJECT_TYPE
} from './project_entry';


export type BaseAnnoProjectInfo = {
    desc: string;
    config: string;
    predict_url: string;
};

export type AnnoProjectInfo = {
    anno_project_id: string;
    base_info: BaseAnnoProjectInfo;
    resource_count: number;
    all_task_count: number;
    done_task_count: number;
    member_count: number;
    my_done_count: number;
    my_task_count: number;
};

export type ResourceInfo = {
    resource_id: string;
    anno_project_id: string;
    content: string;
    store_as_file: boolean;
    task_count: number;
    file_ext: string;
};

export type CreateRequest = {
    session_id: string;
    project_id: string;
    base_info: BaseAnnoProjectInfo;
};

export type CreateResponse = {
    code: number;
    err_msg: string;
    anno_project_id: string;
};

export type UpdateRequest = {
    session_id: string;
    project_id: string;
    anno_project_id: string;
    base_info: BaseAnnoProjectInfo;
};

export type UpdateResponse = {
    code: number;
    err_msg: string;
};

export type RemoveRequest = {
    session_id: string;
    project_id: string;
    anno_project_id: string;
};

export type RemoveResponse = {
    code: number;
    err_msg: string;
};

export type GetRequest = {
    session_id: string;
    project_id: string;
    anno_project_id: string;
};

export type GetResponse = {
    code: number;
    err_msg: string;
    info: AnnoProjectInfo;
};

export type AddResourceRequest = {
    session_id: string;
    project_id: string;
    anno_project_id: string;
    content: string;
    store_as_file: boolean;
};

export type AddResourceResponse = {
    code: number;
    err_msg: string;
    resource_id: string;
};

export type RemoveResourceRequest = {
    session_id: string;
    project_id: string;
    anno_project_id: string;
    resource_id: string;
};

export type RemoveResourceResponse = {
    code: number;
    err_msg: string;
};


export type ListResourceRequest = {
    session_id: string;
    project_id: string;
    anno_project_id: string;
    offset: number;
    limit: number;
};

export type ListResourceResponse = {
    code: number;
    err_msg: string;
    total_count: number;
    info_list: ResourceInfo[];
};

//创建标注项目
export async function create(request: CreateRequest): Promise<CreateResponse> {
    const cmd = 'plugin:data_anno_project_api|create';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateResponse>(cmd, {
        request,
    });
}

//修改标注项目
export async function update(request: UpdateRequest): Promise<UpdateResponse> {
    const cmd = 'plugin:data_anno_project_api|update';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateResponse>(cmd, {
        request,
    });
}

//删除标注项目
export async function remove(request: RemoveRequest): Promise<RemoveResponse> {
    const cmd = 'plugin:data_anno_project_api|remove';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveResponse>(cmd, {
        request,
    });
}

//获取单个标注项目信息
export async function get(request: GetRequest): Promise<GetResponse> {
    const cmd = 'plugin:data_anno_project_api|get';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetResponse>(cmd, {
        request,
    });
}

//增加资源
export async function add_resource(request: AddResourceRequest): Promise<AddResourceResponse> {
    const cmd = 'plugin:data_anno_project_api|add_resource';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<AddResourceResponse>(cmd, {
        request,
    });
}

//删除资源
export async function remove_resource(request: RemoveResourceRequest): Promise<RemoveResourceResponse> {
    const cmd = 'plugin:data_anno_project_api|remove_resource';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<RemoveResourceResponse>(cmd, {
        request,
    });
}

//列出资源
export async function list_resource(request: ListResourceRequest): Promise<ListResourceResponse> {
    const cmd = 'plugin:data_anno_project_api|list_resource';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<ListResourceResponse>(cmd, {
        request,
    });
}

//是否是音频标注
export function isAnnoAudio(annoType: ANNO_PROJECT_TYPE): boolean {
    return [ANNO_PROJECT_AUDIO_CLASSIFI, ANNO_PROJECT_AUDIO_SEG, ANNO_PROJECT_AUDIO_TRANS, ANNO_PROJECT_AUDIO_SEG_TRANS].includes(annoType);
}

//是否是图像标注
export function isAnnoImage(annoType: ANNO_PROJECT_TYPE): boolean {
    return [ANNO_PROJECT_IMAGE_CLASSIFI, ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT, ANNO_PROJECT_IMAGE_BRUSH_SEG,
        ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT, ANNO_PROJECT_IMAGE_KEYPOINT, ANNO_PROJECT_IMAGE_POLYGON_SEG].includes(annoType);
}

//是否是文本标注
export function isAnnoText(annoType: ANNO_PROJECT_TYPE): boolean {
    return [ANNO_PROJECT_TEXT_CLASSIFI, ANNO_PROJECT_TEXT_NER, ANNO_PROJECT_TEXT_SUMMARY].includes(annoType);
}

//导出资源
export function export_resource(sessionId: string, resource: ResourceInfo, fsId: string, destPath: string): Promise<void> {
    const cmd = 'plugin:data_anno_project_api|export_resource';
    const request = {
        sessionId,
        resource,
        fsId,
        destPath,
    };
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<void>(cmd, request);
}