import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_ISSUE } from "@/api/fs";
import type { IssueInfo, PROCESS_STAGE } from "@/api/project_issue";
import { ISSUE_STATE_PROCESS, ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, PROCESS_STAGE_DOING, PROCESS_STAGE_DONE, PROCESS_STAGE_TODO, get as get_issue, remove as remove_issue } from "@/api/project_issue";
import { request } from "@/utils/request";
import { Button, Card, Form, Popover, Space, Tooltip, message } from "antd";
import { EditText } from "@/components/EditCell/EditText";
import { EditOutlined, MoreOutlined } from "@ant-design/icons";
import { cancelDeadLineTime, cancelEndTime, cancelEstimateMinutes, cancelRemainMinutes, cancelStartTime, getMemberSelectItems, getStateColor, updateCheckUser, updateDeadLineTime, updateEndTime, updateEstimateMinutes, updateExecUser, updateExtraInfo, updateProcessStage, updateRemainMinutes, updateStartTime, updateTitle } from "./utils";
import { issueState } from "@/utils/constant";
import { EditSelect } from "@/components/EditCell/EditSelect";
import { bugLvSelectItems, bugPrioritySelectItems, taskPrioritySelectItems, hourSelectItems } from "./constant";
import { EditDate } from "@/components/EditCell/EditDate";
import StageModel from "./StageModel";
import { updateContent as updateIssueContent } from './utils';


