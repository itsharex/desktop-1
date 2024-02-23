import { Form, Input, InputNumber, Modal, Tabs, message } from "antd";
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

    const [activeKey, setActiveKey] = useState<"add" | "import">("add");

    const [groupName, setGroupName] = useState("");
    const [groupWeight, setGroupWeight] = useState(0);

    const isValid = () => {
        if (activeKey == "add" && groupName != "") {
            return true;
        }
        return false;
    };

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
        <Modal open
            okText={activeKey == "add" ? "创建" : "导入"}
            okButtonProps={{ disabled: !isValid() }}
            bodyStyle={{padding:"4px 10px"}}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (activeKey == "add") {
                    createGroup();
                } else if (activeKey == "import") {
                    //TODO
                }
            }}>
            <Tabs activeKey={activeKey} onChange={key => setActiveKey(key as "add" | "import")}
                type="card"
                items={[
                    {
                        key: "add",
                        label: "创建知识点分组",
                        children: (
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
                        ),
                    },
                    {
                        key: "import",
                        label: "导入知识点仓库",
                    }
                ]} />
        </Modal>
    );
};

export default observer(CreateOrImportGroupModal);