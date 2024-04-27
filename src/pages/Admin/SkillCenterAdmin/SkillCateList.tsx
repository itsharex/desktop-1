//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, InputNumber, message, Modal, Switch, Table } from "antd";
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import type { SkillCateInfo } from "@/api/skill_center";
import { list_skill_cate, get_skill_cate } from "@/api/skill_center";
import { create_skill_cate, update_skill_cate, remove_skill_cate } from "@/api/skill_center_admin";
import { request } from "@/utils/request";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import { EditText } from "@/components/EditCell/EditText";
import { EditNumber } from "@/components/EditCell/EditNumber";

interface AddCateModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const AddCateModal = (props: AddCateModalProps) => {
    const [name, setName] = useState("");
    const [weight, setWeight] = useState(0);

    const createCate = async () => {
        const sessionId = await get_admin_session();
        await request(create_skill_cate({
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
                createCate();
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
    )
};

const SkillCateList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [cateList, setCateList] = useState<SkillCateInfo[]>([]);
    const [removeCateInfo, setRemoveCateInfo] = useState<SkillCateInfo | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);

    const loadCateList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_skill_cate({
            session_id: sessionId,
            filter_publish: false,
            publish: false,
        }));
        setCateList(res.cate_list);
    };

    const onUpdateCate = async (cateId: string) => {
        const tmpList = cateList.slice();
        const index = tmpList.findIndex(item => item.cate_id == cateId);
        if (index == -1) {
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(get_skill_cate({
            session_id: sessionId,
            cate_id: cateId,
        }));
        tmpList[index] = res.cate_info;
        setCateList(tmpList);
    };

    const updatePublish = async (cateInfo: SkillCateInfo, newPublish: boolean) => {
        const sessionId = await get_admin_session();
        await request(update_skill_cate({
            admin_session_id: sessionId,
            cate_id: cateInfo.cate_id,
            cate_name: cateInfo.cate_name,
            weight: cateInfo.weight,
            publish: newPublish,
        }));
        onUpdateCate(cateInfo.cate_id);
    };

    const removeCate = async () => {
        if (removeCateInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_skill_cate({
            admin_session_id: sessionId,
            cate_id: removeCateInfo.cate_id,
        }));
        message.info("删除成功");
        setRemoveCateInfo(null);
        await loadCateList();
    };

    const columns: ColumnsType<SkillCateInfo> = [
        {
            title: "名称",
            render: (_, row: SkillCateInfo) => (
                <EditText editable={permInfo?.skill_center_perm.update_cate ?? false}
                    content={row.cate_name} onChange={async value => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_skill_cate({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                cate_name: value.trim(),
                                weight: row.weight,
                                publish: row.publish,
                            }));
                            await onUpdateCate(row.cate_id);
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
            render: (_, row: SkillCateInfo) => (
                <EditNumber editable={permInfo?.skill_center_perm.update_cate ?? false}
                    value={row.weight} onChange={async value => {
                        if (value < 0 || value > 99) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_skill_cate({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                cate_name: row.cate_name,
                                weight: value,
                                publish: row.publish,
                            }));
                            await onUpdateCate(row.cate_id);
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "发布状态",
            width: 100,
            render: (_, row: SkillCateInfo) => (
                <Switch checked={row.publish} size="small" disabled={!(permInfo?.skill_center_perm.update_cate ?? false)}
                    onChange={value => {
                        updatePublish(row, value);
                    }} />
            ),
        },
        {
            title: "知识点数量",
            width: 180,
            dataIndex: "point_count",
        },
        {
            title: "资源数量",
            width: 180,
            dataIndex: "resource_count",
        },
        {
            title: "操作",
            width: 100,
            render: (_, row: SkillCateInfo) => (
                <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }}
                    disabled={!((permInfo?.skill_center_perm.remove_cate ?? false) && row.folder_count == 0 && row.point_count == 0 && row.resource_count == 0)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveCateInfo(row);
                    }}>删除</Button>
            ),
        },
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadCateList();
    }, []);

    return (
        <Card title="技能列表" bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}
            extra={
                <Button type="primary" disabled={!(permInfo?.skill_center_perm.create_cate ?? false)}
                    icon={<PlusOutlined />}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddModal(true);
                    }}>添加列表</Button>
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

export default SkillCateList;