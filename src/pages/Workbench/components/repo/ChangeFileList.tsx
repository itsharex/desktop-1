//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Input, List, message, Modal, Space, Spin } from "antd";
import type { LocalRepoInfo, LocalRepoStatusInfo } from "@/api/local_repo";
import { add_to_index, get_repo_status, remove_from_index, run_commit } from "@/api/local_repo";
import { useStores } from "@/hooks";
import { observer } from "mobx-react";


export interface ChangeFileListProps {
    repo: LocalRepoInfo;
    filterList: string[];
    onCommit: () => void;
}

const ChangeFileList = (props: ChangeFileListProps) => {
    const localRepoStore = useStores("localRepoStore");

    const [status, setStatus] = useState<LocalRepoStatusInfo | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [commitMsg, setCommitMsg] = useState("");

    const [indeterminate, setIndeterminate] = useState(false);
    const [allCommit, setAllCommit] = useState(false);
    const [inCommit, setInCommit] = useState(false);

    const loadStatus = async () => {
        const statusRes = await get_repo_status(props.repo.path);
        setStatus(statusRes);
    };

    const calcIndexCount = () => {
        let count = 0;
        for (const item of (status?.path_list ?? [])) {
            for (const st of item.status) {
                if (st.startsWith("INDEX_")) {
                    count += 1;
                }
            }
        }
        return count;
    };

    const addToIndex = async (filePath: string) => {
        await add_to_index(props.repo.path, [filePath]);
        await loadStatus();
    };

    const addAllToIndex = async () => {
        if (status == null) {
            return;
        }
        await add_to_index(props.repo.path, status.path_list.map(item => item.path));
        await loadStatus();
    };

    const removeFromIndex = async (filePath: string) => {
        await remove_from_index(props.repo.path, [filePath]);
        await loadStatus();
    };

    const removeAllToIndex = async () => {
        if (status == null) {
            return;
        }
        await remove_from_index(props.repo.path, status.path_list.map(item => item.path));
        await loadStatus();
    };

    const runCommit = async () => {
        try {
            setInCommit(true);
            await run_commit(props.repo.path, commitMsg);
            await loadStatus();
            setShowModal(false);
            message.info("提交成功");
            props.onCommit();
        } finally {
            setInCommit(false);
        }
    };

    useEffect(() => {
        loadStatus();
    }, []);

    useEffect(() => {
        if (status == null) {
            setAllCommit(false);
            setIndeterminate(false);
            return;
        }
        if (status.path_list.length == 0) {
            setAllCommit(false);
            setIndeterminate(false);
            return;
        }
        let dirtyCount = 0;
        for (const pathStatus of status.path_list) {
            let isDirty = false;
            for (const st of pathStatus.status) {
                if (st.startsWith("WT_")) {
                    isDirty = true;
                }
            }
            if (isDirty) {
                dirtyCount += 1;
            }
        }
        console.log(dirtyCount, status.path_list.length);
        if (dirtyCount == 0) {
            setAllCommit(true);
            setIndeterminate(false);
        } else if (dirtyCount < status.path_list.length) {
            setIndeterminate(true);
        } else if (dirtyCount == status.path_list.length) {
            setAllCommit(false);
            setIndeterminate(false);
        }
    }, [status?.path_list]);

    return (
        <Card title={
            <Space>
                {(status?.path_list ?? []).length > 0 && (
                    <Checkbox checked={allCommit} indeterminate={indeterminate} onChange={e => {
                        e.stopPropagation();
                        if (e.target.checked) {
                            addAllToIndex();
                        } else {
                            removeAllToIndex();
                        }
                    }} disabled={props.filterList.length > 0 || !localRepoStore.hasGitConfig} />
                )}
                未提交文件
            </Space>
        }
            bodyStyle={{ height: "calc(100vh - 460px)", overflowY: "scroll" }}
            extra={
                <Button type="primary" disabled={calcIndexCount() == 0 || !localRepoStore.hasGitConfig}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCommitMsg("");
                        setShowModal(true);
                    }}>提交</Button>}
        >
            <List rowKey="path" dataSource={status?.path_list ?? []} renderItem={item => (
                <List.Item >
                    <div style={{ display: "flex", width: "100%" }}>
                        <div style={{ flex: 1 }}>
                            <Checkbox style={{ marginRight: "10px" }} checked={item.status.findIndex(st => st.startsWith("WT_")) == -1}
                                onChange={e => {
                                    e.stopPropagation();
                                    if (e.target.checked) {
                                        addToIndex(item.path);
                                    } else {
                                        removeFromIndex(item.path);
                                    }
                                }} disabled={props.filterList.length > 0 || !localRepoStore.hasGitConfig} />
                            {item.path}
                        </div>
                        <div style={{ flex: 1 }}>
                            {item.status.join(",")}
                        </div>
                    </div>
                </List.Item>
            )} />
            {showModal == true && (
                <Modal open title="提交变更"
                    okText="提交" okButtonProps={{ disabled: commitMsg.trim() == "" || inCommit }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        runCommit();
                    }}>
                    <Input.TextArea autoSize={{ minRows: 5, maxRows: 5 }} value={commitMsg} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCommitMsg(e.target.value);
                    }} placeholder="请输入变更内容" disabled={inCommit} />
                    {inCommit && (
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                            <Spin />
                            &nbsp;提交中......
                        </div>
                    )}
                </Modal>
            )}
        </Card>
    );
};

export default observer(ChangeFileList);