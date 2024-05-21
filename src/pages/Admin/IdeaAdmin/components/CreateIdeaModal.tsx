//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { Form, Input, Modal, message } from "antd";
import { get_admin_session } from '@/api/admin_auth';
import { useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { request } from "@/utils/request";
import { create_idea } from "@/api/idea_store_admin";

export interface CreateIdeaModalProps {
    ideaStoreId: string;
    onCancel: () => void;
    onOk: () => void;
}

const CreateIdeaModal = (props: CreateIdeaModalProps) => {
    const [title, setTitle] = useState("");

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
    });

    const createIdea = async () => {
        if (title.trim() == "") {
            return;
        }
        const sessionId = await get_admin_session();
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        await request(create_idea({
            admin_session_id: sessionId,
            idea_store_id: props.ideaStoreId,
            basic_info: {
                title: title.trim(),
                content: JSON.stringify(content),
            },
        }));
        props.onOk();
        message.info("创建成功");
    };

    return (
        <Modal open title="创建知识点"
            okText="创建" okButtonProps={{ disabled:  title.trim() == "" }}
            width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createIdea();
            }}>
            <Form labelCol={{ span: 3 }}>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="内容">
                    <div className="_editChatContext">
                        {editor}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateIdeaModal;