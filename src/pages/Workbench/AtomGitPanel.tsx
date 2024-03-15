import { useStores } from "@/hooks";
import { Button, Card, Dropdown, Empty, Layout, Menu, Space, Tabs, message } from "antd";
import React, { useEffect, useState } from "react";
import type { AtomGitRepo } from "@/api/atomgit/repo";
import { list_repo } from "@/api/atomgit/repo";
import { DownOutlined, ExportOutlined, GlobalOutlined, ProjectOutlined } from "@ant-design/icons";
import type { LocalRepoInfo } from "@/api/local_repo";
import { list_repo as list_local_repo, list_remote as list_local_remote } from "@/api/local_repo";
import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import AddRepoModal from "./components/AddRepoModal";
import LaunchRepoModal from "./components/LaunchRepoModal";
import { AtomGitBranchList, AtomGitIssueList, AtomGitTagList } from "./components/AtomGitList";


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

    useEffect(() => {
        list_repo(userStore.userInfo.extraToken, userStore.userInfo.userName, 99, 1).then(res => {
            setRepoList(res);
            if (res.length > 0 && res.map(item => item.id.toFixed(0)).includes(curRepoId) == false) {
                setCurRepoId(res[0].id.toFixed(0));
            }
        });
    }, []);

    return (
        <Layout>
            <Layout.Sider style={{ borderRight: "1px solid #e4e4e8" }} theme="light">
                <h1 style={{ fontSize: "16px", fontWeight: 600, padding: "10px 10px", backgroundColor: "#eee" }}>项目列表</h1>
                <Menu items={repoList.map(repo => ({
                    key: repo.id.toFixed(0),
                    label: (
                        <Space style={{ fontSize: "14px" }}>
                            {repo.private && <ProjectOutlined />}
                            {repo.private == false && <GlobalOutlined />}
                            <div>{repo.name}</div>
                        </Space>
                    ),
                }))} style={{ border: "none", height: "calc(100vh - 290px)", overflowY: "scroll" }} selectedKeys={curRepoId == "" ? [] : [curRepoId]}
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