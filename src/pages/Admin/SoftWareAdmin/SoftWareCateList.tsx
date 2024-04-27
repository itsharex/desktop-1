//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, message, Modal, Table } from "antd";
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import { PlusOutlined } from "@ant-design/icons";
import type { SoftWareCateInfo } from "@/api/sw_store";
import { list_cate } from "@/api/sw_store";
import { add_cate, update_cate, remove_cate } from "@/api/sw_store_admin";
import type { ColumnsType } from 'antd/es/table';
import { request } from "@/utils/request";
import { EditText } from "@/components/EditCell/EditText";
import { EditNumber } from "@/components/EditCell/EditNumber";

interface AddCateModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const AddCateModal = (props: AddCateModalProps) => {
    const [name, setName] = useState("");
    const [weight, setWeight] = useState(0);

    const addCate = async () => {
        const sessionId = await get_admin_session();
        await request(add_cate({
            admin_session_id: sessionId,
            cate_name: name,
            weight: weight,
        }));
        props.onOk();
        message.info("添加类别成功");
    };

    return (
        <Modal open title="添加类别"
            okText="添加" okButtonProps={{ disabled: name == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addCate();
            }}>
            <Form>
                <Form.Item label="名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="权重">
                    <InputNumber value={weight} min={0} max={99} precision={0} controls={false} onChange={value => {
                        if (value != null) {
                            setWeight(value);
                        }
                    }} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const SoftWareCateList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [cateList, setCateList] = useState<SoftWareCateInfo[]>([]);
    const [removeCateInfo, setRemoveCateInfo] = useState<SoftWareCateInfo | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);

    const loadCateList = async () => {
        const res = await request(list_cate({}));
        setCateList(res.cate_list);
    };

    const removeCate = async () => {
        if (removeCateInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_cate({
            admin_session_id: sessionId,
            cate_id: removeCateInfo.cate_id,
        }));
        message.info("删除成功");
        setRemoveCateInfo(null);
        await loadCateList();
    };

    const columns: ColumnsType<SoftWareCateInfo> = [
        {
            title: "名称",
            render: (_, row: SoftWareCateInfo) => (
                <EditText editable={permInfo?.sw_store_perm.update_cate ?? false}
                    content={row.cate_name} onChange={async (value) => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_cate({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                cate_name: value.trim(),
                                weight: row.weight,
                            }));
                            await loadCateList();
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon />
            ),
        },
        {
            title: "权重",
            width: 180,
            render: (_, row: SoftWareCateInfo) => (
                <EditNumber editable={permInfo?.sw_store_perm.update_cate ?? false}
                    value={row.weight} onChange={async value => {
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_cate({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                cate_name: row.cate_name,
                                weight: value,
                            }));
                            await loadCateList();
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "软件数量",
            dataIndex: "soft_ware_count",
            width: 100,
        },
        {
            title: "操作",
            width: 100,
            render: (_, row: SoftWareCateInfo) => (
                <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }}
                    disabled={!((permInfo?.sw_store_perm.remove_cate ?? false) && row.soft_ware_count == 0)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveCateInfo(row);
                    }}>删除</Button>
            ),
        }
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadCateList();
    }, []);

    return (
        <Card title="软件类别"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}
            extra={
                <Button type="primary" disabled={!(permInfo?.sw_store_perm.add_cate ?? false)}
                    icon={<PlusOutlined />}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddModal(true);
                    }}>
                    添加类别
                </Button>
            }>
            <Table rowKey="cate_id" dataSource={cateList} columns={columns} pagination={false} />
            {showAddModal == true && (
                <AddCateModal onCancel={() => setShowAddModal(false)} onOk={() => {
                    setShowAddModal(false);
                    loadCateList();
                }} />
            )}
            {removeCateInfo != null && (
                <Modal open title="删除类别"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveCateInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeCate();
                    }}>
                    是否删除类别&nbsp;{removeCateInfo.cate_name}&nbsp;?
                </Modal>
            )}
        </Card>
    );
};

export default SoftWareCateList;