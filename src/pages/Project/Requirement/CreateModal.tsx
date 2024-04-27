//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { observer } from 'mobx-react';
import { Form, Input, Modal, message } from "antd";
import { useStores } from "@/hooks";
import { change_file_fs, change_file_owner, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_PROJECT, FILE_OWNER_TYPE_REQUIRE_MENT } from "@/api/fs";
import { request } from "@/utils/request";
import { create_requirement } from "@/api/project_requirement";

const CreateModal = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [title, setTitle] = useState("");

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.require_ment_fs_id ?? '',
        ownerType: FILE_OWNER_TYPE_PROJECT,
        ownerId: projectStore.curProjectId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
    });

    const createRequirement = async () => {
        if (title == "") {
            message.error("标题不能为空");
            return;
        }
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        //更新文件存储
        await change_file_fs(
            content,
            projectStore.curProject?.require_ment_fs_id ?? '',
            userStore.sessionId,
            FILE_OWNER_TYPE_PROJECT,
            projectStore.curProjectId,
        );
        //创建项目需求
        const createRes = await request(create_requirement({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            base_info: {
                title: title,
                content: JSON.stringify(content),
                tag_id_list: [],
            },
        }));
        //变更文件Owner
        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_REQUIRE_MENT, createRes.requirement_id);

        message.info("创建需求成功");
        //跳转到详情页面
        projectStore.projectModal.createRequirement = false;
        projectStore.projectModal.requirementId = createRes.requirement_id;
        projectStore.projectModal.requirementTab = "detail";
    };

    return (
        <Modal open title="创建项目需求"
            okText="创建" okButtonProps={{ disabled: title.trim() == "" }} width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.createRequirement = false;
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createRequirement();
            }}>
            <Form>
                <Form.Item label="标题">
                    <Input
                        allowClear
                        bordered={false}
                        placeholder={`请输入需求标题`}
                        style={{ marginBottom: '12px', borderBottom: "1px solid #e4e4e8" }}
                        onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setTitle(e.target.value);
                        }}
                    />
                </Form.Item>
                <Form.Item label="内容">
                    <div className="_chatContext">{editor}</div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default observer(CreateModal);