import { Button, Form, Input, Modal, Space } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import Reset from "./Reset";
import Register from "./Register";
import { get_conn_server_addr } from "@/api/main";


const LoginModal = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loginTab, setLoginTab] = useState<"login" | "reset" | "register">("login");
    const [connAddr, setConnAddr] = useState("");

    const getLoginTagStr = () => {
        if (loginTab == "login") {
            return `请登录`;
        } else if (loginTab == "reset") {
            return `重置密码`;
        } else if (loginTab == "register") {
            return `注册账号`;
        }
        return "";
    }

    useEffect(() => {
        get_conn_server_addr().then(addr => {
            const tmpAddr = addr.replace("http://", "");
            setConnAddr(tmpAddr);
            const tmpUserName = localStorage.getItem(`${tmpAddr}:username`) ?? "";
            setUserName(tmpUserName);
        })
    }, []);


    return (
        <Modal title={<span style={{ fontSize: "16px", fontWeight: 600 }}>{getLoginTagStr()}</span>} open footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                userStore.showUserLogin = null;
            }}>
            {loginTab == "login" && (
                <Form labelCol={{ span: 3 }}>
                    <Form.Item label="用户名" help={appStore.clientCfg?.login_prompt ?? ""}>
                        <Input value={userName} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setUserName(e.target.value.trim());
                        }} />
                    </Form.Item>
                    <Form.Item label="密码">
                        <Input.Password value={password} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setPassword(e.target.value.trim());
                        }} onKeyDown={e => {
                            if (e.key == "Enter") {
                                e.stopPropagation();
                                e.preventDefault();
                                if (userName == "" || password == "") {
                                    return;
                                }
                                userStore.callLogin(userName, password).then(() => {
                                    localStorage.setItem(`${connAddr}:username`, userName);
                                });
                            }
                        }} />
                    </Form.Item>
                    <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "14px" }}>
                        <Space size="large">
                            {appStore.clientCfg?.can_register == true && (
                                <a onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setLoginTab("reset");
                                }}>
                                    忘记密码
                                </a>
                            )}
                            {appStore.clientCfg?.can_register == true && (
                                <a onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setLoginTab("register");
                                }}>
                                    注册新账号
                                </a>
                            )}
                        </Space>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e4e4e8", paddingTop: "10px", marginTop: "10px" }}>
                        <Space size="large">
                            <Button onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                userStore.showUserLogin = null;
                            }}>取消</Button>
                            <Button type="primary" disabled={userName == "" || password == ""} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                userStore.callLogin(userName, password).then(() => {
                                    localStorage.setItem(`${connAddr}:username`, userName);
                                });
                            }}>登录</Button>
                        </Space>
                    </div>
                </Form>
            )}
            {loginTab == "reset" && (<Reset onClose={() => setLoginTab("login")} />)}
            {loginTab == "register" && (<Register
                onCancel={() => setLoginTab("login")}
                onOk={name => {
                    setLoginTab("login");
                    setUserName(name);
                }} />)}
        </Modal>
    );
};

export default observer(LoginModal);