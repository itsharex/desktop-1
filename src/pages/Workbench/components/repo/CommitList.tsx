//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useRef, useState } from "react";
import { Card, Form, Segmented, Select, Table } from "antd";
import type { LocalRepoInfo, LocalRepoCommitInfo, LocalRepoBranchInfo, CommitGraphInfo } from "@/api/local_repo";
import { get_head_info, list_commit_graph, list_repo_commit } from "@/api/local_repo";
import type { ColumnsType } from 'antd/lib/table';
import moment from "moment";
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';
import { createGitgraph, type CommitOptions, MergeStyle } from "@gitgraph/js";

export interface CommitListProps {
    repo: LocalRepoInfo;
    branchList: LocalRepoBranchInfo[];
}

const CommitList = (props: CommitListProps) => {
    const graphRef = useRef<HTMLDivElement>(null);

    const [commitList, setCommitList] = useState<LocalRepoCommitInfo[]>([]);
    const [filterCommiter, setFilterCommiter] = useState("");
    const [filterBranch, setFilterBranch] = useState("");
    const [commiterList, setCommiterList] = useState<string[]>([]);
    const [showType, setShowType] = useState<"list" | "graph">("list");

    const loadCommitList = async (branch: string) => {
        const commitRes = await list_repo_commit(props.repo.path, `refs/heads/${branch}`);
        setCommitList(commitRes);
        const tmpList: string[] = [];
        for (const commit of commitRes) {
            if (!tmpList.includes(commit.commiter)) {
                tmpList.push(commit.commiter);
            }
        }
        setCommiterList(tmpList);
    };

    const openCommitDiff = async (row: LocalRepoCommitInfo) => {
        const pos = await appWindow.innerPosition();
        new WebviewWindow(`commit:${row.id}`, {
            url: `git_diff.html?path=${encodeURIComponent(props.repo.path)}&commitId=${row.id}&summary=${encodeURIComponent(row.summary)}&commiter=${encodeURIComponent(row.commiter)}`,
            title: `${props.repo.name}(commit:${row.id.substring(0, 8)})`,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        })
    };

    const openCommitDiff2 = async (row: CommitGraphInfo) => {
        const pos = await appWindow.innerPosition();
        new WebviewWindow(`commit:${row.hash}`, {
            url: `git_diff.html?path=${encodeURIComponent(props.repo.path)}&commitId=${row.hash}&summary=${encodeURIComponent(row.subject)}&commiter=${encodeURIComponent(row.committer.name)}`,
            title: `${props.repo.name}(commit:${row.hash.substring(0, 8)})`,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        })
    };

    const loadHeadInfo = async () => {
        const res = await get_head_info(props.repo.path);
        setFilterBranch(res.branch_name);
    };

    const initGraph = async () => {
        const branch = props.branchList.find(item => item.name == filterBranch);
        if (branch == undefined) {
            return;
        }
        if (graphRef == null || graphRef.current == null) {
            return;
        }
        graphRef.current.innerText = "";
        const gitgraph = createGitgraph(graphRef.current, {
            responsive: true,
            template: {
                colors: ["#6963FF", "#47E8D4", "#6BDB52", "#E84BA5", "#FFA657"],
                branch: {
                    lineWidth: 2,
                    spacing: 20,
                    mergeStyle: MergeStyle.Straight,
                    label: {
                        display: true,
                        bgColor: "white",
                        borderRadius: 10,
                    },
                },
                commit: {
                    spacing: 40,
                    hasTooltipInCompactMode: true,
                    dot: {
                        size: 4,
                        font: "normal 14px monospace",
                    },
                    message: {
                        color: "black",
                        display: true,
                        displayAuthor: false,
                        displayHash: true,
                        font: "normal 14px monospace",
                    },
                },
                arrow: {
                    color: null,
                    size: 8,
                    offset: -1.5,
                },
                tag: {},
            },
        });
        const commitList = await list_commit_graph(props.repo.path, branch.commit_id);
        for (const commit of commitList) {
            const options = commit as any as CommitOptions;
            options.onClick = () => {
                openCommitDiff2(commit);
            };
            options.onMessageClick = () => {
                openCommitDiff2(commit);
            };
        }
        gitgraph.import(commitList);
    };

    const columns: ColumnsType<LocalRepoCommitInfo> = [
        {
            title: "",
            width: 60,
            render: (_, row: LocalRepoCommitInfo) => (
                <span title={row.id}>{row.id.substring(0, 8)}</span>
            ),
        },
        {
            title: "提交备注",
            width: 200,
            render: (_, row: LocalRepoCommitInfo) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    openCommitDiff(row);
                }}>{row.summary}</a>
            ),
        },
        {
            title: "提交时间",
            width: 100,
            render: (_, row: LocalRepoCommitInfo) => `${moment(row.time_stamp).format("YYYY-MM-DD HH:mm")}`,
        },
        {
            title: "提交者",
            width: 100,
            render: (_, row: LocalRepoCommitInfo) => `${row.commiter}(${row.email})`,
        }
    ];


    useEffect(() => {
        loadHeadInfo();
    }, [props.branchList]);

    useEffect(() => {
        if (filterBranch != "") {
            if (showType == "list") {
                loadCommitList(filterBranch);
            } else if (showType == "graph" && graphRef != null && graphRef.current != null) {
                initGraph();
            }
        }
    }, [filterBranch, showType, graphRef]);

    return (
        <Card bordered={false} bodyStyle={{ height: "calc(100vh - 440px)", overflow: "scroll" }} headStyle={{ backgroundColor: "#eee" }}
            extra={
                <Form layout="inline">
                    <Form.Item label="分支">
                        <Select value={filterBranch} onChange={value => {
                            setFilterBranch(value);
                            loadCommitList(value);
                        }} style={{ width: "150px" }}>
                            {props.branchList.map(branch => (
                                <Select.Option key={branch.name} value={branch.name}>{branch.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="提交用户">
                        <Select value={filterCommiter} onChange={value => setFilterCommiter(value)} style={{ width: "100px" }}>
                            <Select.Option value="">全部</Select.Option>
                            {commiterList.map(commiter => (
                                <Select.Option key={commiter} value={commiter}>{commiter}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Segmented options={[{
                            label: "列表",
                            value: "list"
                        },
                        {
                            label: "图形",
                            value: "graph",
                        }]} value={showType} onChange={value => setShowType(value as "list" | "graph")} />
                    </Form.Item>
                </Form>
            }>
            {showType == "list" && (
                <Table rowKey="id" dataSource={commitList.filter(commit => {
                    if (filterCommiter == "") {
                        return true;
                    } else {
                        return commit.commiter == filterCommiter;
                    }
                })} columns={columns} pagination={{ pageSize: 10, showSizeChanger: false }} />
            )}
            {showType == "graph" && (<div ref={graphRef} />)}
        </Card>
    );
};

export default CommitList;