//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type GrpcExtraInfo = {
    api_coll_id: string;
    proto_file_id: string;
    secure: boolean;
};

export type OpenApiExtraInfo = {
    api_coll_id: string;
    proto_file_id: string;
    net_protocol: string;
};

export type CreateRpcRequest = {
    session_id: string;
    project_id: string;
    default_addr: string;
    proto_file_id: string;
    secure: boolean;
};

export type CreateRpcResponse = {
    code: number;
    err_msg: string;
    api_coll_id: string;
};


export type GetRpcRequest = {
    session_id: string;
    project_id: string;
    api_coll_id: string;
};

export type GetRpcResponse = {
    code: number;
    err_msg: string;
    extra_info: GrpcExtraInfo;
};


export type UpdateRpcRequest = {
    session_id: string;
    project_id: string;
    api_coll_id: string;
    proto_file_id: string;
    secure: boolean;
};

export type UpdateRpcResponse = {
    code: number;
    err_msg: string;
};


export type CreateOpenApiRequest = {
    session_id: string;
    project_id: string;
    default_addr: string;
    proto_file_id: string;
    net_protocol: string;
};

export type CreateOpenApiResponse = {
    code: number;
    err_msg: string;
    api_coll_id: string;
};


export type GetOpenApiRequest = {
    session_id: string;
    project_id: string;
    api_coll_id: string;
};

export type GetOpenApiResponse = {
    code: number;
    err_msg: string;
    extra_info: OpenApiExtraInfo;
};


export type UpdateOpenApiRequest = {
    session_id: string;
    project_id: string;
    api_coll_id: string;
    proto_file_id: string;
    net_protocol: string;
};

export type UpdateOpenApiResponse = {
    code: number;
    err_msg: string;
};


//创建grpc类型的api集合
export async function create_rpc(request: CreateRpcRequest): Promise<CreateRpcResponse> {
    const cmd = 'plugin:api_collection_api|create_rpc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateRpcResponse>(cmd, {
        request,
    });
}

//获取grpc类型的api信息
export async function get_rpc(request: GetRpcRequest): Promise<GetRpcResponse> {
    const cmd = 'plugin:api_collection_api|get_rpc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetRpcResponse>(cmd, {
        request,
    });
}

//更新grpc类型的api信息
export async function update_rpc(request: UpdateRpcRequest): Promise<UpdateRpcResponse> {
    const cmd = 'plugin:api_collection_api|update_rpc';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateRpcResponse>(cmd, {
        request,
    });
}

//创建openapi类型的api集合
export async function create_open_api(request: CreateOpenApiRequest): Promise<CreateOpenApiResponse> {
    const cmd = 'plugin:api_collection_api|create_open_api';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<CreateOpenApiResponse>(cmd, {
        request,
    });
}

//获取openapi类型的api集合
export async function get_open_api(request: GetOpenApiRequest): Promise<GetOpenApiResponse> {
    const cmd = 'plugin:api_collection_api|get_open_api';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<GetOpenApiResponse>(cmd, {
        request,
    });
}

//更新openapi类型的api结合
export async function update_open_api(request: UpdateOpenApiRequest): Promise<UpdateOpenApiResponse> {
    const cmd = 'plugin:api_collection_api|update_open_api';
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<UpdateOpenApiResponse>(cmd, {
        request,
    });
}