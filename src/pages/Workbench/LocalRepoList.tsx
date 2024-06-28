//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Button, Card, Collapse, Empty, Form, List, Modal, Popover, Select, Space, Tabs, DatePicker, message, Spin, Descriptions, Checkbox, Tooltip as AntTooltip, Divider, Tag } from "antd";
import React, { useEffect, useState } from "react";
import type { LocalRepoInfo, LocalRepoBranchInfo, LocalRepoTagInfo, LocalRepoAnalyseInfo, LocalRepoRemoteInfo } from "@/api/local_repo";
import { list_repo_branch, list_repo_tag, analyse, list_remote, get_http_url } from "@/api/local_repo";
import { BranchesOutlined, MoreOutlined, NodeIndexOutlined, QuestionCircleOutlined, TagOutlined } from "@ant-design/icons";
import SetLocalRepoModal from "./components/SetLocalRepoModal";
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';
import moment, { type Moment } from "moment";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useStores } from "@/hooks";
import { observer } from "mobx-react";
import { get_git_hook, set_git_hook } from "@/api/project_tool";
import { open as shell_open } from '@tauri-apps/api/shell';
import LaunchRepoModal from "./components/LaunchRepoModal";
import { list_widget, type WidgetInfo } from "@/api/widget";
import { request } from "@/utils/request";
import CommitList from "./components/repo/CommitList";
import { useLocation } from "react-router-dom";
import ChangeFileList from "./components/repo/ChangeFileList";
import WorkDir from "./components/repo/WorkDir";
import ChangeBranchModal from "./components/repo/ChangeBranchModal";
import { LocalRepoExtInfo } from "@/stores/localrepo";
import LargeFileList from "./components/repo/LargeFileList";
import { remove_branch, remove_tag } from "@/api/git_wrap";

interface LinkProjectModalProps {
    repo: LocalRepoInfo;
    onCancel: () => void;
}

