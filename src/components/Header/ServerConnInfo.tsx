//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Form, Popover, Select, Space, message } from "antd";
import { useStores } from "@/hooks";
import type { ServerInfo } from '@/api/client_cfg';
import { list_server } from '@/api/client_cfg';
import { conn_grpc_server, get_conn_server_addr } from '@/api/main';
import { MoreOutlined } from "@ant-design/icons";
import ServerMgrModal from "@/pages/User/ServerMgrModal";


const ServerConnInfo = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');

    const [defaultAddr, setDefaultAddr] = useState("");
    const [serverList, setServerList] = useState<ServerInfo[]>([]);
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
                        </Space>
                    }>
                        <MoreOutlined />
                    </Popover>
                </Form.Item>
            </Form>
            {showServerMgrModal == true && (
                <ServerMgrModal onChange={() => loadServerList()} onClose={() => setShowServerMgrModal(false)} />
            )}
        </>
    );
};

export default observer(ServerConnInfo);