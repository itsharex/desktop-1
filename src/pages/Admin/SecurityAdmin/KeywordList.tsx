//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, List, Popover, Space } from "antd";
import type { KeywordInfo } from "@/api/keyword_admin";
import { list as list_keyword, remove as remove_keyword } from "@/api/keyword_admin";
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import { request } from "@/utils/request";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import AddKeywordModal from "./components/AddKeywordModal";
import TestKeywordModal from "./components/TestKeywordModal";

const PAGE_SIZE = 96;

const KeywordList = () => {
    const [searchStr, setSearchStr] = useState("");
    const [keywordList, setKeywordList] = useState<KeywordInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);

    const loadKeywordList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_keyword({
            admin_session_id: sessionId,
            filter_by_search_str: searchStr != "",
            search_str: searchStr,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setKeywordList(res.keyword_list);
    };

    const removeKeyword = async (keyword: string) => {
        const sessionId = await get_admin_session();
        await request(remove_keyword({
            admin_session_id: sessionId,
            keyword: keyword,
        }));
        await loadKeywordList();
    };

    useEffect(() => {
        loadKeywordList();
    }, [curPage, searchStr]);

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    return (
        <Card title="关键词列表"
            bodyStyle={{ height: "calc(100vh - 85px)", overflowY: "scroll" }}
            extra={
                <Space>
                    <span>过滤条件</span>
                    <Form layout="inline">
                        <Form.Item label="关键词片段">
                            <Input allowClear value={searchStr} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSearchStr(e.target.value.trim());
                                setCurPage(0);
                            }} />
                        </Form.Item>
                        <Form.Item>
                            <Button onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowTestModal(true);
                            }}>测试</Button>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" icon={<PlusOutlined />} disabled={!(permInfo?.keyword_perm.add ?? false)}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowAddModal(true);
                                }}>
                                增加关键词
                            </Button>
                        </Form.Item>
                    </Form>
                </Space>
            }>
            <List rowKey="keyword" dataSource={keywordList} grid={{ gutter: 16 }}
                renderItem={item => (
                    <List.Item style={{ padding: "0px 10px", border: "1px solid #e4e4e8" }}>
                        <Space>
                            {item.keyword}
                            <Popover trigger="click" placement="bottom" content={
                                <div>
                                    <Button type="link" danger disabled={!(permInfo?.keyword_perm.remove ?? false)}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            removeKeyword(item.keyword);
                                        }}>删除</Button>
                                </div>
                            }>
                                <MoreOutlined />
                            </Popover>
                        </Space>
                    </List.Item>
                )}
                pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }} />
            {showAddModal == true && (
                <AddKeywordModal onCancel={() => setShowAddModal(false)} onOk={() => {
                    setShowAddModal(false);
                    let hasChange = false;
                    if (searchStr != "") {
                        setSearchStr("");
                        hasChange = true;
                    }
                    if (curPage != 0) {
                        setCurPage(0);
                        hasChange = true;
                    }
                    if (!hasChange) {
                        loadKeywordList();
                    }
                }} />
            )}
            {showTestModal == true && (
                <TestKeywordModal onCancel={() => setShowTestModal(false)} />
            )}
        </Card>
    );
};

export default KeywordList;