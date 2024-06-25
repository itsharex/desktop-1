//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, message, Modal, Space, Table } from "antd";
import type { GitVpSourceInfo } from "@/api/git_vp";
import { list_git_vp_source } from "@/api/git_vp";
import { add_git_vp_source, update_git_vp_source, remove_git_vp_source, get_secret, renew_secret } from "@/api/git_vp_admin";
import { request } from "@/utils/request";
import { get_admin_perm, get_admin_session } from "@/api/admin_auth";
import type { AdminPermInfo } from '@/api/admin_auth';
import type { ColumnsType } from 'antd/es/table';
import { EditNumber } from "@/components/EditCell/EditNumber";
import { writeText } from '@tauri-apps/api/clipboard';

interface AddVpSourceModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const AddVpSourceModal = (props: AddVpSourceModalProps) => {
    const [vpSourceId, setVpSourceId] = useState("");
    const [weight, setWeight] = useState(0);

    const addVpSource = async () => {
        const sessionId = await get_admin_session();
        await request(add_git_vp_source({
            admin_session_id: sessionId,
            vp_source_info: {
                git_vp_source_id: vpSourceId,
                weight: weight,
            },
        }));
        props.onOk();
    };

    return (
        <Modal open title="增加数据来源"
            okText="增加" okButtonProps={{ disabled: vpSourceId == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addVpSource();
            }}>
            <Form labelCol={{ span: 3 }}>
                <Form.Item label="来源ID">
                    <Input value={vpSourceId} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setVpSourceId(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="权重">
                    <InputNumber controls={false} precision={0} min={0} max={99} value={weight} onChange={value => {
                        setWeight(value ?? 0);
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};


const GitVpSourceList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [vpSourceList, setVpSourceList] = useState<GitVpSourceInfo[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [renewVpSourceId, setRenewVpSourceId] = useState("");
    const [removeVpSourceId, setRemoveVpSourceId] = useState("");
    const [secret, setSecret] = useState("");

    const loadVpSourceList = async () => {
        const res = await request(list_git_vp_source({}));
        setVpSourceList(res.vp_source_list);
    };

    const getSecret = async (vpSourceId: string) => {
        const sessionId = await get_admin_session();
        const res = await request(get_secret({
            admin_session_id: sessionId,
            vp_source_id: vpSourceId,
        }));
        setSecret(res.secret);
    }

    const renewSecret = async () => {
        if (renewVpSourceId == "") {
            return;
        }
        const sessionId = await get_admin_session();
        await request(renew_secret({
            admin_session_id: sessionId,
            vp_source_id: renewVpSourceId,
        }));
        message.info("更换成功");
        setRenewVpSourceId("");
    };

    const removeVpSource = async () => {
        if (removeVpSourceId == "") {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_git_vp_source({
            admin_session_id: sessionId,
            vp_source_id: removeVpSourceId,
        }));
        setRemoveVpSourceId("");
        message.info("删除成功");
        await loadVpSourceList();
    };

    const columns: ColumnsType<GitVpSourceInfo> = [
        {
            title: "ID",
            dataIndex: "git_vp_source_id",
        },
        {
            title: "权重",
            render: (_, row: GitVpSourceInfo) => (
                <EditNumber editable={permInfo?.git_vp_perm.update_vp_source ?? false}
                    value={row.weight} onChange={async value => {
                        if ((value < 0) || (value > 99)) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_git_vp_source({
                                admin_session_id: sessionId,
                                vp_source_info: {
                                    git_vp_source_id: row.git_vp_source_id,
                                    weight: value,
                                },
                            }));
                            await loadVpSourceList();
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "操作",
            width: 250,
            render: (_, row: GitVpSourceInfo) => (
                <Space size="middle">
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                        disabled={!(permInfo?.git_vp_perm.read ?? false)} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            getSecret(row.git_vp_source_id);
                        }}>查看令牌</Button>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                        disabled={!(permInfo?.git_vp_perm.renew_secret ?? false)} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRenewVpSourceId(row.git_vp_source_id);
                        }}>更新令牌</Button>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                        disabled={!(permInfo?.git_vp_perm.remove_vp_source ?? false)} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoveVpSourceId(row.git_vp_source_id);
                        }}>删除来源</Button>
                </Space>
            ),
        }
    ];

    useEffect(() => {
        loadVpSourceList();
    }, []);

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    return (
        <Card title="数据来源"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "hidden" }}
            extra={
                <Button type="primary" disabled={!(permInfo?.git_vp_perm.add_vp_source)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddModal(true);
                    }}>增加</Button>
            }
        >
            <Table rowKey="git_vp_source_id" dataSource={vpSourceList} columns={columns} pagination={false} />
            {showAddModal == true && (
                <AddVpSourceModal onCancel={() => setShowAddModal(false)} onOk={() => {
                    setShowAddModal(false);
                    loadVpSourceList();
                }} />
            )}
            {secret != "" && (
                <Modal open title="访问令牌" footer={null}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSecret("");
                    }}>
                    <Space>
                        {secret}
                        <Button type="link" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            writeText(secret);
                            message.info("复制成功");
                        }}>复制</Button>
                    </Space>
                </Modal>
            )}
            {renewVpSourceId != "" && (
                <Modal open title="更新令牌"
                    okText="更新"
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRenewVpSourceId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        renewSecret();
                    }}>
                    是否更新令牌？
                </Modal>
            )}
            {removeVpSourceId != "" && (
                <Modal open title="删除数据来源"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveVpSourceId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeVpSource();
                    }}>
                    是否删除数据来源？
                </Modal>
            )}
        </Card>
    );
}

export default GitVpSourceList;