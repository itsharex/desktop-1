import React, { useEffect, useState } from "react";
import { list_issue, type AtomGitIssue } from "@/api/atomgit/issue";
import { list_branch, type AtomGitBranch } from "@/api/atomgit/branch";
import { list_tag, type AtomGitTag } from "@/api/atomgit/tag";
import { List, Space, Table, Tag } from "antd";
import { useStores } from "@/hooks";
import type { ColumnsType } from 'antd/lib/table';
import { ExportOutlined } from "@ant-design/icons";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";

export interface AtomGitIssueListProps {
    curOrgId: string;
    repoName: string;
}

export const AtomGitIssueList = (props: AtomGitIssueListProps) => {
    const userStore = useStores('userStore');

    const [issueList, setIssueList] = useState([] as AtomGitIssue[]);

    const loadIssueList = async () => {
        const res = await list_issue(userStore.userInfo.extraToken, props.curOrgId == "" ? userStore.userInfo.userName : props.curOrgId, props.repoName, {
            state: "all",
            sort: "created",
            direction: "desc",
            page: 1,
            per_page: 30,
        });
        setIssueList(res);
    };

    const columns: ColumnsType<AtomGitIssue> = [
        {
            title: "标题",
            width: 200,
            render: (_, row: AtomGitIssue) => (
                <a href={row.html_url} target="_blank" rel="noreferrer">{row.title}&nbsp;<ExportOutlined /></a>
            ),
        },
        {
            title: "锁定",
            width: 80,
            render: (_, row: AtomGitIssue) => row.locked ? "是" : "否",
        },
        {
            title: "提交人",
            width: 150,
            render: (_, row: AtomGitIssue) => (
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
            render: (_, row: AtomGitIssue) => (
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
            render: (_, row: AtomGitIssue) => moment(row.created_at).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "更新时间",
            width: 120,
            render: (_, row: AtomGitIssue) => moment(row.updated_at).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "关闭时间",
            width: 120,
            render: (_, row: AtomGitIssue) => (
                <>
                    {row.closed_at != undefined && row.closed_at != "" && moment(row.closed_at).format("YYYY-MM-DD HH:mm")}
                </>
            ),
        },
    ];

    useEffect(() => {
        loadIssueList();
    }, [props.repoName]);

    return (
        <Table rowKey="id" dataSource={issueList} columns={columns} pagination={false} bordered={false} />
    );
};

export const AtomGitBranchList = (props: AtomGitIssueListProps) => {
    const userStore = useStores('userStore');
    const [branchList, setBranchList] = useState([] as AtomGitBranch[]);

    const loadBranchList = async () => {
        const res = await list_branch(userStore.userInfo.extraToken, props.curOrgId == "" ? userStore.userInfo.userName : props.curOrgId, props.repoName);
        setBranchList(res);
    };

    useEffect(() => {
        loadBranchList();
    }, [props.repoName]);

    return (
        <List rowKey="name" dataSource={branchList} grid={{ gutter: 16 }} renderItem={item => (
            <List.Item>
                <Tag>{item.name}{item.protected ? "(保护分支)" : ""}</Tag>
            </List.Item>
        )} />
    );
};

export const AtomGitTagList = (props: AtomGitIssueListProps) => {
    const userStore = useStores('userStore');
    const [tagList, setTagList] = useState([] as AtomGitTag[]);

    const loadTagList = async () => {
        const res = await list_tag(userStore.userInfo.extraToken, props.curOrgId == "" ? userStore.userInfo.userName : props.curOrgId, props.repoName);
        setTagList(res);
    };

    useEffect(() => {
        loadTagList();
    }, [props.repoName]);

    return (
        <List rowKey="name" dataSource={tagList} grid={{ gutter: 16 }} renderItem={item => (
            <List.Item>
                <Tag>{item.name}</Tag>
            </List.Item>
        )} />
    );
};