const LinkProjectModal: React.FC<LinkProjectModalProps> = observer((props) => {
    const projectStore = useStores('projectStore');
    const [linkProjectId, setLinkProjectId] = useState<string | null>(null);
    const [postHook, setPostHook] = useState(false);
    const [hasChange, setHasChange] = useState(false);

    const loadLinkInfo = async () => {
        const linkInfo = await get_git_hook(props.repo.path);
        console.log(linkInfo);
        for (const project of projectStore.projectList) {
            if (project.closed) {
                continue;
            }
            if (linkInfo.yaml_content.includes(project.project_id)) {
                setLinkProjectId(project.project_id);
                break;
            }
        }
        setPostHook(linkInfo.post_commit_hook);
    };
    const setGitHook = async () => {
        await set_git_hook(props.repo.path, linkProjectId ?? "", postHook);
        message.info("设置成功");
        props.onCancel();
    };

    useEffect(() => {
        loadLinkInfo();
    }, []);

    return (
        <Modal open title="关联项目"
            okText="设置" okButtonProps={{ disabled: !hasChange }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                setGitHook();
            }}>
            <Form>
                <Form.Item label="项目">
                    <Select value={linkProjectId} onChange={value => {
                        setLinkProjectId(value ?? null);
                        if ((value ?? null) == null) {
                            setPostHook(false);
                        }
                        setHasChange(true);
                    }} allowClear>
                        {projectStore.projectList.filter(prj => prj.closed == false).map(item => (
                            <Select.Option key={item.project_id} value={item.project_id}>{item.basic_info.project_name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="hooks">
                    <Checkbox checked={postHook} onChange={e => {
                        e.stopPropagation();
                        setPostHook(e.target.checked);
                        setHasChange(true);
                    }} disabled={linkProjectId == null}>
                        POST_COMMIT 唤醒应用&nbsp;
                        <AntTooltip title="在运行git comment命令后，唤起应用界面进行通知同事和变更任务/缺陷。"><QuestionCircleOutlined /></AntTooltip>
                    </Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    )
});

interface AnalyseRepoModalProps {
    repo: LocalRepoInfo;
    onCancel: () => void;
}
const AnalyseRepoModal: React.FC<AnalyseRepoModalProps> = (props) => {
    const [fromTime, setFromTime] = useState<Moment>(moment().subtract(7, "days").startOf("day"));
    const [toTime, setToTime] = useState<Moment>(moment().endOf("day"));
    const [analyseInfo, setAnalyseInfo] = useState<LocalRepoAnalyseInfo | null>(null);
    const [branchList, setBranchList] = useState<LocalRepoBranchInfo[]>([]);
    const [branch, setBranch] = useState("");

    const calcAnalyseInfo = async () => {
        if (branch == "") {
            return;
        }
        setAnalyseInfo(null);
        const res = await analyse(props.repo.path, branch, fromTime.valueOf(), toTime.valueOf());
        setAnalyseInfo(res);
    };

    const loadBranchList = async () => {
        const res = await list_repo_branch(props.repo.path);
        setBranchList(res);
        if (res.length > 0) {
            setBranch(res[0].name);
        }
    };

    useEffect(() => {
        calcAnalyseInfo();
    }, [fromTime, toTime, branch]);

    useEffect(() => {
        loadBranchList();
    }, []);

    return (
        <Modal open title={`${props.repo.name}统计数据`} footer={null}
            bodyStyle={{ padding: "0px 0px" }} width={600}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            <Card bordered={false} bodyStyle={{ height: "calc(100vh - 300px)", overflowY: "scroll" }}
                extra={
                    <Form layout="inline">
                        <Form.Item label="分支">
                            <Select style={{ width: "100px" }} value={branch} onChange={value => setBranch(value)}>
                                {branchList.map(item => (
                                    <Select.Option key={item.name} value={item.name}>{item.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="时间区间">
                            <DatePicker.RangePicker value={[fromTime, toTime]}
                                popupStyle={{ zIndex: 10000 }}
                                onChange={values => {
                                    if (values?.length == 2) {
                                        setFromTime(values[0]!.startOf("day"));
                                        setToTime(values[1]!.endOf("day"));
                                    }
                                }} />
                        </Form.Item>
                    </Form>
                }>
                {analyseInfo == null && (
                    <Spin tip="统计中..." style={{ paddingLeft: "270px" }} />
                )}
                {analyseInfo != null && (
                    <>
                        <Descriptions title={`总体统计(提交${analyseInfo.global_stat.commit_count}次)`} column={2} bordered={true}>
                            <Descriptions.Item label="累计新增">{analyseInfo.global_stat.total_add_count}行</Descriptions.Item>
                            <Descriptions.Item label="累计删除">{analyseInfo.global_stat.total_del_count}行</Descriptions.Item>
                            <Descriptions.Item label="有效新增">{analyseInfo.effect_add_count}行</Descriptions.Item>
                            <Descriptions.Item label="有效删除">{analyseInfo.effect_del_count}行</Descriptions.Item>
                            {analyseInfo.global_stat.min_commit.commit_id != "" && (
                                <>
                                    <Descriptions.Item label="最小提交" span={2}>{analyseInfo.global_stat.min_commit.summary}</Descriptions.Item>
                                    <Descriptions.Item label="最小提交新增">{analyseInfo.global_stat.min_commit.add_count}</Descriptions.Item>
                                    <Descriptions.Item label="最小提交删除">{analyseInfo.global_stat.min_commit.del_count}</Descriptions.Item>
                                </>
                            )}
                            {analyseInfo.global_stat.max_commit.commit_id != "" && (
                                <>
                                    <Descriptions.Item label="最大提交" span={2}>{analyseInfo.global_stat.max_commit.summary}</Descriptions.Item>
                                    <Descriptions.Item label="最大提交新增">{analyseInfo.global_stat.max_commit.add_count}</Descriptions.Item>
                                    <Descriptions.Item label="最大提交删除">{analyseInfo.global_stat.max_commit.del_count}</Descriptions.Item>
                                </>
                            )}
                            {analyseInfo.last_time > 0 && (
                                <Descriptions.Item label="最后提交时间" span={2}>{moment(analyseInfo.last_time * 1000).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
                            )}
                        </Descriptions>
                        {analyseInfo.commiter_stat_list.map(item => (
                            <div key={item.commiter}>
                                <Descriptions title={`${item.commiter} 相关统计(提交${item.stat.commit_count}次)`} column={2} bordered={true}
                                    style={{ marginTop: "10px" }}>
                                    <Descriptions.Item label="累计新增">{item.stat.total_add_count}行</Descriptions.Item>
                                    <Descriptions.Item label="累计删除">{item.stat.total_del_count}行</Descriptions.Item>
                                    {item.stat.min_commit.commit_id != "" && (
                                        <>
                                            <Descriptions.Item label="最小提交" span={2}>{item.stat.min_commit.summary}</Descriptions.Item>
                                            <Descriptions.Item label="最小提交新增">{item.stat.min_commit.add_count}</Descriptions.Item>
                                            <Descriptions.Item label="最小提交删除">{item.stat.min_commit.del_count}</Descriptions.Item>
                                        </>
                                    )}
                                    {item.stat.max_commit.commit_id != "" && (
                                        <>
                                            <Descriptions.Item label="最大提交" span={2}>{item.stat.max_commit.summary}</Descriptions.Item>
                                            <Descriptions.Item label="最大提交新增">{item.stat.max_commit.add_count}</Descriptions.Item>
                                            <Descriptions.Item label="最大提交删除">{item.stat.max_commit.del_count}</Descriptions.Item>
                                        </>
                                    )}
                                </Descriptions>
                                <BarChart height={300} width={560} data={item.day_stat_list}>
                                    <XAxis dataKey="day_str" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="add_count" fill="green" />
                                    <Bar dataKey="del_count" fill="red" />
                                    <Bar dataKey="commit_count" fill="black" />
                                </BarChart>
                            </div>
                        ))}
                    </>
                )}
            </Card>
        </Modal>
    );
};


interface LocalRepoPanelProps {
    repo: LocalRepoExtInfo;
}

const LocalRepoPanel: React.FC<LocalRepoPanelProps> = (props) => {
    const [remoteList, setRemoteList] = useState<LocalRepoRemoteInfo[]>([]);
    const [branchList, setBranchList] = useState<LocalRepoBranchInfo[]>([]);
    const [tagList, setTagList] = useState<LocalRepoTagInfo[]>([]);
    const [activeKey, setActiveKey] = useState("workDir");
    const [widgetList, setWidgetList] = useState<WidgetInfo[]>([]);

    const [removeTagName, setRemoveTagName] = useState("");
    const [removeBranchName, setRemoveBranchName] = useState("");

    const loadRepoInfo = async () => {
        try {
            const branchRes = await list_repo_branch(props.repo.repoInfo.path);
            setBranchList(branchRes);
            const tagRes = await list_repo_tag(props.repo.repoInfo.path);
            setTagList(tagRes);
            if (branchRes.length == 0) {
                return;
            }
            const remoteRes = await list_remote(props.repo.repoInfo.path);
            setRemoteList(remoteRes);
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
        }
    };

    const loadWidgetList = async () => {
        const res = await request(list_widget());
        setWidgetList(res.widget_list.sort((a, b) => b.weight - a.weight));
    };

    const openBranchDiff = async (item: LocalRepoBranchInfo) => {
        const pos = await appWindow.innerPosition();
        new WebviewWindow(`commit:${item.commit_id}`, {
            url: `git_diff.html?path=${encodeURIComponent(props.repo.repoInfo.path)}&commitId=${item.commit_id}&summary=${encodeURIComponent(item.commit_summary)}&commiter=`,
            title: `${props.repo.repoInfo.name}(commit:${item.commit_id.substring(0, 8)})`,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
    }

    const openTagDiff = async (item: LocalRepoTagInfo) => {
        const pos = await appWindow.innerPosition();
        new WebviewWindow(`commit:${item.commit_id}`, {
            url: `git_diff.html?path=${encodeURIComponent(props.repo.repoInfo.path)}&commitId=${item.commit_id}&summary=${encodeURIComponent(item.commit_summary)}&commiter=`,
            title: `${props.repo.repoInfo.name}(commit:${item.commit_id.substring(0, 8)})`,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
    };

    const removeBranch = async () => {
        if (removeBranchName == "") {
            return;
        }
        await remove_branch(props.repo.repoInfo.path, removeBranchName, false);
        await loadRepoInfo();
        setRemoveBranchName("");
        message.info("删除成功");
    };

    const removeTag = async () => {
        if (removeTagName == "") {
            return;
        }
        await remove_tag(props.repo.repoInfo.path, removeTagName);
        await loadRepoInfo();
        setRemoveTagName("");
        message.info("删除成功");
    };

    useEffect(() => {
        loadRepoInfo();
    }, [props.repo.repoInfo.path, props.repo.headInfo.commit_id]);

    useEffect(() => {
        loadWidgetList();
    }, []);

    return (
        <>
            <Tabs type="card" tabPosition="left" key={props.repo.id} activeKey={activeKey} onChange={key => {
                setActiveKey(key);
            }}>
                <Tabs.TabPane tab="工作目录" key="workDir">
                    <WorkDir basePath={props.repo.repoInfo.path} widgetList={widgetList} headBranch={props.repo.headInfo.branch_name} filterList={props.repo.filterList} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="提交记录" key="commitList">
                    {activeKey == "commitList" && (
                        <CommitList repo={props.repo.repoInfo} branchList={branchList} headBranch={props.repo.headInfo.branch_name}
                            tagList={tagList}
                            onChange={() => loadRepoInfo()} />
                    )}
                </Tabs.TabPane>
                <Tabs.TabPane tab="分支列表" key="branchList" style={{ height: "calc(100vh - 400px)", overflow: "scroll" }}>
                    {activeKey == "branchList" && (
                        <>
                            <List rowKey="name" dataSource={branchList} renderItem={item => (
                                <List.Item style={{ display: "block" }}>
                                    <Space size="small">
                                        <BranchesOutlined /> {moment(item.commit_time).format("YYYY-MM-DD HH:mm")} {item.name}
                                        {item.upstream != "" && (
                                            <span>({item.upstream})</span>
                                        )}
                                        {item.name != props.repo.headInfo.branch_name && (
                                            <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setRemoveBranchName(item.name);
                                                }}>删除分支</Button>
                                        )}
                                    </Space>
                                    <br />
                                    <Space size="small">
                                        <NodeIndexOutlined /> {item.commit_id.substring(0, 8)} <a onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            openBranchDiff(item);
                                        }}>{item.commit_summary}</a>
                                    </Space>
                                </List.Item>
                            )} />
                        </>
                    )}
                </Tabs.TabPane>
                <Tabs.TabPane tab="标记列表" key="tagList" style={{ height: "calc(100vh - 400px)", overflow: "scroll" }}>
                    {activeKey == "tagList" && (
                        <List rowKey="name" dataSource={tagList} renderItem={item => (
                            <List.Item style={{ display: "block" }}>
                                <Space size="small">
                                    <TagOutlined /> {moment(item.commit_time).format("YYYY-MM-DD HH:mm")} {item.name}
                                    <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setRemoveTagName(item.name);
                                        }}>删除标记</Button>
                                </Space>
                                <br />
                                <Space size="small">
                                    <NodeIndexOutlined /> {item.commit_id.substring(0, 8)} <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        openTagDiff(item);
                                    }}>{item.commit_summary}</a>
                                </Space>
                            </List.Item>
                        )} />
                    )}
                </Tabs.TabPane>
                <Tabs.TabPane tab="未提交文件" key="status" style={{ height: "calc(100vh - 400px)", overflow: "hidden" }}>
                    {activeKey == "status" && (
                        <ChangeFileList repo={props.repo.repoInfo} onCommit={() => loadRepoInfo()} filterList={props.repo.filterList} />
                    )}
                </Tabs.TabPane>
                <Tabs.TabPane tab="远程仓库" key="remotes" style={{ height: "calc(100vh - 400px)", overflow: "scroll" }}>
                    {activeKey == "remotes" && (
                        <List rowKey="name" dataSource={remoteList} renderItem={item => (
                            <List.Item>
                                <div style={{ display: "flex", width: "100%" }}>
                                    <div style={{ width: "200px" }}>
                                        <a onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            shell_open(get_http_url(item.url));
                                        }}>{item.name}</a>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        {item.url}
                                    </div>
                                </div>
                            </List.Item>
                        )} />
                    )}
                </Tabs.TabPane>
                {props.repo.filterList.includes("lfs") && (
                    <Tabs.TabPane tab="大文件列表" key="largeFile" style={{ height: "calc(100vh - 400px)", overflow: "scroll" }}>
                        {activeKey == "largeFile" && (
                            <LargeFileList repoPath={props.repo.repoInfo.path} />
                        )}
                    </Tabs.TabPane>
                )}
            </Tabs>
            {removeBranchName != "" && (
                <Modal open title="删除分支"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveBranchName("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeBranch();
                    }}>
                    是否删除分支&nbsp;{removeBranchName}&nbsp;
                </Modal>
            )}
            {removeTagName != "" && (
                <Modal open title="删除标记"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveTagName("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeTag();
                    }}>
                    是否删除标记&nbsp;{removeTagName}&nbsp;
                </Modal>
            )}
        </>
    );
};



