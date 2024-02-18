import React, { useEffect, useState } from "react";
import { observer, useLocalObservable } from 'mobx-react';
import type { LinkInfo, LinkTaskInfo, LinkBugInfo } from "@/stores/linkAux";
import { LINK_TARGET_TYPE } from "@/stores/linkAux";
import { get as get_sprit } from "@/api/project_sprit";
import type { SpritInfo } from "@/api/project_sprit";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { Button, Card, Dropdown, Form, Popover, Select, Space, Tabs } from 'antd';
import IssuePanel from "./components/IssuePanel";
import StatPanel from "./components/StatPanel";
import GanttPanel from "./components/GanttPanel";
import KanbanPanel from "./components/KanbanPanel";
import BurnDownPanel from "./components/BurnDownPanel";
import SummaryPanel from "./components/SummaryPanel";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { ISSUE_TYPE_TASK, type ISSUE_TYPE, ISSUE_TYPE_BUG, link_sprit, list as list_issue, SORT_TYPE_DSC, SORT_KEY_UPDATE_TIME } from "@/api/project_issue";
import AddTaskOrBug from "@/components/Editor/components/AddTaskOrBug";
import AddIssueModal from "./components/AddIssueModal";
import { ExportOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { ISSUE_LIST_KANBAN, ISSUE_LIST_LIST } from "@/api/project_entry";
import CommentEntry from "@/components/CommentEntry";
import { COMMENT_TARGET_ENTRY } from "@/api/project_comment";
import ExportModal from "./components/ExportModal";
import TestPlanPanel from "./components/TestPlanPanel";
import AddTestCaseModal from "./components/AddTestCaseModal";
import { LocalIssueStore, LocalTestcaseStore } from "@/stores/local";
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';
import { list_by_sprit } from "@/api/project_testcase";

export interface SpritStatus {
    taskCount: number;
    bugCount: number;
    missTimeTaskCount: number;
    missProgressTaskCount: number;
    missTimeBugCount: number;
    missProgressBugCount: number;
    missExecTaskCount: number;
    missExecBugCount: number;
}

const SpritDetail = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');
    const entryStore = useStores('entryStore');

    const taskStore = useLocalObservable(() => new LocalIssueStore(userStore.sessionId, projectStore.curProjectId, entryStore.curEntry?.entry_id ?? "", ISSUE_TYPE_TASK));
    const bugStore = useLocalObservable(() => new LocalIssueStore(userStore.sessionId, projectStore.curProjectId, entryStore.curEntry?.entry_id ?? "", ISSUE_TYPE_BUG));
    const testcaseStore = useLocalObservable(() => new LocalTestcaseStore(userStore.sessionId, projectStore.curProjectId, entryStore.curEntry?.entry_id ?? ""));

    const [spritInfo, setSpritInfo] = useState<SpritInfo | null>(null);
    const [selMemberUserId, setSelMemberUserId] = useState("");
    const [refIssueType, setRefIssueType] = useState<ISSUE_TYPE | null>(null);
    const [showAddIssueModal, setShowAddIssueModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showAddTestCaseModal, setShowAddTestCaseModal] = useState(false);

    const [spritTab, setSpritTab] = useState("");

    const [spritStatus, setSpritStatus] = useState<SpritStatus>({
        taskCount: 0,
        bugCount: 0,
        missTimeTaskCount: 0,
        missProgressTaskCount: 0,
        missTimeBugCount: 0,
        missProgressBugCount: 0,
        missExecTaskCount: 0,
        missExecBugCount: 0,
    });

    const loadSpritInfo = async () => {
        const res = await request(get_sprit(userStore.sessionId, projectStore.curProjectId, entryStore.curEntry?.entry_id ?? ""));
        setSpritInfo(res.info);
    };

    const linkSprit = async (links: LinkInfo[]) => {
        let issueIdList: string[] = [];
        for (const link of links) {
            if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BUG) {
                issueIdList.push((link as LinkBugInfo).issueId);
            } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TASK) {
                issueIdList.push((link as LinkTaskInfo).issueId);
            }
        }
        issueIdList = issueIdList.filter(issueId => {
            const bugIndex = bugStore.itemList.findIndex(bug => bug.issue_id == issueId);
            if (bugIndex != -1) {
                return false;
            }
            const taskIndex = taskStore.itemList.findIndex(task => task.issue_id == issueId);
            if (taskIndex != -1) {
                return false;
            }
            return true;
        });
        for (const issueId of issueIdList) {
            await request(link_sprit(userStore.sessionId, projectStore.curProjectId, issueId, entryStore.curEntry?.entry_id ?? ""));
        }
        setRefIssueType(null);
    }

    const calcSpritStatus = () => {
        const status = {
            taskCount: taskStore.itemList.length,
            bugCount: bugStore.itemList.length,
            missTimeTaskCount: 0,
            missProgressTaskCount: 0,
            missTimeBugCount: 0,
            missProgressBugCount: 0,
            missExecTaskCount: 0,
            missExecBugCount: 0,
        };
        for (const bug of bugStore.itemList) {
            if (bug.exec_user_id == "") {
                status.missExecBugCount += 1;
            }
            if (bug.has_start_time == false || bug.has_end_time == false) {
                status.missTimeBugCount += 1;
            }
            if (bug.has_estimate_minutes == false || bug.has_remain_minutes == false) {
                status.missProgressBugCount += 1;
            }
        }
        for (const task of taskStore.itemList) {
            if (task.exec_user_id == "") {
                status.missExecTaskCount += 1;
            }
            if (task.has_start_time == false || task.has_end_time == false) {
                status.missTimeTaskCount += 1;
            }
            if (task.has_estimate_minutes == false || task.has_remain_minutes == false) {
                status.missProgressTaskCount += 1;
            }
        }
        setSpritStatus(status);
    };

    const loadIssueList = async (issueType: ISSUE_TYPE) => {
        if (entryStore.curEntry == null) {
            return;
        }
        const res = await request(list_issue({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_param: {
                filter_by_issue_type: true,
                issue_type: issueType,
                filter_by_state: false,
                state_list: [],
                filter_by_create_user_id: false,
                create_user_id_list: [],
                filter_by_assgin_user_id: false,
                assgin_user_id_list: [],
                assgin_user_type: 0,
                filter_by_sprit_id: true,
                sprit_id_list: [entryStore.curEntry.entry_id],
                filter_by_create_time: false,
                from_create_time: 0,
                to_create_time: 0,
                filter_by_update_time: false,
                from_update_time: 0,
                to_update_time: 0,
                filter_by_title_keyword: false,
                title_keyword: "",
                filter_by_tag_id_list: false,
                tag_id_list: [],
                filter_by_watch: false,
                ///任务相关
                filter_by_task_priority: false,
                task_priority_list: [],
                ///缺陷相关
                filter_by_software_version: false,
                software_version_list: [],
                filter_by_bug_priority: false,
                bug_priority_list: [],
                filter_by_bug_level: false,
                bug_level_list: [],
            },
            sort_type: SORT_TYPE_DSC,
            sort_key: SORT_KEY_UPDATE_TIME,
            offset: 0,
            limit: 999,
        }));
        //按issue index倒序
        const infoList = res.info_list.sort((a, b) => b.issue_index - a.issue_index);
        if (issueType == ISSUE_TYPE_TASK) {
            taskStore.itemList = infoList;
        } else if (issueType == ISSUE_TYPE_BUG) {
            bugStore.itemList = infoList;
        }
    };

    const loadTestcaseList = async () => {
        if (entryStore.curEntry == null) {
            return;
        }
        const res = await request(list_by_sprit({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            sprit_id: entryStore.curEntry.entry_id,
        }));

        testcaseStore.itemList = res.case_list.map(item => ({
            id: item.case_id,
            dataType: "case",
            dataValue: item,
        }))
    };

    useEffect(() => {
        if (entryStore.curEntry != null) {
            loadSpritInfo();
            loadIssueList(ISSUE_TYPE_TASK);
            loadIssueList(ISSUE_TYPE_BUG);
            loadTestcaseList();
        }
    }, [entryStore.curEntry]);

    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            if (ev.payload.ProjectNotice?.UpdateSpritNotice != undefined && ev.payload.ProjectNotice.UpdateSpritNotice.sprit_id == (entryStore.curEntry?.entry_id ?? "")) {
                loadSpritInfo();
            }
        });

        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, []);

    useEffect(() => {
        if (entryStore.curEntry != null) {
            let needChange = false;
            if (spritTab == "issue" && entryStore.curEntry.extra_info.ExtraSpritInfo?.issue_list_type == ISSUE_LIST_KANBAN) {
                needChange = true;
            } else if (spritTab == "kanban" && entryStore.curEntry.extra_info.ExtraSpritInfo?.issue_list_type == ISSUE_LIST_LIST) {
                needChange = true;
            } else if (spritTab == "gantt" && entryStore.curEntry.extra_info.ExtraSpritInfo?.hide_gantt_panel == true) {
                needChange = true;
            } else if (spritTab == "burnDown" && entryStore.curEntry.extra_info.ExtraSpritInfo?.hide_burndown_panel == true) {
                needChange = true;
            } else if (spritTab == "statistics" && entryStore.curEntry.extra_info.ExtraSpritInfo?.hide_stat_panel == true) {
                needChange = true;
            } else if (spritTab == "testplan" && entryStore.curEntry.extra_info.ExtraSpritInfo?.hide_test_plan_panel == true) {
                needChange = true;
            } else if (spritTab == "summary" && entryStore.curEntry.extra_info.ExtraSpritInfo?.hide_summary_panel) {
                needChange = true;
            } else if (spritTab == "") {
                needChange = true;
            }
            if (needChange) {
                if (entryStore.curEntry.extra_info.ExtraSpritInfo?.issue_list_type == ISSUE_LIST_KANBAN) {
                    setSpritTab("kanban");
                } else {
                    setSpritTab("issue");
                }
            }
        }
    }, [entryStore.curEntry]);

    useEffect(() => {
        calcSpritStatus();
    }, [taskStore.itemList, bugStore.itemList]);

    useEffect(() => {
        return () => {
            taskStore.unlisten();
        };
    }, []);

    useEffect(() => {
        return () => {
            bugStore.unlisten();
        };
    }, []);

    useEffect(() => {
        return () => {
            testcaseStore.unlisten();
        };
    }, []);

    return (
        <Card bordered={false}
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "hidden", overflowX: "hidden", padding: "0px 0px" }}>
            <div>
                {spritInfo != null && (
                    <Tabs
                        activeKey={spritTab}
                        type="card"
                        onChange={value => {
                            setSpritTab(value);
                        }} tabBarExtraContent={
                            <Space style={{ marginRight: "10px" }}>
                                <CommentEntry projectId={projectStore.curProjectId} targetType={COMMENT_TARGET_ENTRY}
                                    targetId={entryStore.curEntry?.entry_id ?? ""} myUserId={userStore.userInfo.userId} myAdmin={projectStore.isAdmin} />
                                {(spritTab == "issue" || spritTab == "kanban") && (
                                    <Form layout="inline">
                                        <Form.Item label="过滤成员">
                                            <Select value={selMemberUserId} style={{ width: "120px", marginRight: "20px" }}
                                                onChange={value => setSelMemberUserId(value)}>
                                                <Select.Option value="">
                                                    <Space>
                                                        <UserPhoto logoUri="/default_av.jpg" style={{ width: "20px" }} />
                                                        <span>全部成员</span>
                                                    </Space>
                                                </Select.Option>
                                                {memberStore.memberList.map(item => (
                                                    <Select.Option key={item.member.member_user_id} value={item.member.member_user_id}>
                                                        <Space>
                                                            <UserPhoto logoUri={item.member.logo_uri} style={{ width: "20px" }} />
                                                            <span>{item.member.display_name}</span>
                                                        </Space>
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item>
                                            <Dropdown.Button type="primary"
                                                disabled={(projectStore.isClosed || !(entryStore.curEntry?.can_update ?? false))}
                                                menu={{
                                                    items: [
                                                        {
                                                            key: "refTask",
                                                            label: "引用任务",
                                                            disabled: (projectStore.isClosed || !(entryStore.curEntry?.can_update ?? false)),
                                                            onClick: () => setRefIssueType(ISSUE_TYPE_TASK),
                                                        },
                                                        {
                                                            key: "refBug",
                                                            label: "引用缺陷",
                                                            disabled: (projectStore.isClosed || !(entryStore.curEntry?.can_update ?? false)),
                                                            onClick: () => setRefIssueType(ISSUE_TYPE_BUG),
                                                        }
                                                    ]
                                                }} onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowAddIssueModal(true);
                                                }}><PlusOutlined />增加</Dropdown.Button>
                                        </Form.Item>
                                    </Form>
                                )}
                                {spritTab == "testplan" && (
                                    <Button type="primary" icon={<PlusOutlined />}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setShowAddTestCaseModal(true);
                                        }}>增加测试用例</Button>
                                )}
                                <Popover trigger="click" placement="bottom" content={
                                    <Space direction="vertical" style={{ padding: "10px 10px" }}>
                                        <Button type="link" icon={<ExportOutlined />}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setShowExportModal(true);
                                            }}>导出</Button>
                                    </Space>
                                }>
                                    <MoreOutlined style={{ padding: "6px" }} />
                                </Popover>
                            </Space>
                        }>
                        {entryStore.curEntry?.extra_info.ExtraSpritInfo?.issue_list_type != ISSUE_LIST_KANBAN && (
                            <Tabs.TabPane tab={<span style={{ fontSize: "16px", fontWeight: 500 }}>列表</span>} key="issue">
                                {spritTab == "issue" && (
                                    <IssuePanel spritId={entryStore.curEntry?.entry_id ?? ""} startTime={entryStore.curEntry?.extra_info.ExtraSpritInfo?.start_time ?? 0}
                                        endTime={entryStore.curEntry?.extra_info.ExtraSpritInfo?.end_time ?? 0}
                                        memberId={selMemberUserId} taskStore={taskStore} bugStore={bugStore} />
                                )}
                            </Tabs.TabPane>
                        )}
                        {entryStore.curEntry?.extra_info.ExtraSpritInfo?.issue_list_type != ISSUE_LIST_LIST && (
                            <Tabs.TabPane tab={<span style={{ fontSize: "16px", fontWeight: 500 }}>看板</span>} key="kanban">
                                {spritTab == "kanban" && <KanbanPanel memberId={selMemberUserId} spritInfo={spritInfo} entryInfo={entryStore.curEntry} taskStore={taskStore} bugStore={bugStore} />}
                            </Tabs.TabPane>
                        )}

                        {entryStore.curEntry?.extra_info.ExtraSpritInfo?.hide_gantt_panel == false && (
                            <Tabs.TabPane tab={<span style={{ fontSize: "16px", fontWeight: 500 }}>甘特图</span>} key="gantt">
                                {spritTab == "gantt" && <GanttPanel spritName={entryStore.curEntry?.entry_title ?? ""}
                                    startTime={entryStore.curEntry?.extra_info.ExtraSpritInfo?.start_time ?? 0}
                                    endTime={entryStore.curEntry?.extra_info.ExtraSpritInfo?.end_time ?? 0}
                                    taskStore={taskStore} bugStore={bugStore} spritStatus={spritStatus} />}
                            </Tabs.TabPane>
                        )}
                        {entryStore.curEntry?.extra_info.ExtraSpritInfo?.hide_burndown_panel == false && (
                            <Tabs.TabPane tab={<span style={{ fontSize: "16px", fontWeight: 500 }}>燃尽图</span>} key="burnDown">
                                {spritTab == "burnDown" && <BurnDownPanel spritInfo={spritInfo} taskStore={taskStore} bugStore={bugStore} spritStatus={spritStatus} />}
                            </Tabs.TabPane>
                        )}
                        {entryStore.curEntry?.extra_info.ExtraSpritInfo?.hide_stat_panel == false && (
                            <Tabs.TabPane tab={<span style={{ fontSize: "16px", fontWeight: 500 }}>统计信息</span>} key="statistics">
                                {spritTab == "statistics" && <StatPanel taskStore={taskStore} bugStore={bugStore} spritStatus={spritStatus} />}
                            </Tabs.TabPane>
                        )}
                        {entryStore.curEntry?.extra_info.ExtraSpritInfo?.hide_test_plan_panel == false && (
                            <Tabs.TabPane tab={<span style={{ fontSize: "16px", fontWeight: 500 }}>测试计划</span>} key="testplan">
                                {spritTab == "testplan" && <TestPlanPanel testcaseStore={testcaseStore} />}
                            </Tabs.TabPane>
                        )}
                        {entryStore.curEntry?.extra_info.ExtraSpritInfo?.hide_summary_panel == false && (
                            <Tabs.TabPane tab={<span style={{ fontSize: "16px", fontWeight: 500 }}>工作总结</span>} key="summary">
                                {spritTab == "summary" && <SummaryPanel state={spritInfo.summary_state} />}
                            </Tabs.TabPane>
                        )}
                    </Tabs>
                )}
            </div>
            {refIssueType != null && (
                <AddTaskOrBug
                    open
                    title={refIssueType == ISSUE_TYPE_TASK ? "选择任务" : "选择缺陷"}
                    onOK={links => linkSprit(links as LinkInfo[])}
                    onCancel={() => setRefIssueType(null)}
                    issueIdList={refIssueType == ISSUE_TYPE_TASK ?
                        taskStore.itemList.map(item => item.issue_id) : bugStore.itemList.map(item => item.issue_id)}
                    type={refIssueType == ISSUE_TYPE_TASK ? "task" : "bug"}
                />
            )}
            {showAddIssueModal == true && (
                <AddIssueModal onClose={() => setShowAddIssueModal(false)} />
            )}
            {showExportModal == true && (
                <ExportModal onClose={() => setShowExportModal(false)} taskStore={taskStore} bugStore={bugStore} testcaseStore={testcaseStore} />
            )}
            {showAddTestCaseModal == true && (
                <AddTestCaseModal onClose={() => setShowAddTestCaseModal(false)} checkedKeys={testcaseStore.itemList.map(item => item.id)} />
            )}
        </Card>
    );
};

export default observer(SpritDetail);