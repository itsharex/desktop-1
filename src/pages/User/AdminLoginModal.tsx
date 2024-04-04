import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";
import { pre_auth, auth, sign } from '@/api/admin_auth';
import { request } from "@/utils/request";
import { useHistory } from "react-router-dom";
import { ADMIN_PATH } from "@/utils/constant";
import { useStores } from "@/hooks";
import { runInAction } from "mobx";
import { homeDir, resolve } from "@tauri-apps/api/path";
import { list_ssh_key_name } from "@/api/local_repo";

export interface AdminLoginModalProps {
    onClose: () => void;
}

export const AdminLoginModal = (props: AdminLoginModalProps) => {
    const [form] = Form.useForm();

    const history = useHistory();

    const [userName, setUserName] = useState("");
    const userStore = useStores('userStore');
    const [curSshName, setCurSshName] = useState("");
    const [sshNameList, setSshNameList] = useState<string[]>([]);

    const loginAdmin = async () => {
        const preRes = await request(pre_auth({
            user_name: userName,
        }));
        const home = await homeDir();
        const privKey = await resolve(home, ".ssh", curSshName);
        const signRes = await sign(privKey, preRes.to_sign_str);
        await request(auth({
            admin_session_id: preRes.admin_session_id,
            sign: signRes,
        }));
        runInAction(() => {
            userStore.adminSessionId = preRes.admin_session_id;
        });
        userStore.showUserLogin = null;
        history.push(ADMIN_PATH);
    };

    useEffect(() => {
        list_ssh_key_name().then(res => {
            setSshNameList(res);
            if (res.length > 0 && (res.findIndex(item => item == curSshName) == -1)) {
                setCurSshName(res[0]);
            }
        });
    }, []);

    return (
        <Modal open title="登录管理后台"
            okText="登录" okButtonProps={{ disabled: userName == "" || curSshName == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                loginAdmin();
            }}>
            <Form form={form} labelCol={{ span: 5 }} >
                <Form.Item label="管理员账号" name="userName">
                    <Input value={userName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUserName(e.target.value);
                    }} />
                </Form.Item>
                <Form.Item label="OpenSsh密钥">
                    <Select value={curSshName} onChange={value => setCurSshName(value)}>
                        {sshNameList.map(item => (
                            <Select.Option key={item} value={item}>{item}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}; 