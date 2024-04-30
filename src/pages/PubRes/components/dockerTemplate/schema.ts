//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

export interface FeatureSchema {
    id: string;
    name: string;
    tip?: string;
}

export type VALUE_TYPE = "string" | "integer" | "float" | "filePath" | "dirPath";

export interface VariableSchema {
    id: string;
    name: string;
    features?: string[];
    valueType: VALUE_TYPE;
    defaultValue?: string | number;
    minValue?: number;
    maxValue?: number;
    optionList?: (string | number)[];
    tip?: string;
}


export interface FileSchema {
    name: string;
    features?: string[];
    variables?: VariableSchema[];
    _variables?: VariableSchema[];
}

export interface RemoteFileSchema {
    name: string;
    features?: string[];
    remoteUrl: string;
}

export interface DockerComposeTemplateSchema {
    features?: FeatureSchema[];
    envs?: VariableSchema[];
    files?: FileSchema[];
    remoteFiles?: RemoteFileSchema[];
}
