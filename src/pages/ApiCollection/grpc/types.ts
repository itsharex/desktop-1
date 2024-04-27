//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

export interface MethodInfo {
    methodName: string;
    clientStream: boolean;
    serverStream: boolean;
}

export interface ServiceInfo {
    serviceName: string;
    methodList: MethodInfo[];
}

export interface MethodWithServiceInfo {
    serviceName: string;
    method: MethodInfo;
}