//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import type { AdminPermInfo } from '@/api/admin_auth';
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import { PlusOutlined } from "@ant-design/icons";
import type { IdeaStoreCate } from "@/api/idea_store";
import { list_store_cate } from "@/api/idea_store";
import type { ColumnsType } from 'antd/es/table';
import { EditText } from "@/components/EditCell/EditText";
import { Card, Modal, Table, message } from "antd";
import Button from "@/components/Button";
import CreateCateModal from "./components/CreateCateModal";
import { update_store_cate, remove_store_cate } from "@/api/idea_store_admin";
import { request } from "@/utils/request";
import { EditNumber } from "@/components/EditCell/EditNumber";

const IdeaStoreCateList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [storeCateList, setStoreCateList] = useState([] as IdeaStoreCate[]);

    const [removeCateInfo, setRemoveCateInfo] = useState<IdeaStoreCate | null>(null);

    const loadStoreCateList = async () => {
        const res = await list_store_cate({});
        setStoreCateList(res.cate_list);
    };

    const removeCate = async () => {
        if (removeCateInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_store_cate({
            admin_session_id: sessionId,
            store_cate_id: removeCateInfo.store_cate_id,
        }));
        setRemoveCateInfo(null);
        await loadStoreCateList();
        message.info("删除成功");
    };

    const columns: ColumnsType<IdeaStoreCate> = [
        {
            title: "类别名称",
            render: (_, row: IdeaStoreCate) => (
                <EditText editable={permInfo?.idea_store_perm.update_store_cate ?? false} content={row.name}
                    onChange={async (value: string) => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_store_cate({
                                admin_session_id: sessionId,
                                store_cate_id: row.store_cate_id,
                                name: value.trim(),
                                weight: row.weight,
                            }));
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon={true} />
            ),
        },
        {
            title: "排序权重",
            render: (_, row: IdeaStoreCate) => (
                <EditNumber editable={permInfo?.idea_store_perm.update_store_cate ?? false}
                    onChange={async (value: number) => {
                        if (value < 0 || value > 99) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_store_cate({
                                admin_session_id: sessionId,
                                store_cate_id: row.store_cate_id,
                                name: row.name,
                                weight: value,
                            }));
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon={true} value={row.weight} fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "知识库数量",
            dataIndex: "store_count",
        },
        {
            title: "操作",
            render: (_, row: IdeaStoreCate) => (
                <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                    disabled={!((permInfo?.idea_store_perm.remove_store_cate ?? false) && row.store_count == 0)}
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
        loadStoreCateList();
    }, []);

    return (
        <Card title="知识库类别"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "hidden" }}
            extra={
                <Button
                    disabled={!(permInfo?.idea_store_perm.create_store_cate ?? false)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddModal(true);
                    }}><PlusOutlined />&nbsp;&nbsp;添加类别</Button>
            }>
            <Table rowKey="store_cate_id" dataSource={storeCateList} columns={columns} pagination={false}
                scroll={{ y: "calc(100vh - 160px)" }} />
            {showAddModal == true && (
                <CreateCateModal onCancel={() => setShowAddModal(false)} onOk={() => {
                    setShowAddModal(false);
                    loadStoreCateList();
                }} />
            )}
            {removeCateInfo != null && (
                <Modal open title="删除知识库类别"
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
                    是否删除知识库类别{removeCateInfo.name}?
                </Modal>
            )}
        </Card>
    );
};

export default IdeaStoreCateList;