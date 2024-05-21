//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import type { ItemType, MenuItemGroupType } from "antd/lib/menu/hooks/useItems";
import type { IdeaInStore } from "@/api/idea_store";
import { list_store_cate, list_store, list_idea } from "@/api/idea_store";
import { request } from "@/utils/request";
import { Card, Form, Input, Layout, List, Menu } from "antd";
import { ReadOnlyEditor } from "@/components/Editor";

const PAGE_SIZE = 10;

const IdeaListPanel = () => {
    const [menuList, setMenuList] = useState([] as ItemType[]);
    const [curCatId, setCurCateId] = useState("");
    const [curStoreId, setCurStoreId] = useState("");
    const [titleKeyword, setTitleKeyword] = useState("");

    const [ideaList, setIdeaList] = useState([] as IdeaInStore[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);


    const loadMenuList = async () => {
        const cateRes = await request(list_store_cate({}));
        const storeRes = await request(list_store({
            filter_by_store_cate_id: false,
            store_cate_id: "",
        }));
        const tmpList = [] as ItemType[];
        for (const cate of cateRes.cate_list) {
            if (cate.store_count == 0) {
                continue;
            }
            const storeList = storeRes.store_list.filter(item => item.store_cate_id == cate.store_cate_id);
            const menuItem: ItemType = {
                key: cate.store_cate_id,
                label: cate.name,
                children: [] as ItemType[],
            };

            for (const store of storeList) {
                if (store.idea_count == 0) {
                    continue;
                }
                menuItem.children.push({
                    key: store.idea_store_id,
                    label: store.name,
                });
            }
            tmpList.push(menuItem);
        }
        if (storeRes.store_list.length > 0) {
            setCurCateId(storeRes.store_list[0].store_cate_id);
            setCurStoreId(storeRes.store_list[0].idea_store_id);
        }
        setMenuList(tmpList);
    };

    const loadIdeaList = async () => {
        if (curStoreId == "") {
            return;
        }
        const res = await request(list_idea({
            list_param: {
                filter_by_store_id: true,
                store_id: curStoreId,
                filter_by_title_keyword: titleKeyword != "",
                title_keyword: titleKeyword,
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setIdeaList(res.idea_list);
    };


    useEffect(() => {
        loadMenuList();
    }, []);

    useEffect(() => {
        loadIdeaList();
    }, [curPage, curStoreId, titleKeyword]);

    return (
        <>
            <Layout>
                <Layout.Sider theme="light" width="200px">
                    <Menu items={menuList} mode="inline" style={{ height: "calc(100vh - 140px)", overflowY: "scroll", overflowX: "hidden" }}
                        openKeys={[curCatId]} selectedKeys={[curStoreId]}
                        onOpenChange={keys => {
                            setTitleKeyword("");
                            setCurPage(0);
                            const tmpList = keys.filter(key => key != curCatId).filter(key => key != "");
                            if (tmpList.length == 0) {
                                setCurCateId("");
                                setCurStoreId("");
                            } else {
                                setCurCateId(tmpList[0]);
                                menuList.forEach(menu => {
                                    if (menu?.key == tmpList[0]) {
                                        const subMenuList = (menu as MenuItemGroupType).children ?? [];
                                        if (subMenuList.length > 0) {
                                            setCurStoreId(subMenuList[0]?.key as string);
                                        }
                                    }
                                });
                            }
                        }}
                        onSelect={info => {
                            setCurStoreId(info.key);
                            setTitleKeyword("");
                            setCurPage(0);
                        }} />
                </Layout.Sider>
                <Layout.Content>
                    <Card bordered={false} bodyStyle={{ height: "calc(100vh - 180px)", overflowY: "scroll" }} extra={
                        <Form layout="inline">
                            <Form.Item label="过滤标题">
                                <Input value={titleKeyword} onChange={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setTitleKeyword(e.target.value.trim());
                                }} allowClear />
                            </Form.Item>
                        </Form>
                    }>
                        <List rowKey="idea_id" dataSource={ideaList}
                            pagination={{ current: curPage + 1, pageSize: PAGE_SIZE, total: totalCount, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                            renderItem={idea => (
                                <Card title={idea.basic_info.title} style={{ width: "100%", marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }}>
                                    <ReadOnlyEditor content={idea.basic_info.content} />
                                </Card>
                            )} />
                    </Card>
                </Layout.Content>
            </Layout>
        </>
    );
};

export default IdeaListPanel;