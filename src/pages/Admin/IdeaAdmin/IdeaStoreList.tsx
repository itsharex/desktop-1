import { Card, Form, Modal, Select, Space, Table, message } from "antd";
import React, { useEffect, useState } from "react";
import type { IdeaStoreCate, IdeaStore } from "@/api/idea_store";
import type { AdminPermInfo } from '@/api/admin_auth';
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import { list_store_cate, list_store } from "@/api/idea_store";
import type { ColumnsType } from 'antd/es/table';
import { EditText } from "@/components/EditCell/EditText";
import Button from "@/components/Button";
import { PlusOutlined } from "@ant-design/icons";
import CreateStoreModal from "./components/CreateStoreModal";
import { EditNumber } from "@/components/EditCell/EditNumber";
import { request } from "@/utils/request";
import { update_store, remove_store, move_store } from "@/api/idea_store_admin";
import StoreCateListModal from "./components/StoreCateListModal";

const IdeaStoreList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);

    const [storeCateList, setStoreCateList] = useState([] as IdeaStoreCate[]);
    const [storeList, setStoreList] = useState([] as IdeaStore[]);
    const [curStoreCateId, setCurStoreCateId] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [removeStoreInfo, setRemoveStoreInfo] = useState<IdeaStore | null>(null);
    const [moveStoreInfo, setMoveStoreInfo] = useState<IdeaStore | null>(null);

    const loadStoreCateList = async () => {
        const res = await list_store_cate({});
        setStoreCateList(res.cate_list);
        if (res.cate_list.map(item => item.store_cate_id).includes(curStoreCateId) == false) {
            if (res.cate_list.length == 0) {
                setCurStoreCateId("");
            } else {
                setCurStoreCateId(res.cate_list[0].store_cate_id);
            }
        }
    };

    const loadStoreList = async () => {
        setStoreList([]);
        if (curStoreCateId == "") {
            return;
        }
        const res = await list_store({
            filter_by_store_cate_id: true,
            store_cate_id: curStoreCateId,
        });
        setStoreList(res.store_list);
    };

    const removeStore = async () => {
        if (removeStoreInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_store({
            admin_session_id: sessionId,
            idea_store_id: removeStoreInfo.idea_store_id,
        }));
        setRemoveStoreInfo(null);
        await loadStoreList();
        message.info("删除成功");
    };

    const moveStore = async (newCateId: string) => {
        if (moveStoreInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(move_store({
            admin_session_id: sessionId,
            idea_store_id: moveStoreInfo.idea_store_id,
            store_cate_id: newCateId,
        }));
        setMoveStoreInfo(null);
        await loadStoreList();
        message.info("移动成功");
    };

    const columns: ColumnsType<IdeaStore> = [
        {
            title: "知识库名称",
            render: (_, row: IdeaStore) => (
                <EditText editable={permInfo?.idea_store_perm.update_store ?? false} content={row.name} onChange={async (value: string) => {
                    if (value.trim() == "") {
                        return false;
                    }
                    try {
                        const sessionId = await get_admin_session();
                        await request(update_store({
                            admin_session_id: sessionId,
                            idea_store_id: row.idea_store_id,
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
            render: (_, row: IdeaStore) => (
                <EditNumber editable={permInfo?.idea_store_perm.update_store ?? false}
                    onChange={async (value: number) => {
                        if (value < 0 || value > 99) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_store({
                                admin_session_id: sessionId,
                                idea_store_id: row.idea_store_id,
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
            title: "知识点数量",
            dataIndex: "idea_count",
        },
        {
            title: "操作",
            render: (_, row: IdeaStore) => (
                <Space size="large">
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                        disabled={!(permInfo?.idea_store_perm.move_store ?? false)}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setMoveStoreInfo(row);
                        }}>移动</Button>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                        disabled={!((permInfo?.idea_store_perm.remove_store ?? false) && row.idea_count == 0)}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoveStoreInfo(row);
                        }}>删除</Button>
                </Space>
            ),
        }
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadStoreCateList();
    }, []);

    useEffect(() => {
        loadStoreList();
    }, [curStoreCateId]);

    return (
        <Card title="知识库"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "hidden" }}
            extra={
                <>
                    {curStoreCateId != "" && (
                        <Form layout="inline">
                            <Form.Item label="类别">
                                <Select value={curStoreCateId} onChange={value => setCurStoreCateId(value)} style={{ width: "120px" }}>
                                    {storeCateList.map(item => (
                                        <Select.Option key={item.store_cate_id} value={item.store_cate_id}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    disabled={!(permInfo?.idea_store_perm.create_store ?? false)}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowAddModal(true);
                                    }}><PlusOutlined />&nbsp;&nbsp;添加知识库</Button>
                            </Form.Item>
                        </Form>
                    )}
                </>
            }>
            <Table rowKey="idea_store_id" dataSource={storeList} columns={columns} pagination={false}
                scroll={{ y: "calc(100vh - 160px)" }} />
            {showAddModal == true && (
                <CreateStoreModal storeCateId={curStoreCateId}
                    onCancel={() => setShowAddModal(false)} onOk={() => {
                        setShowAddModal(false);
                        loadStoreList();
                    }} />
            )}
            {removeStoreInfo != null && (
                <Modal open title="删除知识库"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveStoreInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeStore();
                    }}>
                    是否删除知识库{removeStoreInfo.name}?
                </Modal>
            )}
            {moveStoreInfo != null && (
                <StoreCateListModal disableCateId={moveStoreInfo.store_cate_id} onCancel={() => setMoveStoreInfo(null)}
                    onOk={newCateId => moveStore(newCateId)} />
            )}
        </Card>
    );
};

export default IdeaStoreList;