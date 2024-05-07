//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { observer } from 'mobx-react';
import {  Form, Input, Modal, message } from "antd";
import { create } from "@/api/project_bulletin";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { change_file_owner, is_empty_doc, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_BULLETIN, FILE_OWNER_TYPE_PROJECT } from "@/api/fs";


const CreateBulletinModal = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [title, setTitle] = useState("");

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.bulletin_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_PROJECT,
        ownerId: projectStore.curProjectId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
    });

    const createBulletin = async () => {
        if (title.trim() == "") {
            message.error("标题不能为空");
            return;
        }
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        if (is_empty_doc(content)) {
            message.error("内容不能为空");
            return;
        }
        const createRes = await request(create({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            title: title.trim(),
            content: JSON.stringify(content),
        }));
        //变更文件Owner
        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_BULLETIN, createRes.bulletin_id);
        projectStore.projectModal.createBulletin = false;
        message.info("创建成功");
    };

    return (
        <Modal title="创建公告" open okText="创建" okButtonProps={{ disabled: title.trim() == "" }}
            width="calc(100vw - 400px)"
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.createBulletin = false;
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createBulletin();
            }}>
            <Form labelCol={{ span: 2 }}>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value);
                    }} />
                </Form.Item>
                <Form.Item label="内容">
                    <div className="_editChatContext">{editor}</div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default observer(CreateBulletinModal);