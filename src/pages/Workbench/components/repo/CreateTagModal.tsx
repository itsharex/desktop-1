//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { add_tag } from "@/api/git_wrap";
import { LocalRepoInfo } from "@/api/local_repo";
import { Form, Input, message, Modal } from "antd";


export interface CreateTagModalProps {
    repo: LocalRepoInfo;
    commitId: string;
    onCancel: () => void;
    onOk: () => void;
}

const CreateTagModal = (props: CreateTagModalProps) => {
    const [newTagName, setNewTagName] = useState("");

    const createTag = async () => {
        try {
            await add_tag(props.repo.path, newTagName, props.commitId);
            props.onOk();
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
        }
    };

    return (
        <Modal open title="创建标记"
            okText="创建" okButtonProps={{ disabled: newTagName == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createTag();
            }}>
            <Form>
                <Form.Item label="新标记名称">
                    <Input value={newTagName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setNewTagName(e.target.value.trim());
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );

};


export default CreateTagModal;