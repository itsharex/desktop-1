//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import { useCommands } from '@remirror/react';
import type { NodeViewComponentProps } from '@remirror/react';
import type { AppInfo } from "@/api/appstore";
import { get_app } from "@/api/appstore";
import { request } from '@/utils/request';
import { get_session } from '@/api/user';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EditorWrap from '../components/EditorWrap';
import { Card, Empty, Space } from 'antd';
import AsyncImage from '@/components/AsyncImage';
import { GLOBAL_APPSTORE_FS_ID } from '@/api/fs';
import { useStores } from '@/hooks';
import { ReadOnlyEditor } from '../ReadOnlyEditor';
import defaultIcon from '@/assets/allIcon/app-default-icon.png';

export type MinAppRefProps = NodeViewComponentProps & {
    minAppId: string;
};


export const MinAppRef = (props: MinAppRefProps) => {
    const appStore = useStores('appStore');

    const { deleteMinAppRef } = useCommands();

    const [minAppInfo, setMinAppInfo] = useState<AppInfo | null>(null);

    const removeNode = () => {
        deleteMinAppRef((props.getPosition as () => number)());
    };

    const loadMinAppInfo = async () => {
        const sessionId = await get_session();
        const res = await request(get_app({
            app_id: props.minAppId,
            session_id: sessionId,
        }));
        setMinAppInfo(res.app_info);
    };

    const adjustUrl = (fileId: string) => {
        if (appStore.isOsWindows) {
            return `https://fs.localhost/${GLOBAL_APPSTORE_FS_ID}/${fileId}/icon.png`;
        } else {
            return `fs://localhost/${GLOBAL_APPSTORE_FS_ID}/${fileId}/icon.png`;
        }
    }

    useEffect(() => {
        loadMinAppInfo();
    }, [props.minAppId]);

    return (
        <ErrorBoundary>
            <div style={{ display: "inline-block" }}>
                <EditorWrap onChange={props.view.editable ? () => removeNode() : undefined}
                    style={{ width: "400px" }}>
                    {minAppInfo == null && (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                    {minAppInfo != null && (
                        <Card style={{ flex: 1, borderRadius: "10px", cursor: props.view.editable ? undefined : "pointer" }}
                            headStyle={{ backgroundColor: "#e4e4e8" }}
                            title={minAppInfo.base_info.app_name}
                            bodyStyle={{ display: "flex" }}
                            bordered={false}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (props.view.editable) {
                                    return;
                                }
                                appStore.openMinAppId = props.minAppId;
                            }}>
                            <Space direction="vertical">
                                <AsyncImage style={{ width: "80px", height: "80px", cursor: "pointer" }}
                                    src={adjustUrl(minAppInfo.base_info.icon_file_id)} fallback={defaultIcon} preview={false} useRawImg={false}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (props.view.editable) {
                                            return;
                                        }
                                        appStore.openMinAppId = props.minAppId;
                                    }} />
                            </Space>
                            <div style={{ marginLeft: "20px", height: "120px", overflowY: "scroll", width: "100%" }}>
                                <ReadOnlyEditor content={minAppInfo.base_info.app_desc} />
                            </div>
                        </Card>
                    )}
                </EditorWrap>
            </div>
        </ErrorBoundary >
    );
};