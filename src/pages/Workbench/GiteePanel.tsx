//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { Button, Card, Dropdown, Empty, Layout, Menu, Space, Tabs } from "antd";
import { type GiteeRepo, list_user_repo } from "@/api/gitee/repo";
import { useStores } from "@/hooks";
import { DownOutlined, ExportOutlined, GlobalOutlined, ProjectOutlined } from "@ant-design/icons";
import type { LocalRepoInfo } from "@/api/local_repo";
import { list_remote as list_local_remote } from "@/api/local_repo";
import { useHistory } from "react-router-dom";
import { WORKBENCH_PATH } from "@/utils/constant";
import AddRepoModal from "./components/AddRepoModal";
import LaunchRepoModal from "./components/LaunchRepoModal";
import { GiteeBranchList, GiteeIssueList, GiteeTagList } from "./components/GiteeList";

interface GiteeRepoPanelProps {
    repoInfo?: GiteeRepo;
}

const GiteeRepoPanel = observer((props: GiteeRepoPanelProps) => {
    const history = useHistory();

    const localRepoStore = useStores("localRepoStore");
    const [localRepo, setLocalRepo] = useState<LocalRepoInfo | null>(null);
    const [cloneUrl, setCloneUrl] = useState("");
    const [showLaunchRepo, setShowLaunchRepo] = useState(false);
    const [activeKey, setActiveKey] = useState("issue");

    const findLocalRepo = async () => {
        setLocalRepo(null);
        if (props.repoInfo == undefined) {
            return;
        }
        for (const tmpRepo of localRepoStore.repoExtList) {
            const remoteList = await list_local_remote(tmpRepo.repoInfo.path);
            for (const remoteInfo of remoteList) {
                if (remoteInfo.url == props.repoInfo.ssh_url || remoteInfo.url == props.repoInfo.html_url) {
                    setLocalRepo(tmpRepo.repoInfo);
                    return;
                }
            }
        }
    };

    const getRepoId = (fullName: string) => {
        const parts = fullName.split("/");
        if (parts.length > 1) {
            return parts[1];
        }
        return "";
    };

    useEffect(() => {
        findLocalRepo();
    }, [props.repoInfo?.id]);

    return (
        <div>
            {props.repoInfo == undefined && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            {props.repoInfo != undefined && (
                <>
                    <Card
                        title={<a href={props.repoInfo.html_url} target="_blank" rel="noreferrer" style={{ fontSize: "16px", fontWeight: 600 }}>{props.repoInfo.name}&nbsp;<ExportOutlined /></a>}
                        bordered={false} bodyStyle={{ minHeight: "50px" }} headStyle={{ backgroundColor: "#eee", height: "46px" }}
                        extra={
                            <Space>
                                {localRepo != null && (
                                    <>
                                        <Button style={{ color: "orange", fontWeight: 500 }} onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            history.push(`${WORKBENCH_PATH}?tab=localRepo&repoId=${localRepo.id}`);
                                        }}>查看本地仓库</Button>
                                        <Button style={{ color: "orange", fontWeight: 500 }} onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setShowLaunchRepo(true);
                                        }}>启动开发环境</Button>
                                    </>
                                )}
                                {localRepo == null && (
                                    <Dropdown menu={{
                                        items: [
                                            {
                                                key: "ssh",
                                                label: <span title={(localRepoStore.checkResult?.hasGit == false) ? "未安装Git工具" : ""}>SSH</span>,
                                                onClick: () => setCloneUrl(props.repoInfo?.ssh_url ?? ""),
                                                disabled: localRepoStore.checkResult?.hasGit == false,
                                            },
                                            {
                                                key: "https",
                                                label: <span title={(localRepoStore.checkResult?.hasGit == false) ? "未安装Git工具" : ""}>HTTPS</span>,
                                                onClick: () => setCloneUrl(props.repoInfo?.html_url ?? ""),
                                                disabled: localRepoStore.checkResult?.hasGit == false,
                                            },
                                        ],
                                    }} trigger={["click"]} >
                                        <Space>
                                            <a style={{ color: "orange", fontWeight: 500 }}>
                                                克隆到本地
                                                <DownOutlined />
                                            </a>
                                        </Space>
                                    </Dropdown>
                                )}
                                <div>默认分支:{props.repoInfo.default_branch}</div>
                            </Space>
                        }>
                        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                            {(props.repoInfo.description ?? "") == "" && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无项目描述" />}
                            {props.repoInfo.description}
                        </pre>
                    </Card>
                    <div style={{ padding: "10px 10px" }}>
                        <Tabs type="card" activeKey={activeKey} onChange={key => setActiveKey(key)}
                            items={[
                                {
                                    key: "issue",
                                    label: "工单列表",
                                    children: (
                                        <>
                                            {activeKey == "issue" && <GiteeIssueList repoId={getRepoId(props.repoInfo.full_name ?? "")} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "branch",
                                    label: "分支列表",
                                    children: (
                                        <>
                                            {activeKey == "branch" && <GiteeBranchList repoId={getRepoId(props.repoInfo.full_name ?? "")} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "tag",
                                    label: "标签列表",
                                    children: (
                                        <>
                                            {activeKey == "tag" && <GiteeTagList repoId={getRepoId(props.repoInfo.full_name ?? "")} />}
                                        </>
                                    ),
                                },
                            ]} />
                    </div>
                </>
            )}
            {cloneUrl != "" && (
                <AddRepoModal name={props.repoInfo?.name ?? ""} enName={getRepoId(props.repoInfo?.full_name ?? "")} remoteUrl={cloneUrl} onCancel={() => setCloneUrl("")}
                    onOk={() => {
                        localRepoStore.loadRepoList().then(() => {
                            findLocalRepo();
                            setCloneUrl("");
                        });
                    }} />
            )}
            {showLaunchRepo == true && localRepo != null && (
                <LaunchRepoModal repo={localRepo} onClose={() => setShowLaunchRepo(false)} />
            )}
        </div>
    );
});

const GiteePanel = () => {
    const userStore = useStores('userStore');

    const [repoList, setRepoList] = useState([] as GiteeRepo[]);
    const [curRepoId, setCurRepoId] = useState("");

    const loadRepoList = async () => {
        const res = await list_user_repo(userStore.userInfo.extraToken, 100, 1);
        setRepoList(res);
    };

    useEffect(() => {
        loadRepoList();
    }, []);

    return (
        <Layout>
            <Layout.Sider style={{ borderRight: "1px solid #e4e4e8" }} theme="light">
                <Menu items={repoList.map(repo => ({
                    key: repo.id.toFixed(0),
                    label: (
                        <Space style={{ fontSize: "14px" }}>
                            {repo.private && <ProjectOutlined />}
                            {repo.private == false && <GlobalOutlined />}
                            <div>{repo.name}</div>
                        </Space>
                    ),
                }))} style={{ border: "none", height: "calc(100vh - 230px)", overflowY: "scroll" }} selectedKeys={curRepoId == "" ? [] : [curRepoId]}
                    onSelect={info => {
                        setCurRepoId(info.key);
                    }} />
            </Layout.Sider>
            <Layout.Content style={{ height: "calc(100vh - 230px)", overflowY: "scroll", backgroundColor: "white" }}>
                <GiteeRepoPanel repoInfo={repoList.find(item => item.id.toFixed(0) == curRepoId)} />
            </Layout.Content>
        </Layout>
    );
};

export default observer(GiteePanel);