const DetailPanel = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');

    const [issueInfo, setIssueInfo] = useState<IssueInfo | null>(null);
    const [inEditContent, setInEditContent] = useState(false);

    const [showStageModal, setShowStageModal] = useState(false);

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.issue_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_ISSUE,
        ownerId: projectStore.projectModal.issueId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        enableLink: false,
        widgetInToolbar: false,
        showReminder: false,
        placeholder: "请输入...",
    });

    const memberSelectItems = getMemberSelectItems(memberStore.memberList.map(item => item.member))

    const loadIssuelInfo = async () => {
        const res = await request(get_issue(userStore.sessionId, projectStore.curProjectId, projectStore.projectModal.issueId));
        setIssueInfo(res.info);
    };

    const removeIssue = async () => {
        await request(remove_issue(userStore.sessionId, projectStore.curProjectId, projectStore.projectModal.issueId));
        projectStore.projectModal.setIssueIdAndType("", 0);
    };

    const updateContent = async () => {
        if (editorRef.current == null) {
            return;
        }
        const data = editorRef.current.getContent();;
        const content = JSON.stringify(data);
        const res = await updateIssueContent(userStore.sessionId, projectStore.curProjectId, projectStore.projectModal.issueId, content);
        if (res) {
            setInEditContent(false);
            message.info("更新内容成功");
            setIssueInfo(oldValue => {
                if (oldValue != null) {
                    oldValue.basic_info.content = content;
                }
                return oldValue;
            })
        } else {
            message.error("更新内容失败");
        }
    };

    useEffect(() => {
        loadIssuelInfo();
    }, [projectStore.projectModal.issueId]);

    return (
        <div>
            {issueInfo != null && (
                <>
                    <Card title={
                        <>
                            <span style={{ fontSize: "16px", fontWeight: 600 }}>标题:&nbsp;</span>
                            <EditText editable={issueInfo.user_issue_perm.can_update} content={issueInfo.basic_info.title} showEditIcon
                                fontSize="16px" fontWeight={600}
                                onChange={async value => {
                                    if (value.trim() == "") {
                                        return false;
                                    }
                                    return await updateTitle(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value);
                                }} />
                        </>
                    }
                        headStyle={{ padding: "0px 10px" }} bordered={false}
                        extra={
                            <Space>
                                {inEditContent == false && issueInfo.user_issue_perm.can_update && (
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setInEditContent(true);
                                        const t = setInterval(() => {
                                            if (editorRef.current != null) {
                                                editorRef.current.setContent(issueInfo.basic_info.content);
                                                clearInterval(t);
                                            }
                                        }, 100);
                                    }}>编辑内容</Button>
                                )}
                                {inEditContent == false && (
                                    <Popover trigger="click" placement="bottom" content={
                                        <div style={{ padding: "10px 10px" }}>
                                            <Button type="link" danger disabled={!issueInfo.user_issue_perm.can_remove} onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                removeIssue();
                                            }}>删除</Button>
                                        </div>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                )}
                                {inEditContent == true && (
                                    <>
                                        <Button onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setInEditContent(false);
                                        }}>取消</Button>
                                        <Button type="primary" onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            updateContent();
                                        }}>保存</Button>
                                    </>
                                )}
                            </Space>
                        }>
                        {inEditContent == false && (
                            <div className="_chatContext">
                                <ReadOnlyEditor content={issueInfo.basic_info.content} />
                            </div>
                        )}
                        {inEditContent == true && (
                            <div className="_chatContext">
                                {editor}
                            </div>
                        )}
                    </Card>
                    <Card title={<span style={{ fontSize: "16px", fontWeight: 600 }}>其他配置</span>} headStyle={{ padding: "0px 10px" }} bordered={false} >
                        <Form labelCol={{ span: 3 }}>
                            <Form.Item label="当前状态">
                                <div
                                    tabIndex={0}
                                    style={{
                                        background: `rgb(${getStateColor(issueInfo.state)} / 20%)`,
                                        width: '70px',
                                        borderRadius: '50px',
                                        textAlign: 'center',
                                        color: `rgb(${getStateColor(issueInfo.state)})`,
                                        cursor: `${((!projectStore.isClosed) && (issueInfo.user_issue_perm.next_state_list.length > 0)) ? "pointer" : "default"}`,
                                        paddingLeft: "0px",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        if (projectStore.isClosed) {
                                            return;
                                        }
                                        if (issueInfo.user_issue_perm.next_state_list.length > 0) {
                                            setShowStageModal(true);
                                        }
                                    }}
                                >
                                    <Tooltip title={`${issueInfo.user_issue_perm.next_state_list.length > 0 ? "" : "请等待同事更新状态"}`}>{issueState[issueInfo.state].label}</Tooltip>
                                    {(!projectStore.isClosed) && issueInfo.user_issue_perm.next_state_list.length > 0 && <a><EditOutlined /></a>}
                                </div>
                            </Form.Item>
                            {issueInfo.state == ISSUE_STATE_PROCESS && (
                                <Form.Item label="处理子阶段">
                                    <EditSelect
                                        allowClear={false}
                                        editable={(!projectStore.isClosed) && (userStore.userInfo.userId == issueInfo.exec_user_id)}
                                        curValue={issueInfo.process_stage}
                                        itemList={[
                                            {
                                                value: PROCESS_STAGE_TODO,
                                                label: "未开始",
                                                color: "black",
                                            },
                                            {
                                                value: PROCESS_STAGE_DOING,
                                                label: "执行中",
                                                color: "black",
                                            },
                                            {
                                                value: PROCESS_STAGE_DONE,
                                                label: "待检查",
                                                color: "black",
                                            },
                                        ]} onChange={async (value) => {
                                            return await updateProcessStage(userStore.sessionId, projectStore.curProjectId, issueInfo.issue_id, value as PROCESS_STAGE);
                                        }} showEditIcon={true} />
                                </Form.Item>
                            )}
                            {projectStore.projectModal.issueType == ISSUE_TYPE_BUG && (
                                <>
                                    <Form.Item label="级别">
                                        <EditSelect
                                            allowClear={false}
                                            editable={(!projectStore.isClosed) && issueInfo.user_issue_perm.can_update}
                                            curValue={issueInfo.extra_info.ExtraBugInfo!.level}
                                            itemList={bugLvSelectItems} onChange={async (value) => {
                                                return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, issueInfo.issue_id, {
                                                    ExtraBugInfo: {
                                                        ...issueInfo.extra_info.ExtraBugInfo!,
                                                        level: value as number,
                                                    },
                                                });
                                            }} showEditIcon={true} />
                                    </Form.Item>
                                    <Form.Item label="优先级">
                                        <EditSelect
                                            allowClear={false}
                                            editable={(!projectStore.isClosed) && issueInfo.user_issue_perm.can_update}
                                            curValue={issueInfo.extra_info.ExtraBugInfo!.priority}
                                            itemList={bugPrioritySelectItems}
                                            onChange={async (value) => {
                                                return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, issueInfo.issue_id, {
                                                    ExtraBugInfo: {
                                                        ...issueInfo.extra_info.ExtraBugInfo!,
                                                        priority: value as number,
                                                    }
                                                });

                                            }} showEditIcon={true} />
                                    </Form.Item>
                                    <Form.Item label="软件版本">
                                        <EditText editable={(!projectStore.isClosed) && issueInfo.user_issue_perm.can_update}
                                            content={issueInfo.extra_info.ExtraBugInfo?.software_version ?? ""}
                                            onChange={async (value: string) => {
                                                return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, issueInfo.issue_id, {
                                                    ExtraBugInfo: {
                                                        ...issueInfo.extra_info.ExtraBugInfo!,
                                                        software_version: value,
                                                    },
                                                });
                                            }} showEditIcon={true} />
                                    </Form.Item>
                                </>
                            )}
                            {projectStore.projectModal.issueType == ISSUE_TYPE_TASK && (
                                <Form.Item label="优先级">
                                    <EditSelect
                                        allowClear={false}
                                        editable={(!projectStore.isClosed) && issueInfo.user_issue_perm.can_update}
                                        curValue={issueInfo.extra_info.ExtraTaskInfo!.priority}
                                        itemList={taskPrioritySelectItems}
                                        onChange={async (value) => {
                                            return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, issueInfo.issue_id, {
                                                ExtraTaskInfo: {
                                                    ...issueInfo.extra_info.ExtraTaskInfo!,
                                                    priority: value as number,
                                                }
                                            });

                                        }} showEditIcon={true} />
                                </Form.Item>
                            )}
                            <Form.Item label="处理人">
                                <EditSelect
                                    allowClear={false}
                                    editable={(!projectStore.isClosed) && issueInfo.user_issue_perm.can_assign_exec_user}
                                    curValue={issueInfo.exec_user_id}
                                    itemList={memberSelectItems}
                                    onChange={async (value) => {
                                        const res = await updateExecUser(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value as string);
                                        if (res) {
                                            await loadIssuelInfo();
                                        }
                                        return res;
                                    }} showEditIcon={true} />
                            </Form.Item>
                            <Form.Item label="验收人">
                                <EditSelect
                                    allowClear={false}
                                    editable={(!projectStore.isClosed) && issueInfo.user_issue_perm.can_assign_check_user}
                                    curValue={issueInfo.check_user_id}
                                    itemList={memberSelectItems}
                                    onChange={async (value) => {
                                        const res = await updateCheckUser(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value as string);
                                        if (res) {
                                            await loadIssuelInfo();
                                        }
                                        return res;
                                    }} showEditIcon={true} />
                            </Form.Item>
                            <Form.Item label="截止时间">
                                <EditDate
                                    editable={(!projectStore.isClosed) && projectStore.isAdmin && issueInfo.user_issue_perm.can_update}
                                    hasTimeStamp={issueInfo.has_dead_line_time}
                                    timeStamp={issueInfo.dead_line_time}
                                    onChange={async (value) => {
                                        if (value === undefined) {
                                            const res = await cancelDeadLineTime(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id);
                                            if (res) {
                                                await loadIssuelInfo();
                                            }
                                            return res;
                                        }
                                        const res = await updateDeadLineTime(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value);
                                        if (res) {
                                            await loadIssuelInfo();
                                        }
                                        return res;
                                    }} showEditIcon={true} />
                            </Form.Item>
                            <Form.Item label="预估开始时间">
                                <EditDate
                                    editable={(!projectStore.isClosed) && issueInfo.exec_user_id == userStore.userInfo.userId && issueInfo.state == ISSUE_STATE_PROCESS}
                                    hasTimeStamp={issueInfo.has_start_time}
                                    timeStamp={issueInfo.start_time}
                                    onChange={async (value) => {
                                        if (value === undefined) {
                                            const res = await cancelStartTime(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id);
                                            if (res) {
                                                await loadIssuelInfo();
                                            }
                                            return res;
                                        }
                                        const res = await updateStartTime(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value);
                                        if (res) {
                                            await loadIssuelInfo();
                                        }
                                        return res;
                                    }} showEditIcon={true} />
                            </Form.Item>
                            <Form.Item label="预估完成时间">
                                <EditDate
                                    editable={(!projectStore.isClosed) && (issueInfo.exec_user_id == userStore.userInfo.userId) && (issueInfo.state == ISSUE_STATE_PROCESS)}
                                    hasTimeStamp={issueInfo.has_end_time}
                                    timeStamp={issueInfo.end_time}
                                    onChange={async (value) => {
                                        if (value === undefined) {
                                            const res = await cancelEndTime(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id);
                                            if (res) {
                                                await loadIssuelInfo();
                                            }
                                            return res;
                                        }
                                        const res = await updateEndTime(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value);
                                        if (res) {
                                            await loadIssuelInfo();
                                        }
                                        return res;
                                    }} showEditIcon={true} />
                            </Form.Item>
                            <Form.Item label="预估工时">
                                <EditSelect
                                    allowClear={true}
                                    editable={(!projectStore.isClosed) && (issueInfo.exec_user_id == userStore.userInfo.userId) && (issueInfo.state == ISSUE_STATE_PROCESS)}
                                    curValue={issueInfo.has_estimate_minutes ? issueInfo.estimate_minutes : ""}
                                    itemList={hourSelectItems}
                                    onChange={async (value) => {
                                        if (value === undefined) {
                                            const res = await cancelEstimateMinutes(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id);
                                            if (res) {
                                                await loadIssuelInfo();
                                            }
                                            return res;
                                        }
                                        const res = await updateEstimateMinutes(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value as number);
                                        if (res) {
                                            await loadIssuelInfo();
                                        }
                                        return res;
                                    }} showEditIcon={true} />
                            </Form.Item>
                            <Form.Item label="剩余工时">
                                <EditSelect
                                    allowClear={true}
                                    editable={(!projectStore.isClosed) && (issueInfo.exec_user_id == userStore.userInfo.userId) && (issueInfo.state == ISSUE_STATE_PROCESS)}
                                    curValue={issueInfo.has_remain_minutes ? issueInfo.remain_minutes : ""}
                                    itemList={hourSelectItems}
                                    onChange={async (value) => {
                                        if (value === undefined) {
                                            const res = await cancelRemainMinutes(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id)
                                            if (res) {
                                                await loadIssuelInfo();
                                            }
                                            return res;
                                        }
                                        const res = await updateRemainMinutes(userStore.sessionId, issueInfo.project_id, issueInfo.issue_id, value as number);
                                        if (res) {
                                            await loadIssuelInfo();
                                        }
                                        return res;
                                    }} showEditIcon={true} />
                            </Form.Item>
                        </Form>
                        {showStageModal && (
                            <StageModel
                                issue={issueInfo}
                                onCancel={() => setShowStageModal(false)}
                                onOk={() => {
                                    loadIssuelInfo().then(() => {
                                        setShowStageModal(false);
                                    });
                                }}
                            />)}
                    </Card>
                </>
            )}
        </div>
    )
};

export default observer(DetailPanel);