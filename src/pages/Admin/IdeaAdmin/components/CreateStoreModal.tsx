import React, { useState } from "react";
import { get_admin_session } from '@/api/admin_auth';
import { Form, Input, InputNumber, Modal, message } from "antd";
import { request } from "@/utils/request";
import { create_store } from "@/api/project_idea_admin";


export interface CreateStoreModalProps {
    storeCateId: string;
    onCancel: () => void;
    onOk: () => void;
}

const CreateStoreModal = (props: CreateStoreModalProps) => {
    const [name, setName] = useState("");
    const [weight, setWeight] = useState(0);

    const createStore = async () => {
        const sessionId = await get_admin_session();
        await request(create_store({
            admin_session_id: sessionId,
            store_cate_id: props.storeCateId,
            name: name,
            weight: weight,
        }));
        message.info("增加知识库成功");
        props.onOk();
    };

    return (
        <Modal open title="增加知识库"
            okText="增加" okButtonProps={{ disabled: name == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createStore();
            }}>
            <Form labelCol={{ span: 3 }}>
                <Form.Item label="名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="排序权重">
                    <InputNumber value={weight} onChange={value => {
                        if (value != null) {
                            setWeight(value);
                        }
                    }} precision={0} min={0} max={99} controls={false} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateStoreModal;