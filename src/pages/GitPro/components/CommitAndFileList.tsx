import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useGitProStores } from "../stores";
import { Button, Card, Descriptions, List } from "antd";
import moment from "moment";
import type { LocalRepoFileDiffInfo } from "@/api/local_repo";
import { get_commit_change } from "@/api/local_repo";
import { CloseOutlined } from "@ant-design/icons";

const CommitAndFileList = () => {
    const gitProStore = useGitProStores();

    const [fileList, setFileList] = useState<LocalRepoFileDiffInfo[]>([]);

    const loadFileList = async () => {
        if (gitProStore.curCommit == null || gitProStore.repoInfo == null) {
            setFileList([]);
            return;
        }
        let commitId = "";
        if (typeof (gitProStore.curCommit) == "object") {
            commitId = gitProStore.curCommit.hash;
        } else {
            commitId = gitProStore.curCommit;
        }
        const res = await get_commit_change(gitProStore.repoInfo.path, commitId);
        setFileList(res);
    };

    useEffect(() => {
        loadFileList();
    }, [gitProStore.curCommit]);

    return (
        <div style={{ height: gitProStore.curDiffFile == null ? "100vh" : "50vh", overflowY: "scroll", backgroundColor: "white" }}>
            {gitProStore.curCommit != null && typeof gitProStore.curCommit == "object" && (
                <Card title="提交信息" extra={
                    <Button type="link" icon={<CloseOutlined />} style={{ padding: "0px 0px" }} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        gitProStore.curCommit = null;
                        gitProStore.curDiffFile = null;
                    }} />
                }>
                    <Descriptions column={1}>
                        <Descriptions.Item label="提交人">
                            {gitProStore.curCommit.committer.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="邮件地址">
                            {gitProStore.curCommit.committer.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="提交时间">
                            {moment(gitProStore.curCommit.committer.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                        </Descriptions.Item>
                        <Descriptions.Item label="提交标题">
                            {gitProStore.curCommit.subject}
                        </Descriptions.Item>
                        <Descriptions.Item label="提交内容">
                            {gitProStore.curCommit.body}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}
            <Card title="修改文件列表" extra={
                <>
                    {gitProStore.mainItem.menuType == "stashList" && (
                        <Button type="link" icon={<CloseOutlined />} style={{ padding: "0px 0px" }} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            gitProStore.curCommit = null;
                            gitProStore.curDiffFile = null;
                        }} />
                    )}
                </>
            }>
                <List dataSource={fileList} renderItem={item => (
                    <List.Item key={`${item.old_file_name}:${item.new_file_name}`} style={{ cursor: "pointer" }}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            gitProStore.curDiffFile = item;
                        }}>
                        <pre style={{
                            whiteSpace: "pre-wrap", wordWrap: "break-word",
                            backgroundColor: `${item.old_file_name}:${item.new_file_name}` == `${gitProStore.curDiffFile?.old_file_name}:${gitProStore.curDiffFile?.new_file_name}` ? "#e4e4e8" : "white",
                            padding: "4px 10px", borderRadius: "10px"
                        }}>
                            {item.old_file_name}=&gt;{item.new_file_name}({item.delta_type})
                        </pre>
                    </List.Item>
                )} />
            </Card>
        </div>
    );
};

export default observer(CommitAndFileList);