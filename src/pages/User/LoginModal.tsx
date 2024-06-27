//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Button, Form, Input, Modal, Space, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { get_conn_server_addr } from "@/api/main";
import { USER_TYPE_INTERNAL } from "@/api/user";
import iconAtomgit from '@/assets/allIcon/icon-atomgit.png';
import iconGitee from '@/assets/allIcon/icon-gitee.png';
import iconGitlab from '@/assets/allIcon/icon-gitlab.png';
import { ExportOutlined } from "@ant-design/icons";
import { WebviewWindow } from '@tauri-apps/api/window';
import { sleep } from "@/utils/time";


const LoginModal = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [connAddr, setConnAddr] = useState("");

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
            width: 1200,
            height: 760,
        });
    }

    const openGiteeLoginPage = async () => {
        const label = "giteeLogin";
        const win = await WebviewWindow.getByLabel(label);
        if (win != null) {
            await win.close();
        }
        await sleep(200);
        new WebviewWindow(label, {
            url: `https://gitee.com/oauth/authorize?client_id=${appStore.clientCfg?.gitee_client_id ?? ""}&redirect_uri=${encodeURIComponent("https://www.linksaas.pro/callback/gitee")}&response_type=code`,
            title: "Gitee授权登录",
            alwaysOnTop: true,
            width: 1200,
            height: 760,
        });
    };

    const openJihulabLoginPage = async () => {
        const label = "jihulabLogin";
        const win = await WebviewWindow.getByLabel(label);
        if (win != null) {
            await win.close();
        }
        await sleep(200);
        new WebviewWindow(label, {
            url: `https://jihulab.com/oauth/authorize?client_id=${appStore.clientCfg?.jihulab_client_id ?? ""}&redirect_uri=${encodeURIComponent("https://www.linksaas.pro/callback/jihulab")}&response_type=code&state=STATE&scope=${encodeURIComponent("read_api read_user")}`,
            title: "Jihulab授权登录",
            alwaysOnTop: true,
            width: 1200,
            height: 760,
        });
    };

    useEffect(() => {
        get_conn_server_addr().then(addr => {
            const tmpAddr = addr.replace("http://", "");
            setConnAddr(tmpAddr);
            const tmpUserName = localStorage.getItem(`${tmpAddr}:username`) ?? "";
            setUserName(tmpUserName);
        })
    }, []);


    return (
        <Modal title={<span style={{ fontSize: "16px", fontWeight: 600 }}>登录</span>} open footer={null}
            bodyStyle={{ padding: "0px 10px" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                userStore.showUserLogin = false;
            }}>
            <Tabs tabPosition="top" type="card" defaultActiveKey={(appStore.clientCfg?.atom_git_client_id != "" || appStore.clientCfg?.gitee_client_id != "") ? "extern" : "password"}>
                {(appStore.clientCfg?.atom_git_client_id != "" || appStore.clientCfg?.gitee_client_id != "") && (
                    <Tabs.TabPane tab="外部账号" key="extern" style={{ padding: "20px 10px" }}>
                        {appStore.clientCfg?.atom_git_client_id != "" && (
                            <Space style={{ marginBottom: "20px" }}>
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
                        )}
                        {appStore.clientCfg?.gitee_client_id != "" && (
                            <Space style={{ marginBottom: "20px" }}>
                                <div style={{ width: "150px" }}>
                                    <img src={iconGitee} style={{ width: "20px", marginRight: "10px" }} />
                                    Gitee
                                </div>
                                <div style={{ width: "200px" }}>
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        openGiteeLoginPage();
                                    }}>授权登录&nbsp;<ExportOutlined /></a>
                                </div>
                                <div><a href="https://gitee.com/signup" target="_blank" rel="noreferrer">注册账号&nbsp;<ExportOutlined /></a></div>
                            </Space>
                        )}
                        {appStore.clientCfg?.jihulab_client_id != "" && (
                            <Space style={{ marginBottom: "20px" }}>
                                <div style={{ width: "150px" }}>
                                    <img src={iconGitlab} style={{ width: "20px", marginRight: "10px" }} />
                                    Jihulab
                                </div>
                                <div style={{ width: "200px" }}>
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        openJihulabLoginPage();
                                    }}>授权登录&nbsp;<ExportOutlined /></a>
                                </div>
                                <div><a href="https://jihulab.com/users/sign_up" target="_blank" rel="noreferrer">注册账号&nbsp;<ExportOutlined /></a></div>
                            </Space>
                        )}
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
                                        userStore.showUserLogin = false;
                                    });
                                }
                            }} />
                        </Form.Item>
                        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e4e4e8", paddingTop: "10px", marginTop: "10px", marginBottom: "10px" }}>
                            <Space size="large">
                                <Button onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    userStore.showUserLogin = false;
                                }}>取消</Button>
                                <Button type="primary" disabled={userName == "" || password == ""} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    userStore.callLogin(userName, password, USER_TYPE_INTERNAL).then(() => {
                                        localStorage.setItem(`${connAddr}:username`, userName);
                                        userStore.showUserLogin = false;
                                    });
                                }}>登录</Button>
                            </Space>
                        </div>
                    </Form>
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};

export default observer(LoginModal);