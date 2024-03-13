import { Form, Input, InputNumber, Modal, message } from "antd";
import React, { useState } from "react";
import { observer } from 'mobx-react';
import { create_group } from "@/api/project_idea";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";



export interface CreateOrImportGroupModalProps {
    onClose: () => void;
}

const CreateOrImportGroupModal = (props: CreateOrImportGroupModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [groupName, setGroupName] = useState("");
    const [groupWeight, setGroupWeight] = useState(0);

    const createGroup = async () => {
        if (groupName == "") {
            return;
        }
        await request(create_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            name: groupName,
            weight: groupWeight,
        }));
        message.info("创建知识点分组成功");
        props.onClose();
    };


    return (
        <Modal open title="创建知识点分组"
            okText="创建"
            okButtonProps={{ disabled: groupName == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createGroup();
            }}>

            <Form labelCol={{ span: 3 }}>
                <Form.Item label="名称">
                    <Input value={groupName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setGroupName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="排序权重" help="数值越大，排序越前。有效值(0-99)">
                    <InputNumber value={groupWeight} onChange={value => {
                        if (value != null) {
                            setGroupWeight(value);
                        }
                    }} precision={0} min={0} max={99} controls={false} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default observer(CreateOrImportGroupModal);