//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { type JihulabRepo, list_user_repo } from "@/api/jihulab/repo";
import { useStores } from "@/hooks";
import { Button, Card, Dropdown, Empty, Layout, Menu, Space, Tabs } from "antd";
import { DownOutlined, ExportOutlined, GlobalOutlined, ProjectOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import type { LocalRepoInfo } from "@/api/local_repo";
import { list_remote as list_local_remote } from "@/api/local_repo";
import { WORKBENCH_PATH } from "@/utils/constant";
import AddRepoModal from "./components/AddRepoModal";
import LaunchRepoModal from "./components/LaunchRepoModal";
import { JihulabBranchList, JihulabIssueList, JihulabTagList } from "./components/JihulabList";

interface JihulabRepoPanelProps {
    repoInfo?: JihulabRepo;
}

const JihulabRepoPanel = observer((props: JihulabRepoPanelProps) => {
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
                if (remoteInfo.url == props.repoInfo.ssh_url_to_repo || remoteInfo.url == props.repoInfo.http_url_to_repo) {
                    setLocalRepo(tmpRepo.repoInfo);
                    return;
                }
            }
        }
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
                        title={<a href={props.repoInfo.http_url_to_repo} target="_blank" rel="noreferrer" style={{ fontSize: "16px", fontWeight: 600 }}>{props.repoInfo.name}&nbsp;<ExportOutlined /></a>}
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
                                                onClick: () => setCloneUrl(props.repoInfo?.ssh_url_to_repo ?? ""),
                                                disabled: localRepoStore.checkResult?.hasGit == false,
                                            },
                                            {
                                                key: "https",
                                                label: <span title={(localRepoStore.checkResult?.hasGit == false) ? "未安装Git工具" : ""}>HTTPS</span>,
                                                onClick: () => setCloneUrl(props.repoInfo?.http_url_to_repo ?? ""),
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
                                            {activeKey == "issue" && <JihulabIssueList repoId={props.repoInfo.id??0} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "branch",
                                    label: "分支列表",
                                    children: (
                                        <>
                                            {activeKey == "branch" && <JihulabBranchList repoId={props.repoInfo.id??0} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "tag",
                                    label: "标签列表",
                                    children: (
                                        <>
                                            {activeKey == "tag" && <JihulabTagList repoId={props.repoInfo.id??0} />}
                                        </>
                                    ),
                                },
                            ]} />
                    </div>
                </>
            )}
            {cloneUrl != "" && (
                <AddRepoModal name={props.repoInfo?.name ?? ""} enName={props.repoInfo?.path ?? ""} remoteUrl={cloneUrl} onCancel={() => setCloneUrl("")}
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

const JihulabPanel = () => {
    const userStore = useStores('userStore');

    const [repoList, setRepoList] = useState([] as JihulabRepo[]);
    const [curRepoId, setCurRepoId] = useState("");

    const loadRepoList = async () => {
        const res = await list_user_repo(userStore.userInfo.extraToken);
        setRepoList(res);
        if (curRepoId == "" && res.length > 0) {
            setCurRepoId(res[0].id.toFixed(0));
        }
    };

    const adjustPath = (path: string) => {
        const parts = path.split("/");
        parts.shift();
        return parts.join("/");
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
                            {repo.visibility != "public" && <ProjectOutlined />}
                            {repo.visibility == "public" && <GlobalOutlined />}
                            <div>{adjustPath(repo.path_with_namespace)}</div>
                        </Space>
                    ),
                }))} style={{ border: "none", height: "calc(100vh - 230px)", overflowY: "scroll" }} selectedKeys={curRepoId == "" ? [] : [curRepoId]}
                    onSelect={info => {
                        setCurRepoId(info.key);
                    }} />
            </Layout.Sider>
            <Layout.Content style={{ height: "calc(100vh - 230px)", overflowY: "scroll", backgroundColor: "white" }}>
                <JihulabRepoPanel repoInfo={repoList.find(item => item.id.toFixed(0) == curRepoId)} />
            </Layout.Content>
        </Layout>
    );
};

export default observer(JihulabPanel);