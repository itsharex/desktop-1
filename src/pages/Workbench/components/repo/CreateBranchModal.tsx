import React, { useState } from "react";
import { create_branch, LocalRepoInfo } from "@/api/local_repo";
import { Form, Input, message, Modal } from "antd";

export interface CreateBranchModalProps {
    repo: LocalRepoInfo;
    fromBranch: string;
    onCancel: () => void;
    onOk: () => void;
}

const CreateBranchModal = (props: CreateBranchModalProps) => {

    const [newBranchName, setNewBranchName] = useState("");

    const createBranch = async () => {
        try {
            await create_branch(props.repo.path, props.fromBranch, newBranchName);
            props.onOk();
        } catch (e) {
            message.error(`${e}`);
        }
    };

    return (
        <Modal open title="创建分支"
            okText="创建" okButtonProps={{ disabled: ["", props.fromBranch].includes(newBranchName) }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createBranch();
            }}>
            <Form>
                <Form.Item label="新分支名称">
                    <Input value={newBranchName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setNewBranchName(e.target.value.trim());
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateBranchModal;