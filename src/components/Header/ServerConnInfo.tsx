//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Divider, Form, Popover, Select, Space, message } from "antd";
import { useStores } from "@/hooks";
import type { ServerInfo } from '@/api/client_cfg';
import { list_server } from '@/api/client_cfg';
import { conn_grpc_server, get_conn_server_addr } from '@/api/main';
import { MoreOutlined } from "@ant-design/icons";
import { get_port, get_token } from '@/api/local_api';
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';
import { AdminLoginModal } from "@/pages/User/AdminLoginModal";
import ServerMgrModal from "@/pages/User/ServerMgrModal";

const ServerConnInfo = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');

    const [defaultAddr, setDefaultAddr] = useState("");
    const [serverList, setServerList] = useState<ServerInfo[]>([]);
    const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
    const [showServerMgrModal, setShowServerMgrModal] = useState(false);

    const loadServerList = async () => {
        const res = await list_server(false);
        setServerList(res.server_list);
        const connServAddr = await get_conn_server_addr();
        for (const server of res.server_list) {
            if (server.addr.replace("http://", "") == connServAddr.replace("http://", "")) {
                setDefaultAddr(server.addr);
                return;
            }
        }
        res.server_list.forEach((item) => {
            if (item.default_server) {
                setDefaultAddr(item.addr);
            }
        });
    };

    const connServer = async () => {
        if (defaultAddr == "") {
            return;
        }
        const res = await conn_grpc_server(defaultAddr);
        if (!res) {
            message.error('连接失败');
        }
        appStore.loadClientCfg();
        appStore.loadLocalProxy();
    };

    const openLocalApi = async () => {
        const port = await get_port();
        const token = await get_token();

        const label = "localapi";
        const view = WebviewWindow.getByLabel(label);
        if (view != null) {
            await view.close();
        }
        const pos = await appWindow.innerPosition();

        new WebviewWindow(label, {
            url: `local_api.html?port=${port}&token=${token}`,
            width: 800,
            minWidth: 800,
            height: 600,
            minHeight: 600,
            center: true,
            title: "本地接口调试",
            resizable: true,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
    };

    useEffect(() => {
        loadServerList();
    }, []);

    useEffect(() => {
        connServer();
    }, [defaultAddr]);

    return (
        <>
            <Form layout="inline">
                <Form.Item label="服务器">
                    <Select
                        style={{ width: '150px' }}
                        value={defaultAddr}
                        onChange={(v) => setDefaultAddr(v)}
                        disabled={userStore.sessionId != ""}
                    >
                        {serverList.map((item) => (
                            <Select.Option key={item.addr} value={item.addr}>
                                {item.system ? (
                                    <div style={{ height: "20px", fontSize: "16px" }}>{item.name}</div>
                                ) : (
                                    <div style={{ height: "20px", fontSize: "16px" }}>
                                        {item.name}
                                    </div>
                                )}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item>
                    <Popover trigger="click" placement="bottom" content={
                        <Space direction="vertical" style={{ padding: "10px 10px" }}>
                            {userStore.sessionId == "" && (<Button type="link"
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowServerMgrModal(true);
                                }}>管理服务器</Button>)}
                            <Button type="link" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                appStore.showGlobalServerModal = true;
                            }}>设置全局服务器</Button>
                            {(appStore.clientCfg?.enable_admin) == true && userStore.sessionId == "" && (
                                <Button type="link" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowAdminLoginModal(true);
                                }}>管理后台</Button>
                            )}
                            <Divider style={{ margin: "0px 0px" }} />
                            <Button type="link" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                openLocalApi();
                            }}>调试本地接口</Button>
                        </Space>
                    }>
                        <MoreOutlined />
                    </Popover>
                </Form.Item>
            </Form>
            {showAdminLoginModal == true && (
                <AdminLoginModal onClose={() => setShowAdminLoginModal(false)} />
            )}
            {showServerMgrModal == true && (
                <ServerMgrModal onChange={() => loadServerList()} onClose={() => setShowServerMgrModal(false)} />
            )}
        </>
    );
};

export default observer(ServerConnInfo);