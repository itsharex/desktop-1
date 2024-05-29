//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { type GiteeIssue, list_issue } from "@/api/gitee/issue";
import { useStores } from "@/hooks";
import type { ColumnsType } from 'antd/lib/table';
import { List, Space, Table, Tag } from "antd";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { ExportOutlined } from "@ant-design/icons";
import moment from "moment";
import { type GiteeBranch, list_branch } from "@/api/gitee/branch";
import { type GiteeTag, list_tag } from "@/api/gitee/tag";

export interface GiteeIssueListProps {
    repoId: string;
}

export const GiteeIssueList = (props: GiteeIssueListProps) => {
    const userStore = useStores('userStore');

    const [issueList, setIssueList] = useState([] as GiteeIssue[]);

    const loadIssueList = async () => {
        const res = await list_issue(userStore.userInfo.extraToken, userStore.userInfo.userName, props.repoId);
        setIssueList(res);
    };

    const columns: ColumnsType<GiteeIssue> = [
        {
            title: "标题",
            width: 200,
            render: (_, row: GiteeIssue) => (
                <a href={row.html_url} target="_blank" rel="noreferrer">{row.title}&nbsp;<ExportOutlined /></a>
            ),
        },
        {
            title: "提交人",
            width: 150,
            render: (_, row: GiteeIssue) => (
                <a href={row.user.html_url} target="_blank" rel="noreferrer">
                    <Space>
                        <UserPhoto logoUri={row.user.avatar_url} style={{ width: "16px", borderRadius: "10px" }} />
                        <div>{row.user.login}&nbsp;<ExportOutlined /></div>
                    </Space>
                </a>
            ),
        },
        {
            title: "指派人",
            width: 100,
            render: (_, row: GiteeIssue) => (
                <>
                    {row.assignee != undefined && row.assignee.id != undefined && (
                        <a href={row.assignee.html_url} target="_blank" rel="noreferrer">
                            <Space>
                                <UserPhoto logoUri={row.assignee.avatar_url} style={{ width: "16px", borderRadius: "10px" }} />
                                <div>{row.assignee.login}&nbsp;<ExportOutlined /></div>
                            </Space>
                        </a>
                    )}
                </>
            ),
        },
        {
            title: "创建时间",
            width: 120,
            render: (_, row: GiteeIssue) => moment(row.created_at).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "更新时间",
            width: 120,
            render: (_, row: GiteeIssue) => moment(row.updated_at).format("YYYY-MM-DD HH:mm"),
        },
    ];

    useEffect(() => {
        loadIssueList();
    }, [props.repoId]);

    return (
        <Table rowKey="id" dataSource={issueList} columns={columns} pagination={false} bordered={false} />
    );
};

export const GiteeBranchList = (props: GiteeIssueListProps) => {
    const userStore = useStores('userStore');
    const [branchList, setBranchList] = useState([] as GiteeBranch[]);

    const loadBranchList = async () => {
        const res = await list_branch(userStore.userInfo.extraToken, userStore.userInfo.userName, props.repoId);
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
};


export const GiteeTagList = (props: GiteeIssueListProps) => {
    const userStore = useStores('userStore');
    const [tagList, setTagList] = useState([] as GiteeTag[]);

    const loadTagList = async () => {
        const res = await list_tag(userStore.userInfo.extraToken, userStore.userInfo.userName, props.repoId);
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
};