import React, { useState } from "react";
import { Button, Form, Input, message, Modal, Radio, Tabs } from "antd";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { FolderOpenOutlined } from "@ant-design/icons";
import { start } from "@/api/widget";
import { uniqId } from "@/utils/utils";

export interface OpenGitFileModalProps {
    filePath: string;
    onClose: () => void;
}

const OpenGitFileModal = (props: OpenGitFileModalProps) => {

    const [activeKey, setActiveKey] = useState<"widget" | "debug">("widget");

    const [useUrl, setUseUrl] = useState(true);
    const [remoteUrl, setRemoteUrl] = useState("");
    const [localPath, setLocalPath] = useState("");


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
        await start(`gw:${uniqId()}`, props.filePath, path, props.filePath);
        props.onClose();
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
                        children: "TODO",
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