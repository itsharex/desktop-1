import React, { useEffect, useState } from "react";
import { Button, Card, Form, List, Select } from "antd";
import { get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import type { SoftWareCateInfo, SoftWareInfo } from "@/api/sw_store";
import { request } from "@/utils/request";
import { list_cate, list_soft_ware } from "@/api/sw_store";

import { PlusOutlined } from "@ant-design/icons";
import AddSoftWareModal from "./components/AddSoftWareModal";

const PAGE_SIZE = 10;

const SoftWareList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [cateList, setCateList] = useState<SoftWareCateInfo[]>([]);
    const [curCateId, setCurCateId] = useState("");

    const [softWareList, setSoftWareList] = useState<SoftWareInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    const loadCateList = async () => {
        const res = await request(list_cate({}));
        setCateList(res.cate_list);
        if (res.cate_list.map(item => item.cate_id).includes(curCateId) == false) {
            if (res.cate_list.length == 0) {
                setCurCateId("");
                setCurPage(0);
            } else {
                setCurCateId(res.cate_list[0].cate_id);
                setCurPage(0);
            }
        }
    };

    const loadSoftWareList = async () => {
        const res = await request(list_soft_ware({
            list_param: {
                filterby_os_type: false,
                os_type: 0,
                filter_by_cate_id: true,
                cate_id: curCateId,
                filter_by_recommend: false,
                recommend: false,
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setSoftWareList(res.soft_ware_list);
    };

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadCateList();
    }, []);

    useEffect(() => {
        if (curCateId == "") {
            setSoftWareList([]);
        } else {
            loadSoftWareList();
        }
    }, [curCateId, curPage]);

    return (
        <Card title="软件列表"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}
            extra={
                <Form layout="inline">
                    <Form.Item label="类别">
                        <Select value={curCateId} onChange={value => {
                            setCurCateId(value);
                            setCurPage(0);
                        }} style={{ width: "100px" }}>
                            {cateList.map(item => (
                                <Select.Option key={item.cate_id} value={item.cate_id}>{item.cate_name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<PlusOutlined />} disabled={!(permInfo?.sw_store_perm.add_soft_ware ?? false)}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowAddModal(true);
                            }}>添加软件</Button>
                    </Form.Item>
                </Form>
            }
        >
            <List rowKey="sw_id" dataSource={softWareList}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
                renderItem={item => (
                    <List.Item>
                        {item.sw_name}
                    </List.Item>
                )} />
            {showAddModal == true && curCateId != "" && (
                <AddSoftWareModal cateId={curCateId} onCancel={() => setShowAddModal(false)}
                    onOk={() => {
                        setShowAddModal(false);
                        if (curPage == 0) {
                            loadSoftWareList();
                        } else {
                            setCurPage(0);
                        }
                    }} />
            )}
        </Card>
    );
};


export default SoftWareList;