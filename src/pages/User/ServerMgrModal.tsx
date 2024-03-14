import { Button, Divider, Input, List, Modal, Space } from "antd";
import React, { useEffect, useState } from "react";
import type { ServerInfo } from "@/api/client_cfg";
import { list_server, save_server_list } from "@/api/client_cfg";

export interface ServerMgrModalProps {
    onClose: () => void;
    onChange: () => void;
}

const ServerMgrModal = (props: ServerMgrModalProps) => {
    const [serverList, setServerList] = useState([] as ServerInfo[]);
    const [newServAddr, setNewServAddr] = useState("");
    const [hasChange, setHasChange] = useState(false);

    const loadServerList = async () => {
        const res = await list_server(false);
        setServerList(res.server_list);
    };

    const saveServerList = async () => {
        await save_server_list(serverList);
        props.onChange();
        props.onClose();
    };

    useEffect(() => {
        loadServerList();
    }, [])

    return (
        <Modal open title="服务器管理"
            width="400px"
            bodyStyle={{ maxHeight: "calc(100vh - 400px)", overflowY: "scroll" }}
            okText="更新" okButtonProps={{ disabled: !hasChange }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                saveServerList();
            }}>
            <List rowKey="addr" dataSource={serverList}
                renderItem={serverInfo => (
                    <List.Item extra={
                        <Space>
                            {serverInfo.system == true && serverInfo.default_server == false && (
                                <Button type="link" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    const tmpList = serverList.slice();
                                    tmpList.forEach(item => item.default_server = false);
                                    const index = tmpList.findIndex(item => item.addr == serverInfo.addr);
                                    if (index != -1) {
                                        tmpList[index].default_server = true;
                                        setServerList(tmpList);
                                        setHasChange(true);
                                    }
                                }}>设为默认服务器</Button>
                            )}
                            {serverInfo.system == false && (
                                <>
                                    {serverInfo.default_server == false && (
                                        <Button type="link" onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = serverList.slice();
                                            tmpList.forEach(item => item.default_server = false);
                                            const index = tmpList.findIndex(item => item.addr == serverInfo.addr);
                                            if (index != -1) {
                                                tmpList[index].default_server = true;
                                                setServerList(tmpList);
                                                setHasChange(true);
                                            }
                                        }}>设为默认服务器</Button>
                                    )}
                                    <Button danger type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const tmpList = serverList.filter(item => item.addr != serverInfo.addr);
                                        setServerList(tmpList);
                                        setHasChange(true);
                                    }}>删除</Button>
                                </>
                            )}
                        </Space>
                    }>
                        <div>{serverInfo.name}{serverInfo.default_server ? "(默认服务器)" : ""}</div>
                    </List.Item>
                )} />
            <Divider orientation="left">新增私有部署服务器</Divider>
            <Space size="large">
                <Input style={{ width: "280px" }} value={newServAddr} onChange={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setNewServAddr(e.target.value.trim());
                }} />
                <Button type="primary" disabled={newServAddr == ""} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    const tmpList = serverList.slice();
                    tmpList.push({
                        name: newServAddr,
                        system: false,
                        addr: newServAddr,
                        default_server: false,
                    });
                    setServerList(tmpList);
                    setHasChange(true);
                }}>新增</Button>
            </Space>
        </Modal>
    );
};

export default ServerMgrModal;