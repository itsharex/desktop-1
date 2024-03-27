import { Button, Form, Input, message, Modal, Progress } from "antd";
import React, { useEffect, useState } from "react";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { FolderOpenOutlined } from "@ant-design/icons";
import { resolve } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/api/fs';
import { pack_min_app } from "@/api/min_app";
import { write_file, set_file_owner, FILE_OWNER_TYPE_WIDGET_STORE, GLOBAL_WIDGET_STORE_FS_ID } from "@/api/fs";
import { get_admin_session } from "@/api/admin_auth";
import { request } from "@/utils/request";
import { uniqId } from "@/utils/utils";
import { add_widget } from "@/api/widget_admin";
import { listen } from '@tauri-apps/api/event';
import type { FsProgressEvent } from '@/api/fs';

interface WidgetConfig {
    name: string;
    extensions: string[];
    files: string[];
}

export interface AddWidgetModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const AddWidgetModal = (props: AddWidgetModalProps) => {
    const [uploadId] = useState(uniqId());

    const [localPath, setLocalPath] = useState("");
    const [uploadRatio, setUploadRatio] = useState(0);

    const choicePath = async () => {
        const selected = await open_dialog({
            title: "插件路径",
            directory: true,
        });
        if (selected == null || Array.isArray(selected)) {
            return;
        }
        setLocalPath(selected);
    };

    const addWidget = async () => {
        try {
            setUploadRatio(1);
            //读取配置
            const cfgPath = await resolve(localPath, "widget.json");
            const cfgData = await readTextFile(cfgPath);
            const cfg = JSON.parse(cfgData) as WidgetConfig;
            if (typeof cfg.name != "string" || Array.isArray(cfg.extensions) == false || Array.isArray(cfg.files) == false) {
                message.info("错误的配置");
                return;
            }
            //打包目录
            const uploadFilePath = await pack_min_app(localPath, "");
            //上传图标
            const iconPath = await resolve(localPath, "widget.png");
            const sessionId = await get_admin_session();
            const iconRes = await request(write_file(sessionId, GLOBAL_WIDGET_STORE_FS_ID, iconPath, ""));
            //上传文件
            const fileRes = await request(write_file(sessionId, GLOBAL_WIDGET_STORE_FS_ID, uploadFilePath, uploadId));
            //增加插件
            const addRes = await request(add_widget({
                admin_session_id: sessionId,
                widget_name: cfg.name,
                extension_list: cfg.extensions,
                file_list: cfg.files,
                file_id: fileRes.file_id,
                icon_file_id: iconRes.file_id,
                weight: 0,
            }));
            //设置owner
            await request(set_file_owner({
                session_id: sessionId,
                fs_id: GLOBAL_WIDGET_STORE_FS_ID,
                file_id: iconRes.file_id,
                owner_type: FILE_OWNER_TYPE_WIDGET_STORE,
                owner_id: addRes.widget_id,
            }));
            await request(set_file_owner({
                session_id: sessionId,
                fs_id: GLOBAL_WIDGET_STORE_FS_ID,
                file_id: fileRes.file_id,
                owner_type: FILE_OWNER_TYPE_WIDGET_STORE,
                owner_id: addRes.widget_id,
            }));
            props.onOk();
            message.info("增加成功");
        } finally {
            setUploadRatio(0);
        }
    };

    useEffect(() => {
        const unListenFn = listen('uploadFile_' + uploadId, (ev) => {
            const payload = ev.payload as FsProgressEvent;
            if (payload.total_step <= 0) {
                payload.total_step = 1;
            }
            if (payload.cur_step >= payload.total_step) {
                setUploadRatio(100);
            } else {
                setUploadRatio(Math.floor((payload.cur_step * 100) / payload.total_step));
            }
        })
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, []);

    return (
        <Modal open title="增加插件"
            okText="增加" okButtonProps={{ disabled: localPath == "" || uploadRatio != 0 }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addWidget();
            }}>
            <Form>
                <Form.Item label="插件路径" help={
                    <>
                        {uploadRatio > 0 && (<Progress percent={uploadRatio} />)}
                    </>
                }>
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
            </Form>
        </Modal>
    );
};

export default AddWidgetModal;