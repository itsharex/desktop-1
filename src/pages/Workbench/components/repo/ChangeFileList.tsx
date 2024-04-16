import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Input, List, message, Modal } from "antd";
import type { LocalRepoInfo, LocalRepoStatusInfo } from "@/api/local_repo";
import { add_to_index, get_repo_status, remove_from_index, run_commit } from "@/api/local_repo";


export interface ChangeFileListProps {
    repo: LocalRepoInfo;
    filterList: string[];
    onCommit: () => void;
}

const ChangeFileList = (props: ChangeFileListProps) => {
    const [status, setStatus] = useState<LocalRepoStatusInfo | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [commitMsg, setCommitMsg] = useState("");

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

    const removeFromIndex = async (filePath: string) => {
        await remove_from_index(props.repo.path, [filePath]);
        await loadStatus();
    };

    const runCommit = async () => {
        await run_commit(props.repo.path, commitMsg);
        await loadStatus();
        setShowModal(false);
        message.info("提交成功");
        props.onCommit();
    };

    useEffect(() => {
        loadStatus();
    }, []);

    return (
        <Card title="未提交文件"
            bodyStyle={{ height: "calc(100vh - 460px)", overflowY: "scroll" }}
            extra={
                <Button type="primary" disabled={calcIndexCount() == 0}
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
                            <Checkbox style={{ marginRight: "10px" }} checked={item.status.findIndex(st => st.startsWith("INDEX_")) != -1}
                                onChange={e => {
                                    e.stopPropagation();
                                    if (e.target.checked) {
                                        addToIndex(item.path);
                                    } else {
                                        removeFromIndex(item.path);
                                    }
                                }} disabled={props.filterList.length > 0} />
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
                    okText="提交" okButtonProps={{ disabled: commitMsg.trim() == "" }}
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
                    }} placeholder="请输入变更内容" />
                </Modal>
            )}
        </Card>
    );
};

export default ChangeFileList;