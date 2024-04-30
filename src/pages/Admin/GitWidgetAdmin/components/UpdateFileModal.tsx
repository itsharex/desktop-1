//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { uniqId } from "@/utils/utils";
import { Button, Form, Input, message, Modal, Progress } from "antd";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import type { FsProgressEvent } from '@/api/fs';
import { write_file, set_file_owner, FILE_OWNER_TYPE_WIDGET_STORE, GLOBAL_WIDGET_STORE_FS_ID } from "@/api/fs";
import { pack_min_app } from "@/api/min_app";
import { update_file } from "@/api/widget_admin";
import { get_admin_session } from "@/api/admin_auth";
import { request } from "@/utils/request";
import { FolderOpenOutlined } from "@ant-design/icons";

export interface UpdateFileModalProps {
    widgetId: string;
    onCancel: () => void;
    onOk: () => void;
}

const UpdateFileModal = (props: UpdateFileModalProps) => {
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

    const updateWidgetFile = async () => {
        //打包目录
        const uploadFilePath = await pack_min_app(localPath, "");
        //上传文件
        const sessionId = await get_admin_session();
        const fileRes = await request(write_file(sessionId, GLOBAL_WIDGET_STORE_FS_ID, uploadFilePath, uploadId));
        //更新文件
        await request(update_file({
            admin_session_id: sessionId,
            widget_id: props.widgetId,
            file_id: fileRes.file_id,
        }));
        //设置owner
        await request(set_file_owner({
            session_id: sessionId,
            fs_id: GLOBAL_WIDGET_STORE_FS_ID,
            file_id: fileRes.file_id,
            owner_type: FILE_OWNER_TYPE_WIDGET_STORE,
            owner_id: props.widgetId,
        }));
        props.onOk();
        message.info("更新成功");
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
        <Modal open title="更新插件文件"
            okText="更新" okButtonProps={{ disabled: localPath == "" || uploadRatio != 0 }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updateWidgetFile();
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

export default UpdateFileModal;