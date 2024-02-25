import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Form, Input, InputNumber, Modal, message } from "antd";
import { get_group, update_group } from "@/api/project_idea";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";


export interface UpdateGroupModalProps {
    ideaGroupId: string;
    onClose: () => void;
}


const UpdateGroupModal = (props: UpdateGroupModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [groupName, setGroupName] = useState("");
    const [groupWeight, setGroupWeight] = useState(0);

    const loadGroupInfo = async () => {
        const res = await request(get_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_group_id: props.ideaGroupId,
        }));
        setGroupName(res.group.name);
        setGroupWeight(res.group.weight);
    };

    const updateGroup = async () => {
        if (groupName == "") {
            return;
        }
        await request(update_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_group_id: props.ideaGroupId,
            name: groupName,
            weight: groupWeight,
        }));
        message.info("更新成功");
        props.onClose();
    };

    useEffect(() => {
        loadGroupInfo();
    }, []);

    return (
        <Modal open title="更新知识点分组"
            okText="更新" okButtonProps={{ disabled: groupName == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updateGroup();
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

export default observer(UpdateGroupModal);