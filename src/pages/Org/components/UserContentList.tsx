//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, List, Space } from "antd";
import type { UserContentInfo } from "@/api/org_forum";
import { list_user_content } from "@/api/org_forum";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { ReadOnlyEditor } from "@/components/Editor";
import moment from "moment";

const PAGE_SIZE = 10;

export interface UserContentListProps {
    memberUserId: string;
    onClick: (newForumId: string, newThreadId: string) => void;
};

const UserContentList = (props: UserContentListProps) => {
    const userStore = useStores("userStore");
    const orgStore = useStores("orgStore");

    const [contentList, setContentList] = useState<UserContentInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadContentList = async () => {
        if (orgStore.curOrgId == "") {
            return;
        }
        const res = await request(list_user_content({
            session_id: userStore._sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: props.memberUserId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setContentList(res.content_list);
        setTotalCount(res.total_count);
    };

    useEffect(() => {
        if (orgStore.curOrgId == "") {
            return;
        }
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadContentList();
        }
    }, [props.memberUserId, orgStore.curOrgId]);


    useEffect(() => {
        loadContentList();
    }, [curPage]);

    return (
        <List rowKey="content_id" dataSource={contentList}
            pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
            renderItem={item => (
                <List.Item>
                    <Card title={
                        <Space size="small">
                            <span>{item.forum_name}</span>
                            /
                            <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    props.onClick(item.forum_id, item.thread_id);
                                }}>{item.thread_title}</Button>
                        </Space>
                    } bordered={false} style={{ width: "100%" }}
                        extra={
                            <Space>
                                {moment(item.create_time).format("YYYY-MM-DD HH:mm:ss")}
                                {item.content_id == item.thread_content_id ? "发帖" : "回帖"}
                            </Space>}>
                        <ReadOnlyEditor content={item.content} />
                    </Card>
                </List.Item>
            )} />
    );
};

export default observer(UserContentList);