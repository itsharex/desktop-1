//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Divider, Form, Input, Select, Space, message } from "antd";
import { useStores } from "@/hooks";
import type { ServerInfo } from '@/api/client_cfg';
import { list_server, save_server_list } from '@/api/client_cfg';
import { conn_grpc_server, get_conn_server_addr } from '@/api/main';


const ServerConnInfo = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');

    const [defaultAddr, setDefaultAddr] = useState("");
    const [serverList, setServerList] = useState<ServerInfo[]>([]);
    const [newServerAddr, setNewServerAddr] = useState("");

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
                        style={{ width: "150px" }}
                        dropdownMatchSelectWidth={false}
                        value={defaultAddr}
                        onChange={(v) => setDefaultAddr(v)}
                        disabled={userStore.sessionId != ""}
                        dropdownRender={menu => (
                            <div style={{ padding: "10px 10px", width: "300px" }}>
                                {menu}
                                <Divider style={{ margin: '8px 0' }} />
                                <Space>
                                    <Input style={{ width: "190px" }} placeholder="请输入新服务器地址" value={newServerAddr} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setNewServerAddr(e.target.value.trim());
                                    }} />
                                    <Button type="primary" disabled={newServerAddr == "" || serverList.map(item => item.addr).includes(newServerAddr)}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = serverList.slice();
                                            tmpList.push({
                                                name: newServerAddr,
                                                system: false,
                                                addr: newServerAddr,
                                                default_server: false,
                                            });
                                            setServerList(tmpList);
                                            save_server_list(tmpList).then(() => setNewServerAddr(""));
                                        }}>增加服务器</Button>
                                </Space>
                                <Button type="link" style={{ minWidth: 0, padding: "0px 0px", marginTop: "10px" }} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    appStore.showGlobalServerModal = true;
                                }}>设置全局服务器</Button>
                            </div>
                        )}
                    >
                        {serverList.map((item) => (
                            <Select.Option key={item.addr} value={item.addr}>
                                {item.system ? (
                                    <Space style={{height:"20px"}}>
                                        <div style={{ height: "20px", fontSize: "16px", width: "150px", overflow: "hidden" }}>{item.name}</div>
                                        {item.default_server == false && (
                                            <a onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const tmpList = serverList.slice();
                                                tmpList.forEach(item2 => item2.default_server = false);
                                                const index = tmpList.findIndex(item2 => item2.addr == item.addr);
                                                if (index != -1) {
                                                    tmpList[index].default_server = true;
                                                    setServerList(tmpList);
                                                    save_server_list(tmpList);
                                                }
                                            }}>设为默认</a>
                                        )}
                                    </Space>
                                ) : (
                                    <Space style={{height:"20px"}}>
                                        <div style={{ height: "20px", fontSize: "16px", width: "150px", overflow: "hidden" }}>
                                            {item.name}
                                        </div>
                                        {item.default_server == false && (
                                            <a onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const tmpList = serverList.slice();
                                                tmpList.forEach(item2 => item2.default_server = false);
                                                const index = tmpList.findIndex(item2 => item2.addr == item.addr);
                                                if (index != -1) {
                                                    tmpList[index].default_server = true;
                                                    setServerList(tmpList);
                                                    save_server_list(tmpList);
                                                }
                                            }}>设为默认</a>
                                        )}
                                        {item.addr != defaultAddr && (
                                            <a style={{ color: "red" }} onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const tmpList = serverList.filter(item2 => item2.addr != item.addr);
                                                const index = tmpList.findIndex(item2 => item2.default_server);
                                                if (index == -1 && tmpList.length > 0) {
                                                    tmpList[0].default_server = true;
                                                }
                                                setServerList(tmpList);
                                                save_server_list(tmpList);
                                            }}>删除</a>
                                        )}
                                    </Space>
                                )}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </>
    );
};

export default observer(ServerConnInfo);