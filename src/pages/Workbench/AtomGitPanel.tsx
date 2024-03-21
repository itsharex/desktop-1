import { useStores } from "@/hooks";
import { Button, Card, Dropdown, Empty, Input, Layout, Menu, Select, Space, Tabs, message } from "antd";
import React, { useEffect, useState } from "react";
import type { AtomGitRepo } from "@/api/atomgit/repo";
import { list_user_repo, list_org_repo } from "@/api/atomgit/repo";
import { DownOutlined, ExportOutlined, FilterFilled, GlobalOutlined, ProjectOutlined, ReloadOutlined } from "@ant-design/icons";
import type { LocalRepoInfo } from "@/api/local_repo";
import { list_repo as list_local_repo, list_remote as list_local_remote } from "@/api/local_repo";
import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import AddRepoModal from "./components/AddRepoModal";
import LaunchRepoModal from "./components/LaunchRepoModal";
import { AtomGitBranchList, AtomGitIssueList, AtomGitTagList } from "./components/AtomGitList";
import { type AtomGitOrg, list_user_org } from "@/api/atomgit/org";


interface AtomGitRepoPanelProps {
    repoInfo?: AtomGitRepo;
}

const AtomGitRepoPanel = (props: AtomGitRepoPanelProps) => {
    const [localRepo, setLocalRepo] = useState<LocalRepoInfo | null>(null);
    const [cloneUrl, setCloneUrl] = useState("");
    const [showLaunchRepo, setShowLaunchRepo] = useState(false);
    const [activeKey, setActiveKey] = useState("issue");

    const findLocalRepo = async () => {
        setLocalRepo(null);
        if (props.repoInfo == undefined) {
            return;
        }
        const localRepoList = await list_local_repo();
        for (const tmpRepo of localRepoList) {
            const remoteList = await list_local_remote(tmpRepo.path);
            for (const remoteInfo of remoteList) {
                if (remoteInfo.url == props.repoInfo.git_url || remoteInfo.url == props.repoInfo.html_url) {
                    setLocalRepo(tmpRepo);
                    return;
                }
            }
        }
    };

    const openGitPro = async () => {
        if (localRepo == null) {
            return;
        }
        const label = `gitpro:${localRepo.id}`;
        const view = WebviewWindow.getByLabel(label);
        if (view != null) {
            message.warn("已打开窗口");
            return;
        }
        const pos = await appWindow.innerPosition();
        new WebviewWindow(label, {
            url: `gitpro.html?id=${encodeURIComponent(localRepo.id)}`,
            width: 1300,
            minWidth: 1300,
            height: 800,
            minHeight: 800,
            center: true,
            title: `${localRepo.name}(${localRepo.path})`,
            resizable: true,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
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
                                            openGitPro();
                                        }}>查看本地仓库<ExportOutlined /></Button>
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
                                                label: "SSH",
                                                onClick: () => setCloneUrl(props.repoInfo?.git_url ?? ""),
                                            },
                                            {
                                                key: "https",
                                                label: "HTTPS",
                                                onClick: () => setCloneUrl(props.repoInfo?.html_url ?? ""),
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
                                            {activeKey == "issue" && <AtomGitIssueList repoName={props.repoInfo.name ?? ""} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "branch",
                                    label: "分支列表",
                                    children: (
                                        <>
                                            {activeKey == "branch" && <AtomGitBranchList repoName={props.repoInfo.name ?? ""} />}
                                        </>
                                    ),
                                },
                                {
                                    key: "tag",
                                    label: "标签列表",
                                    children: (
                                        <>
                                            {activeKey == "tag" && <AtomGitTagList repoName={props.repoInfo.name ?? ""} />}
                                        </>
                                    ),
                                },
                            ]} />
                    </div>
                </>
            )}
            {cloneUrl != "" && (
                <AddRepoModal remoteUrl={cloneUrl} onCancel={() => setCloneUrl("")}
                    onOk={() => {
                        findLocalRepo();
                        setCloneUrl("");
                    }} />
            )}
            {showLaunchRepo == true && localRepo != null && (
                <LaunchRepoModal repo={localRepo} onClose={() => setShowLaunchRepo(false)} />
            )}
        </div>
    );
};

const AtomGitPanel = () => {
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
                <AtomGitRepoPanel repoInfo={repoList.find(item => item.id.toFixed(0) == curRepoId)} />
            </Layout.Content>
        </Layout>
    )
};

export default AtomGitPanel;