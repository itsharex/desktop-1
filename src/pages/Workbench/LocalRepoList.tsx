import { Button, Card, Collapse, Empty, Form, List, Modal, Popover, Select, Space, Tabs, DatePicker, message, Spin, Descriptions, Checkbox, Tooltip as AntTooltip, Divider, Tag } from "antd";
import React, { useEffect, useState } from "react";
import type { LocalRepoInfo, LocalRepoBranchInfo, LocalRepoTagInfo, LocalRepoAnalyseInfo, LocalRepoRemoteInfo, HeadInfo } from "@/api/local_repo";
import { list_repo, remove_repo, list_repo_branch, list_repo_tag, analyse, list_remote, get_http_url, get_head_info, list_git_filter } from "@/api/local_repo";
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
import CreateBranchModal from "./components/repo/CreateBranchModal";

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
    repoVersion: number;
    headBranch: string;
    repo: LocalRepoInfo;
    filterList: string[];
}

const LocalRepoPanel: React.FC<LocalRepoPanelProps> = (props) => {
    const [remoteList, setRemoteList] = useState<LocalRepoRemoteInfo[]>([]);
    const [branchList, setBranchList] = useState<LocalRepoBranchInfo[]>([]);
    const [tagList, setTagList] = useState<LocalRepoTagInfo[]>([]);
    const [activeKey, setActiveKey] = useState("workDir");
    const [widgetList, setWidgetList] = useState<WidgetInfo[]>([]);

    const [createBranchFrom, setCreateBranchFrom] = useState("");

    const loadRepoInfo = async () => {
        try {
            const branchRes = await list_repo_branch(props.repo.path);
            setBranchList(branchRes);
            const tagRes = await list_repo_tag(props.repo.path);
            setTagList(tagRes);
            if (branchRes.length == 0) {
                return;
            }
            const remoteRes = await list_remote(props.repo.path);
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
            url: `git_diff.html?path=${encodeURIComponent(props.repo.path)}&commitId=${item.commit_id}&summary=${encodeURIComponent(item.commit_summary)}&commiter=`,
            title: `${props.repo.name}(commit:${item.commit_id.substring(0, 8)})`,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
    }

    const openTagDiff = async (item: LocalRepoTagInfo) => {
        const pos = await appWindow.innerPosition();
        new WebviewWindow(`commit:${item.commit_id}`, {
            url: `git_diff.html?path=${encodeURIComponent(props.repo.path)}&commitId=${item.commit_id}&summary=${encodeURIComponent(item.commit_summary)}&commiter=`,
            title: `${props.repo.name}(commit:${item.commit_id.substring(0, 8)})`,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
    };

    useEffect(() => {
        loadRepoInfo();
    }, [props.repo.path, props.repoVersion]);

    useEffect(() => {
        loadWidgetList();
    }, []);

    return (
        <Tabs type="card" tabPosition="left" key={props.repo.id} activeKey={activeKey} onChange={key => {
            setActiveKey(key);
        }}>
            <Tabs.TabPane tab="工作目录" key="workDir">
                <WorkDir basePath={props.repo.path} widgetList={widgetList} headBranch={props.headBranch} filterList={props.filterList} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="提交记录" key="commitList">
                {activeKey == "commitList" && (
                    <CommitList repo={props.repo} branchList={branchList} />
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
                                    <a onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setCreateBranchFrom(item.name);
                                    }}>创建分支</a>
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
                        {createBranchFrom != "" && (
                            <CreateBranchModal repo={props.repo} fromBranch={createBranchFrom}
                                onCancel={() => setCreateBranchFrom("")} onOk={() => {
                                    setCreateBranchFrom("");
                                    loadRepoInfo();
                                }} />
                        )}
                    </>
                )}
            </Tabs.TabPane>
            <Tabs.TabPane tab="标记列表" key="tagList" style={{ height: "calc(100vh - 400px)", overflow: "scroll" }}>
                {activeKey == "tagList" && (
                    <List rowKey="name" dataSource={tagList} renderItem={item => (
                        <List.Item style={{ display: "block" }}>
                            <Space size="small">
                                <TagOutlined /> {moment(item.commit_time).format("YYYY-MM-DD HH:mm")} {item.name}
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
                    <ChangeFileList repo={props.repo} onCommit={() => loadRepoInfo()} filterList={props.filterList} />
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
        </Tabs>
    );
};

interface LocalRepoListProps {
    repoVersion: number;
    onChange: () => void;
}

interface LocalRepoInfoWithHead {
    id: string;
    repoInfo: LocalRepoInfo;
    headInfo: HeadInfo;
    filterList: string[];
}

const LocalRepoList: React.FC<LocalRepoListProps> = (props) => {
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const repoId = urlParams.get('repoId') ?? "";

    const [repoList, setRepoList] = useState<LocalRepoInfoWithHead[]>([]);
    const [activeKey, setActiveKey] = useState(repoId);
    const [editRepo, setEditRepo] = useState<LocalRepoInfo | null>(null);
    const [analyseRepo, setAnalyseRepo] = useState<LocalRepoInfo | null>(null);
    const [linkProjectRepo, setLinkProjectRepo] = useState<LocalRepoInfo | null>(null);
    const [launchRepo, setLaunchRepo] = useState<LocalRepoInfo | null>(null);
    const [selRepoBranchInfo, setSelRepoBranchInfo] = useState<LocalRepoInfoWithHead | null>(null);

    const loadRepoList = async () => {
        try {
            const res = await list_repo();
            const tmpList = [] as LocalRepoInfoWithHead[];
            for (const repo of res) {
                try {
                    const headInfo = await get_head_info(repo.path);
                    const filterList = await list_git_filter(repo.path);
                    tmpList.push({
                        id: repo.id,
                        repoInfo: repo,
                        headInfo: headInfo,
                        filterList: filterList,
                    });
                } catch (e) {
                    console.log(e);
                }
            }
            setRepoList(tmpList);
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
        }
    };

    const removeRepo = async (id: string) => {
        try {
            await remove_repo(id);
            props.onChange();
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
        }
    };

    const updateRepoHeadInfo = async (repoId: string) => {
        const tmpList = repoList.slice();
        const index = tmpList.findIndex(item => item.id == repoId);
        if (index == -1) {
            return;
        }
        const headInfo = await get_head_info(tmpList[index].repoInfo.path);
        tmpList[index].headInfo = headInfo;
        setRepoList(tmpList);
    };

    useEffect(() => {
        loadRepoList();
    }, [props.repoVersion]);
    return (
        <>
            {repoList.length == 0 && (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
            {repoList.length > 0 && (
                <Collapse accordion activeKey={activeKey} onChange={key => {
                    if (!Array.isArray(key)) {
                        setActiveKey(key);
                    }
                }}>
                    {repoList.map(repo => (
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
                                                            props.onChange();
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
                                                                removeRepo(repo.id);
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
                                <LocalRepoPanel repoVersion={props.repoVersion} repo={repo.repoInfo} key={repo.id} headBranch={repo.headInfo.branch_name} filterList={repo.filterList} />
                            )}
                        </Collapse.Panel>
                    ))}
                </Collapse>
            )}
            {editRepo != null && (
                <SetLocalRepoModal repo={editRepo} onCancel={() => setEditRepo(null)} onOk={() => {
                    setEditRepo(null);
                    props.onChange();
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
                        updateRepoHeadInfo(selRepoBranchInfo.id);
                        setSelRepoBranchInfo(null);
                    }} />
            )}
        </>
    );
};

export default LocalRepoList;