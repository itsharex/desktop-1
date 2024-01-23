import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useGitProStores } from "../stores";
import CommitAndFileList from "./CommitAndFileList";
import { Table } from "antd";
import type { LocalRepoCommitInfo } from "@/api/local_repo";
import { list_repo_commit } from "@/api/local_repo";
import type { ColumnsType } from 'antd/lib/table';
import moment from "moment";

const ListCommit = () => {
    const gitProStore = useGitProStores();

    const [commitList, setCommitList] = useState<LocalRepoCommitInfo[]>([]);

    const loadCommitList = async () => {
        if (gitProStore.repoInfo == null || gitProStore.mainItem.menuType != "gitGraph") {
            return;
        }
        let refName = gitProStore.mainItem.menuExtraValue ?? "";
        if (refName.startsWith("branch:")) {
            refName = "refs/heads/" + refName.substring("branch:".length);
        } else if (refName.startsWith("tag:")) {
            refName = "refs/tags/" + refName.substring("tag:".length);
        }
        const res = await list_repo_commit(gitProStore.repoInfo.path, refName);
        setCommitList(res);
    };

    const columns: ColumnsType<LocalRepoCommitInfo> = [
        {
            title: "HASH",
            width: 100,
            render: (_, row: LocalRepoCommitInfo) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    gitProStore.curCommit = {
                        refs: [],
                        hash: row.id,
                        hash_abbrev: row.id.substring(0, 7),
                        tree: "",
                        tree_abbrev: "",
                        parents: [],
                        parents_abbrev: [],
                        author: {
                            name: row.commiter,
                            email: row.email,
                            timestamp: row.time_stamp,
                        },
                        committer: {
                            name: row.commiter,
                            email: row.email,
                            timestamp: row.time_stamp,
                        },
                        subject: row.summary,
                        body: "",
                        notes: "",
                        stats: undefined,
                    };
                    gitProStore.curDiffFile = null;
                }}>{row.id.substring(0, 7)}</a>
            ),
        },
        {
            title: "提交时间",
            width: 150,
            render: (_, row: LocalRepoCommitInfo) => moment(row.time_stamp).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
            title: "提交人",
            width: 200,
            render: (_, row: LocalRepoCommitInfo) => `${row.commiter}<${row.email}>`,
        },
        {
            title: "提交描述",
            dataIndex: "summary",
        }
    ];

    useEffect(() => {
        loadCommitList();
    }, [gitProStore.mainItem.menuExtraValue]);

    return (
        <div style={{ display: "flex", flex: 1 }}>
            <div style={{ flex: 1, overflow: "scroll" }}>
                <div style={{ height: gitProStore.curDiffFile == null ? "calc(100vh - 45px)" : "calc(50vh - 45px)" }}>
                    <Table rowKey="id" dataSource={commitList} columns={columns} pagination={false} />
                </div>
            </div>
            {gitProStore.curCommit != null && (
                <div style={{ width: "300px" }}>
                    <CommitAndFileList />
                </div>
            )}
        </div>
    );
};

export default observer(ListCommit);