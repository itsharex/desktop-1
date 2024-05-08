//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import { useCommands } from '@remirror/react';
import type { NodeViewComponentProps } from '@remirror/react';
import type { SoftWareInfo } from "@/api/sw_store";
import { get_soft_ware } from "@/api/sw_store";
import { request } from '@/utils/request';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EditorWrap from '../components/EditorWrap';
import { Card, Empty } from 'antd';
import AsyncImage from '@/components/AsyncImage';
import { GLOBAL_SOFT_WARE_STORE_FS_ID } from '@/api/fs';
import { ReadOnlyEditor } from '../ReadOnlyEditor';
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { open as shell_open } from '@tauri-apps/api/shell';

export type SoftWareRefProps = NodeViewComponentProps & {
    softWareId: string;
};

export const SoftWareRef = (props: SoftWareRefProps) => {
    const { deleteSoftWareRef } = useCommands();

    const [softWareInfo, setSoftWareInfo] = useState<SoftWareInfo | null>(null);

    const removeNode = () => {
        deleteSoftWareRef((props.getPosition as () => number)());
    };

    const loadSoftWareInfo = async () => {
        const res = await request(get_soft_ware({
            sw_id: props.softWareId,
        }));
        setSoftWareInfo(res.soft_ware);
    };

    useEffect(() => {
        loadSoftWareInfo();
    }, [props.softWareId]);

    return (
        <ErrorBoundary>
            <EditorWrap onChange={props.view.editable ? () => removeNode() : undefined}
                style={{ width: "100%" }}>
                {softWareInfo == null && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                {softWareInfo != null && (
                    <Card title={<span style={{ fontSize: "20px", fontWeight: 700 }}>{softWareInfo.sw_name}</span>} bordered={false}
                        style={{ cursor: props.view.editable ? undefined : "pointer" }} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (props.view.editable) {
                                return;
                            }
                            shell_open(softWareInfo.download_url);
                        }}>
                        <div style={{ display: "flex" }}>
                            <div>
                                <AsyncImage style={{ width: "80px", cursor: "pointer" }}
                                    src={`fs://localhost/${GLOBAL_SOFT_WARE_STORE_FS_ID}/${softWareInfo.icon_file_id}/icon.png`}
                                    preview={false}
                                    fallback={defaultIcon}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (props.view.editable) {
                                            return;
                                        }
                                        shell_open(softWareInfo.download_url);
                                    }}
                                    useRawImg={false}
                                />
                            </div>
                            <div style={{ flex: 1, paddingLeft: "20px" }} className='_projectEditContext'>
                                <ReadOnlyEditor content={softWareInfo.sw_desc} />
                            </div>
                        </div>
                    </Card>
                )}
            </EditorWrap>
        </ErrorBoundary>
    );
}