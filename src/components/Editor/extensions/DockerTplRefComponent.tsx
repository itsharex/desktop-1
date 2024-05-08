//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import { useCommands } from '@remirror/react';
import type { NodeViewComponentProps } from '@remirror/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EditorWrap from '../components/EditorWrap';
import type { AppWithTemplateInfo } from '@/api/docker_template';
import { get_app_with_template } from "@/api/docker_template";
import { request } from '@/utils/request';
import { Button, Empty, Space, Image, List, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import AsyncImage from '@/components/AsyncImage';
import { GLOBAL_DOCKER_TEMPLATE_FS_ID, download_file } from '@/api/fs';
import { useStores } from '@/hooks';
import { check_unpark, unpack_template } from "@/api/docker_template";
import DockerTemplateModal from '@/pages/PubRes/components/DockerTemplateModal';

export type DockerTplRefProps = NodeViewComponentProps & {
    dockerAppId: string;
};

export const DockerTplRef = (props: DockerTplRefProps) => {
    const userStore = useStores('userStore');
    const appStore = useStores("appStore");

    const { deleteDockerTplRef } = useCommands();

    const [awtInfo, setAwtInfo] = useState<AppWithTemplateInfo | null>(null);
    const [templatePath, setTemplatePath] = useState("");

    const removeNode = () => {
        deleteDockerTplRef((props.getPosition as () => number)());
    };

    const loadAwtInfo = async () => {
        const res = await request(get_app_with_template({
            app_id: props.dockerAppId,
        }));
        setAwtInfo(res.info);
    };

    const getImageUrl = (fileId: string) => {
        if (appStore.isOsWindows) {
            return `https://fs.localhost/${GLOBAL_DOCKER_TEMPLATE_FS_ID}/${fileId}/image.png`;
        } else {
            return `fs://localhost/${GLOBAL_DOCKER_TEMPLATE_FS_ID}/${fileId}/image.png`;
        }
    };

    const prepareTemplate = async (fileId: string) => {
        const downloadRes = await download_file(userStore.sessionId, GLOBAL_DOCKER_TEMPLATE_FS_ID, fileId, "", "template.zip");
        const checkRes = await check_unpark(GLOBAL_DOCKER_TEMPLATE_FS_ID, fileId);
        if (!checkRes) {
            await unpack_template(GLOBAL_DOCKER_TEMPLATE_FS_ID, fileId);
        }
        if (appStore.isOsWindows) {
            setTemplatePath(`${downloadRes.local_dir}\\template`);
        } else {
            setTemplatePath(`${downloadRes.local_dir}/template`);
        }
    };

    useEffect(() => {
        loadAwtInfo();
    }, [props.dockerAppId]);

    return (
        <ErrorBoundary>
            <EditorWrap onChange={props.view.editable ? () => removeNode() : undefined}
                style={{ width: "100%" }}>
                {awtInfo == null && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
                {awtInfo != null && (
                    <Card bordered={false} title={awtInfo.app_info.name} headStyle={{ fontSize: "20px", fontWeight: 700, backgroundColor: "#eee" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 600 }}>模板版本</h2>
                        <Space>
                            {awtInfo.template_info_list.map(template => (
                                <Button key={template.version} type="primary" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    prepareTemplate(template.file_id);
                                }} disabled={props.view.editable}>{template.version}&nbsp;<DownloadOutlined /></Button>
                            ))}
                        </Space>
                        <h2 style={{ fontSize: "18px", fontWeight: 600 }}>模板描述</h2>
                        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{awtInfo?.app_info.desc ?? ""}</pre>
                        {(awtInfo?.app_info.image_list ?? []).length > 0 && (
                            <>
                                <h2 style={{ fontSize: "18px", fontWeight: 600 }}>相关截图</h2>
                                <Image.PreviewGroup>
                                    <List rowKey="thumb_file_id" dataSource={awtInfo?.app_info.image_list ?? []} grid={{ gutter: 16 }}
                                        renderItem={imageItem => (
                                            <List.Item>
                                                <AsyncImage src={getImageUrl(imageItem.thumb_file_id)}
                                                    preview={{ src: getImageUrl(imageItem.raw_file_id) }} width={200} height={150} useRawImg={false} />
                                            </List.Item>
                                        )} />
                                </Image.PreviewGroup>

                            </>
                        )}
                    </Card>
                )}
                {templatePath !== "" && (
                    <DockerTemplateModal templatePath={templatePath} onCancel={() => setTemplatePath("")} />
                )}
            </EditorWrap>
        </ErrorBoundary>
    );
};