const LocalRepoList = () => {
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const repoId = urlParams.get('repoId') ?? "";

    const localRepoStore = useStores("localRepoStore");

    const [activeKey, setActiveKey] = useState(repoId);
    const [editRepo, setEditRepo] = useState<LocalRepoInfo | null>(null);
    const [analyseRepo, setAnalyseRepo] = useState<LocalRepoInfo | null>(null);
    const [linkProjectRepo, setLinkProjectRepo] = useState<LocalRepoInfo | null>(null);
    const [launchRepo, setLaunchRepo] = useState<LocalRepoInfo | null>(null);
    const [selRepoBranchInfo, setSelRepoBranchInfo] = useState<LocalRepoExtInfo | null>(null);

    return (
        <>
            {localRepoStore.repoExtList.length == 0 && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="请添加代码仓库"/>
            )}
            {localRepoStore.repoExtList.length > 0 && (
                <Collapse accordion activeKey={activeKey} onChange={key => {
                    if (!Array.isArray(key)) {
                        setActiveKey(key);
                    }
                }}>
                    {localRepoStore.repoExtList.map(repo => (
                        <Collapse.Panel key={repo.id} header={<span>{repo.repoInfo.name}({repo.repoInfo.path})
                        </span>}
                            extra={
                                <Space size="middle">
                                    {repo.filterList.map(filterItem => (
                                        <Tag key={filterItem} style={{ fontSize: "14px", fontWeight: 700, padding: "4px 4px", backgroundColor: "#eee" }}>{filterItem}</Tag>
                                    ))}
                                    {repo.headInfo.branch_name != "" && (
                                        <a style={{
                                            backgroundColor: "#ddd", padding: "4px 10px", marginLeft: "20px",
                                            borderRadius: "10px", width: "150px", display: "block", textWrap: "wrap",
                                            textOverflow: "ellipsis", overflow: "hidden"
                                        }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setSelRepoBranchInfo(repo);
                                            }}>{repo.headInfo.branch_name}</a>
                                    )}
                                    <Button style={{ color: "orange", fontWeight: 500 }} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setLaunchRepo(repo.repoInfo);
                                    }}>启动开发环境</Button>
                                    <div onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}>
                                        <Popover trigger="click" placement="bottom"
                                            content={
                                                <div style={{ padding: "10px 10px" }}>
                                                    <Space direction="vertical">
                                                        <Button type="link" style={{ minWidth: "0px", padding: "0px 0px" }} onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setAnalyseRepo(repo.repoInfo);
                                                        }}>
                                                            统计数据
                                                        </Button>
                                                        <Button type="link" style={{ minWidth: "0px", padding: "0px 0px" }} onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            localRepoStore.onUpdateRepo(repo.id);
                                                            message.info("刷新成功");
                                                        }}>
                                                            刷新
                                                        </Button>
                                                        <Button type="link" style={{ minWidth: "0px", padding: "0px 0px" }} onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setLinkProjectRepo(repo.repoInfo);
                                                        }}>
                                                            关联项目
                                                        </Button>
                                                        <Button type="link" style={{ minWidth: "0px", padding: "0px 0px" }} onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setEditRepo(repo.repoInfo);
                                                        }}>
                                                            修改设置
                                                        </Button>
                                                        <Divider style={{ margin: "0px 0px" }} />
                                                        <Button type="link" style={{ minWidth: "0px", padding: "0px 0px" }}
                                                            danger
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                localRepoStore.removeRepo(repo.id);
                                                            }}>删除</Button>
                                                    </Space>
                                                </div>
                                            }>
                                            <MoreOutlined style={{ padding: "6px 6px" }} />
                                        </Popover>
                                    </div>
                                </Space>
                            }>
                            {activeKey == repo.id && (
                                <LocalRepoPanel repo={repo} key={repo.id} />
                            )}
                        </Collapse.Panel>
                    ))}
                </Collapse>
            )}
            {editRepo != null && (
                <SetLocalRepoModal repo={editRepo} onCancel={() => setEditRepo(null)} onOk={() => {
                    setEditRepo(null);
                    localRepoStore.loadRepoList();
                }} />
            )}
            {analyseRepo != null && (
                <AnalyseRepoModal repo={analyseRepo} onCancel={() => setAnalyseRepo(null)} />
            )}
            {linkProjectRepo !== null && (
                <LinkProjectModal repo={linkProjectRepo} onCancel={() => setLinkProjectRepo(null)} />
            )}
            {launchRepo !== null && (
                <LaunchRepoModal repo={launchRepo} onClose={() => setLaunchRepo(null)} />
            )}
            {selRepoBranchInfo != null && (
                <ChangeBranchModal repo={selRepoBranchInfo.repoInfo} headBranch={selRepoBranchInfo.headInfo.branch_name}
                    onCancel={() => setSelRepoBranchInfo(null)}
                    onOk={() => {
                        localRepoStore.onUpdateRepo(selRepoBranchInfo.id);
                        setSelRepoBranchInfo(null);
                    }} />
            )}
        </>
    );
};

export default observer(LocalRepoList);