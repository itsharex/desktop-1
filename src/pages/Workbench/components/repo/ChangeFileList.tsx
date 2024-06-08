//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Input, List, message, Modal, Space, Spin } from "antd";
import type { LocalRepoInfo } from "@/api/local_repo";
import { useStores } from "@/hooks";
import { observer } from "mobx-react";
import type { GitStatusItem } from "@/api/git_wrap";
import { run_status, add_to_index, remove_from_index, run_commit } from "@/api/git_wrap";

export interface ChangeFileListProps {
    repo: LocalRepoInfo;
    filterList: string[];
    onCommit: () => void;
}

const ChangeFileList = (props: ChangeFileListProps) => {
    const localRepoStore = useStores("localRepoStore");

    const [statusList, setStatusList] = useState<GitStatusItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [commitMsg, setCommitMsg] = useState("");

    const [inCommit, setInCommit] = useState(false);

    const loadStatus = async () => {
        const tmpList = await run_status(props.repo.path);
        setStatusList(tmpList);
    };


    const addToIndex = async (fileList: string[]) => {
        for (const file of fileList) {
            await add_to_index(props.repo.path, file);
        }
        await loadStatus();
    };

    const removeFromIndex = async (fileList: string[]) => {
        for (const file of fileList) {
            await remove_from_index(props.repo.path, file);
        }
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

    return (
        <Card title={
            <Space>
                <Checkbox checked={statusList.length > 0 && statusList.filter(item => item.workDirChange).length == 0}
                    indeterminate={statusList.filter(item => item.workDirChange).length > 0 && statusList.filter(item => item.workDirChange).length < statusList.length}
                    disabled={(localRepoStore.checkResult?.hasGit ?? false) == false}
                    onChange={e => {
                        e.stopPropagation();
                        if (e.target.checked) {
                            addToIndex(statusList.map(item => item.path));
                        } else {
                            removeFromIndex(statusList.map(item => item.path));
                        }
                    }} />
                全选
            </Space>
        } bordered={false} bodyStyle={{ height: "calc(100vh - 460px)", overflowY: "scroll" }}
            extra={
                <Button type="primary"
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCommitMsg("");
                        setShowModal(true);
                    }}
                    disabled={statusList.filter(item => item.workDirChange == false && item.indexChange).length == 0}>提交</Button>
            }>
            <List rowKey="path" dataSource={statusList} pagination={false}
                renderItem={item => (
                    <List.Item>
                        <Space>
                            <Checkbox checked={item.workDirChange == false} onChange={e => {
                                e.stopPropagation();
                                if (e.target.checked) {
                                    addToIndex([item.path]);
                                } else {
                                    removeFromIndex([item.path]);
                                }
                            }} disabled={(localRepoStore.checkResult?.hasGit ?? false) == false} />
                            <span style={{ textDecorationLine: item.workDirDelete ? "overline" : undefined }}>{item.path}</span>
                        </Space>
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