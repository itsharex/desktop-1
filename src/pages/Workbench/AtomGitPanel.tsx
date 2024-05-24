//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { useStores } from "@/hooks";
import { Button, Card, Dropdown, Empty, Input, Layout, Menu, Select, Space, Tabs, message } from "antd";
import React, { useEffect, useState } from "react";
import type { AtomGitRepo } from "@/api/atomgit/repo";
import { list_user_repo, list_org_repo } from "@/api/atomgit/repo";
import { DownOutlined, ExportOutlined, FilterFilled, GlobalOutlined, ProjectOutlined, ReloadOutlined } from "@ant-design/icons";
import type { LocalRepoInfo } from "@/api/local_repo";
import { list_remote as list_local_remote } from "@/api/local_repo";
import AddRepoModal from "./components/AddRepoModal";
import LaunchRepoModal from "./components/LaunchRepoModal";
import { AtomGitBranchList, AtomGitIssueList, AtomGitTagList } from "./components/AtomGitList";
import { type AtomGitOrg, list_user_org } from "@/api/atomgit/org";
import { useHistory } from "react-router-dom";
import { WORKBENCH_PATH } from "@/utils/constant";
import { observer } from "mobx-react";


interface AtomGitRepoPanelProps {
    curOrgId: string;
    repoInfo?: AtomGitRepo;
}

const AtomGitRepoPanel = observer((props: AtomGitRepoPanelProps) => {
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
                if (remoteInfo.url == props.repoInfo.git_url || remoteInfo.url == props.repoInfo.html_url) {
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
                                                onClick: () => setCloneUrl(props.repoInfo?.git_url ?? ""),
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
                                <div>默认分组:{props.repoInfo.default_branch}</div>
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
                                            {activeKey == "issue" && <AtomGitIssueList repoId={getRepoId(props.repoInfo.full_name ?? "")} curOrgId={props.curOrgId} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "branch",
                                    label: "分支列表",
                                    children: (
                                        <>
                                            {activeKey == "branch" && <AtomGitBranchList repoId={getRepoId(props.repoInfo.full_name ?? "")} curOrgId={props.curOrgId} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "tag",
                                    label: "标签列表",
                                    children: (
                                        <>
                                            {activeKey == "tag" && <AtomGitTagList repoId={getRepoId(props.repoInfo.full_name ?? "")} curOrgId={props.curOrgId} />}
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

const AtomGitPanel = observer(() => {
    const userStore = useStores('userStore');

    const [repoList, setRepoList] = useState([] as AtomGitRepo[]);
    const [curRepoId, setCurRepoId] = useState("");
    const [curOrgId, setCurOrgId] = useState("");
    const [orgList, setOrgList] = useState([] as AtomGitOrg[]);
    const [keyword, setKeyword] = useState("");

    const loadRepoList = async () => {
        let res: null | AtomGitRepo[] = null;
        if (curOrgId == "") {
            res = await list_user_repo(userStore.userInfo.extraToken, userStore.userInfo.userName, 99, 1);
        } else {
            res = await list_org_repo(userStore.userInfo.extraToken, curOrgId, 99, 1);
        }
        setRepoList(res);
        if (res.length > 0 && res.map(item => item.id.toFixed(0)).includes(curRepoId) == false) {
            setCurRepoId(res[0].id.toFixed(0));
        }
    };

    useEffect(() => {
        loadRepoList();
    }, [curOrgId]);

    useEffect(() => {
        list_user_org(userStore.userInfo.extraToken).then(res => setOrgList(res));
    }, []);

    return (
        <Layout>
            <Layout.Sider style={{ borderRight: "1px solid #e4e4e8" }} theme="light">
                <Space style={{ padding: "10px 0px 10px 4px", backgroundColor: "#eee" }}>
                    <Select value={curOrgId} onChange={value => {
                        setCurOrgId(value);
                        setKeyword("");
                    }}
                        style={{ width: "160px" }}>
                        <Select.Option value="">个人项目</Select.Option>
                        {orgList.map(org => (
                            <Select.Option key={org.id} value={org.login}>组织&nbsp;{org.login}</Select.Option>
                        ))}
                    </Select>
                    <Button title="刷新" type="text" icon={<ReloadOutlined />} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        loadRepoList().then(() => {
                            message.info("刷新成功");
                        });
                    }} style={{ minWidth: 0, padding: "0px 0px" }} />
                </Space>
                <Space style={{ margin: "4px 0px" }}>
                    <Input placeholder="搜索项目" style={{ width: "170px" }} allowClear value={keyword}
                        onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setKeyword(e.target.value.trim());
                        }} />
                    <FilterFilled />
                </Space>
                <Menu items={repoList.filter(repo => repo.name.includes(keyword)).map(repo => ({
                    key: repo.id.toFixed(0),
                    label: (
                        <Space style={{ fontSize: "14px" }}>
                            {repo.private && <ProjectOutlined />}
                            {repo.private == false && <GlobalOutlined />}
                            <div>{repo.name}</div>
                        </Space>
                    ),
                }))} style={{ border: "none", height: "calc(100vh - 320px)", overflowY: "scroll" }} selectedKeys={curRepoId == "" ? [] : [curRepoId]}
                    onSelect={info => {
                        setCurRepoId(info.key);
                    }} />
            </Layout.Sider>
            <Layout.Content style={{ height: "calc(100vh - 230px)", overflowY: "scroll", backgroundColor: "white" }}>
                <AtomGitRepoPanel repoInfo={repoList.find(item => item.id.toFixed(0) == curRepoId)} curOrgId={curOrgId} />
            </Layout.Content>
        </Layout>
    )
});

export default AtomGitPanel;