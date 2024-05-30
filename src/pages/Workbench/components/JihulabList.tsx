//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { useStores } from "@/hooks";
import { type JihulabIssue, list_issue } from "@/api/jihulab/issue";
import type { ColumnsType } from 'antd/lib/table';
import moment from "moment";
import Table from "antd/lib/table";
import { ExportOutlined } from "@ant-design/icons";
import { List, Space, Tag } from "antd";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { type JihulabBranch, list_branch } from "@/api/jihulab/branch";
import { type JihulabTag, list_tag } from "@/api/jihulab/tag";


export interface JihulabssueListProps {
    repoId: number;
}

export const JihulabIssueList = (props: JihulabssueListProps) => {
    const userStore = useStores('userStore');

    const [issueList, setIssueList] = useState([] as JihulabIssue[]);

    const loadIssueList = async () => {
        const res = await list_issue(userStore.userInfo.extraToken, props.repoId);
        setIssueList(res);
    };

    const columns: ColumnsType<JihulabIssue> = [
        {
            title: "标题",
            width: 200,
            render: (_, row: JihulabIssue) => (
                <a href={row.web_url} target="_blank" rel="noreferrer">{row.title}&nbsp;<ExportOutlined /></a>
            ),
        },
        {
            title: "状态",
            width: 160,
            dataIndex: "state",
        },
        {
            title: "提交人",
            width: 150,
            render: (_, row: JihulabIssue) => (
                <a href={row.author.web_url} target="_blank" rel="noreferrer">
                    <Space>
                        <UserPhoto logoUri={row.author.avatar_url} style={{ width: "16px", borderRadius: "10px" }} />
                        <div>{row.author.name}&nbsp;<ExportOutlined /></div>
                    </Space>
                </a>
            ),
        },
        {
            title: "指派人",
            width: 100,
            render: (_, row: JihulabIssue) => (
                <>
                    {row.assignee != undefined && row.assignee.id != undefined && (
                        <a href={row.assignee.web_url} target="_blank" rel="noreferrer">
                            <Space>
                                <UserPhoto logoUri={row.assignee.avatar_url} style={{ width: "16px", borderRadius: "10px" }} />
                                <div>{row.assignee.name}&nbsp;<ExportOutlined /></div>
                            </Space>
                        </a>
                    )}
                </>
            ),
        },
        {
            title: "创建时间",
            width: 120,
            render: (_, row: JihulabIssue) => moment(row.created_at).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "更新时间",
            width: 120,
            render: (_, row: JihulabIssue) => moment(row.updated_at).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "关闭时间",
            width: 120,
            render: (_, row: JihulabIssue) => (
                <>
                    {row.closed_at != undefined && row.closed_at != "" && moment(row.closed_at).format("YYYY-MM-DD HH:mm")}
                </>
            ),
        },
    ];

    useEffect(() => {
        loadIssueList();
    }, [props.repoId]);

    return (
        <Table rowKey="id" dataSource={issueList} columns={columns} pagination={false} bordered={false} />
    );
}

export const JihulabBranchList = (props: JihulabssueListProps) => {
    const userStore = useStores('userStore');
    const [branchList, setBranchList] = useState([] as JihulabBranch[]);

    const loadBranchList = async () => {
        const res = await list_branch(userStore.userInfo.extraToken, props.repoId);
        setBranchList(res);
    };

    useEffect(() => {
        loadBranchList();
    }, [props.repoId]);

    return (
        <List rowKey="name" dataSource={branchList} grid={{ gutter: 16 }} renderItem={item => (
            <List.Item>
                <Tag>{item.name}{item.protected ? "(保护分支)" : ""}</Tag>
            </List.Item>
        )} />
    );
}

export const JihulabTagList = (props: JihulabssueListProps) => {
    const userStore = useStores('userStore');
    const [tagList, setTagList] = useState([] as JihulabTag[]);

    const loadTagList = async () => {
        const res = await list_tag(userStore.userInfo.extraToken, props.repoId);
        setTagList(res);
    };

    useEffect(() => {
        loadTagList();
    }, [props.repoId]);

    return (
        <List rowKey="name" dataSource={tagList} grid={{ gutter: 16 }} renderItem={item => (
            <List.Item>
                <Tag>{item.name}</Tag>
            </List.Item>
        )} />
    );
}