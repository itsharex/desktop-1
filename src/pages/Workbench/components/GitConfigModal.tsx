import { list_config, set_config } from "@/api/local_repo";
import { Form, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";

export interface GitConfigModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const GitConfigModal = (props: GitConfigModalProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [hasChange, setHasChange] = useState(false);


    const updateConfig = async () => {
        await set_config("user.name",username);
        await set_config("user.email",email);
        props.onOk();
        message.info("更新成功");
    };

    useEffect(() => {
        list_config().then(items => {
            for (const item of items) {
                if (item.name == "user.name") {
                    setUsername(item.value);
                } else if (item.name == "user.email") {
                    setEmail(item.value);
                }
            }
        });
    }, []);

    return (
        <Modal open title="git用户配置"
            okText="更新" okButtonProps={{ disabled: !(username != "" && email.includes("@") && hasChange) }}
            onCancel={e=>{
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e=>{
                e.stopPropagation();
                e.preventDefault();
                updateConfig();
            }}>
            <Form labelCol={{ span: 4 }}>
                <Form.Item label="user.name">
                    <Input value={username} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setHasChange(true);
                        setUsername(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="user.email" help={
                    <>
                        {email != "" && email.includes("@") == false && (
                            <span style={{ color: "red" }}>请输入正确的邮件地址</span>
                        )}
                    </>
                }>
                    <Input value={email} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setHasChange(true);
                        setEmail(e.target.value.trim());
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default GitConfigModal;