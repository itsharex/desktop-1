//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Input, List, message, Modal, Space, Spin, Transfer } from "antd";
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
        <Card title="未提交文件" extra={
            <Button type="primary"
                onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCommitMsg("");
                    setShowModal(true);
                }}
                disabled={statusList.filter(item => item.indexChange).length == 0}>提交</Button>}>
            <Transfer rowKey={st => st.path} dataSource={statusList} titles={["工作目录", "待提交"]}
                listStyle={{ height: "calc(100vh - 460px)", width: "calc(50% - 10px)" }}
                targetKeys={statusList.filter(item => item.indexChange).map(item => item.path)}
                onChange={(_, direction, moveKeys) => {
                    if (direction == "left") {
                        removeFromIndex(moveKeys);
                    } else if (direction == "right") {
                        addToIndex(moveKeys);
                    }
                }}
                render={item => (
                    <>
                        {item.indexChange == false && (
                            <span style={{ textDecorationLine: item.workDirDelete ? "line-through" : undefined }}>{item.path}</span>
                        )}
                        {item.indexChange == true && (
                            <span style={{ textDecorationLine: item.indexDelete ? "line-through" : undefined }}>{item.path}</span>
                        )}
                    </>
                )} disabled={(localRepoStore.checkResult?.hasGit == false)||(props.filterList.includes("lfs") && localRepoStore.checkResult?.hasConfigGitLfs == false)}/>
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