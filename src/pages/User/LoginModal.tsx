import { Button, Form, Input, Modal, Space, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import Reset from "./Reset";
import Register from "./Register";
import { get_conn_server_addr } from "@/api/main";
import { USER_TYPE_INTERNAL } from "@/api/user";
import iconAtomgit from '@/assets/allIcon/icon-atomgit.png';
import { ExportOutlined } from "@ant-design/icons";
import { WebviewWindow } from '@tauri-apps/api/window';
import { sleep } from "@/utils/time";


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

    const openAtomLoginPage = async () => {
        const label = "atomGitLogin";
        const win = await WebviewWindow.getByLabel(label);
        if (win != null) {
            await win.close();
        }
        await sleep(200);
        new WebviewWindow(label, {
            url: `https://atomgit.com/login/oauth/authorize?client_id=${appStore.clientCfg?.atom_git_client_id ?? ""}&state=state_test`,
            title: "AtomGit授权登录",
            alwaysOnTop: true,
        });
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
            bodyStyle={{ padding: "0px 10px" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                userStore.showUserLogin = null;
            }}>
            {loginTab == "login" && (
                <Tabs tabPosition="top" type="card" defaultActiveKey={appStore.clientCfg?.atom_git_client_id != "" ? "extern" : "password"}>
                    {appStore.clientCfg?.atom_git_client_id != "" && (
                        <Tabs.TabPane tab="外部账号" key="extern" style={{ padding: "20px 10px" }}>
                            <Space>
                                <div style={{ width: "150px" }}>
                                    <img src={iconAtomgit} style={{ width: "20px", marginRight: "10px" }} />
                                    AtomGit
                                </div>
                                <div style={{ width: "200px" }}>
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        openAtomLoginPage();
                                    }}>授权登录&nbsp;<ExportOutlined /></a>
                                </div>
                                <div><a href="https://passport.atomgit.com/login" target="_blank" rel="noreferrer">注册账号&nbsp;<ExportOutlined /></a></div>
                            </Space>
                        </Tabs.TabPane>
                    )}
                    <Tabs.TabPane tab="内部账号" key="password">
                        <Form labelCol={{ span: 3 }}>
                            <Form.Item label="用户名">
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
                                        userStore.callLogin(userName, password, USER_TYPE_INTERNAL).then(() => {
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
                            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e4e4e8", paddingTop: "10px", marginTop: "10px", marginBottom: "10px" }}>
                                <Space size="large">
                                    <Button onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        userStore.showUserLogin = null;
                                    }}>取消</Button>
                                    <Button type="primary" disabled={userName == "" || password == ""} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        userStore.callLogin(userName, password, USER_TYPE_INTERNAL).then(() => {
                                            localStorage.setItem(`${connAddr}:username`, userName);
                                        });
                                    }}>登录</Button>
                                </Space>
                            </div>
                        </Form>
                    </Tabs.TabPane>
                </Tabs>

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