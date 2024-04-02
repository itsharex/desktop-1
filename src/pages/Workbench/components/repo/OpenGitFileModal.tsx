import React, { useState } from "react";
import { Button, Form, Input, List, message, Modal, Radio, Space, Spin, Tabs, Tag } from "antd";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { FolderOpenOutlined } from "@ant-design/icons";
import { start, type WidgetInfo } from "@/api/widget";
import { uniqId } from "@/utils/utils";
import { resolve } from '@tauri-apps/api/path';
import AsyncImage from "@/components/AsyncImage";
import { download_file, get_cache_file, GLOBAL_WIDGET_STORE_FS_ID } from "@/api/fs";
import { check_unpark, get_min_app_path, unpack_min_app } from '@/api/min_app';
import { useStores } from "@/hooks";

export interface OpenGitFileModalProps {
    widgetList: WidgetInfo[];
    basePath: string;
    curDirList: string[];
    curFileName: string;
    onClose: () => void;
}

const OpenGitFileModal = (props: OpenGitFileModalProps) => {
    const userStore = useStores("userStore");

    const [activeKey, setActiveKey] = useState<"widget" | "debug">("widget");

    const [useUrl, setUseUrl] = useState(true);
    const [remoteUrl, setRemoteUrl] = useState("");
    const [localPath, setLocalPath] = useState("");

    const [curWidgetId, setCurWidgetId] = useState("");

    const choicePath = async () => {
        const selected = await open_dialog({
            title: "打开本地插件目录",
            directory: true,
        });
        if (selected == null || Array.isArray(selected)) {
            return;
        }
        setLocalPath(selected);
    };

    const checkValid = (): boolean => {
        if (activeKey == "debug") {
            if (useUrl) {
                return true;
            } else {
                return localPath != "";
            }
        }
        return false;
    }

    const startDebug = async () => {
        let path = "";
        if (useUrl == true) {
            path = "http://localhost" + remoteUrl;
        } else {
            if (localPath.trim() == "") {
                message.error("请选择本地目录");
                return;
            }
            path = localPath;
        }
        const filePath = await resolve(props.basePath, ...props.curDirList, props.curFileName);
        await start(`gw:${uniqId()}`, filePath, path, filePath);
        props.onClose();
    };

    const startView = async (widgetFileId: string) => {
        try {
            //下载文件
            const res = await get_cache_file(GLOBAL_WIDGET_STORE_FS_ID, widgetFileId, "content.zip");
            let localFilePath = "";
            if (res.exist_in_local) {
                localFilePath = res.local_path;
            }
            if (localFilePath == "") {
                const downloadRes = await download_file(userStore.sessionId, GLOBAL_WIDGET_STORE_FS_ID, widgetFileId, "", "content.zip");
                localFilePath = downloadRes.local_path;
            }
            //解压文件
            const ok = await check_unpark(GLOBAL_WIDGET_STORE_FS_ID, widgetFileId);
            if (!ok) {
                await unpack_min_app(GLOBAL_WIDGET_STORE_FS_ID, widgetFileId, "");
            }
            const path = await get_min_app_path(GLOBAL_WIDGET_STORE_FS_ID, widgetFileId);
            const filePath = await resolve(props.basePath, ...props.curDirList, props.curFileName);
            await start(`gw:${uniqId()}`, filePath, path, filePath);
            props.onClose();
        } finally {
            setCurWidgetId("");
        }
    };

    return (
        <Modal open title="打开文件" footer={activeKey == "widget" ? null : undefined}
            okText="打开" okButtonProps={{ disabled: !checkValid() }}
            bodyStyle={{ padding: "0px 10px" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                startDebug();
            }}>
            <Tabs activeKey={activeKey} onChange={key => setActiveKey(key as "widget" | "debug")}
                items={[
                    {
                        key: "widget",
                        label: "打开方式",
                        children: (
                            <List rowKey="widget_id" dataSource={props.widgetList} pagination={false} grid={{ gutter: 16 }}
                                renderItem={widget => (
                                    <List.Item>
                                        <Tag style={{ padding: "4px 4px" }}>
                                            <a onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setCurWidgetId(widget.widget_id);
                                                startView(widget.file_id);
                                            }}>
                                                <Space>
                                                    <AsyncImage src={`fs://localhost/${GLOBAL_WIDGET_STORE_FS_ID}/${widget.icon_file_id}/icon.png`} useRawImg style={{ width: "16px", borderRadius: "10px" }} />
                                                    {widget.widget_name}
                                                    {curWidgetId == widget.widget_id && <Spin size="small" />}
                                                </Space>
                                            </a>
                                        </Tag>
                                    </List.Item>
                                )} />
                        ),
                    },
                    {
                        key: "debug",
                        label: "其他打开方式",
                        children: (
                            <Form>
                                <Form.Item label="启动方式">
                                    <Radio.Group value={useUrl} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setUseUrl(e.target.value!);
                                    }}>
                                        <Radio value={true}>本地URL</Radio>
                                        <Radio value={false}>本地路径</Radio>
                                    </Radio.Group>
                                </Form.Item>
                                {useUrl == true && (
                                    <Form.Item label="url地址">
                                        <Input prefix="http://localhost" value={remoteUrl} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setRemoteUrl(e.target.value);
                                        }} />
                                    </Form.Item>
                                )}
                                {useUrl == false && (
                                    <Form.Item label="本地路径">
                                        <Input value={localPath} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setLocalPath(e.target.value);
                                        }}
                                            addonAfter={<Button type="link" style={{ height: 20 }} icon={<FolderOpenOutlined />} onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                choicePath();
                                            }} />} />
                                    </Form.Item>
                                )}
                            </Form>
                        ),
                    }
                ]} />
        </Modal>
    );
};

export default OpenGitFileModal;