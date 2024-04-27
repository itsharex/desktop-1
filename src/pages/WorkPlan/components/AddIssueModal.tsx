//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { observer } from 'mobx-react';
import { Form, Input, Modal, Select, Space, message } from "antd";
import type { BUG_LEVEL, BUG_PRIORITY, ISSUE_TYPE, TASK_PRIORITY } from "@/api/project_issue";
import {
    ISSUE_TYPE_TASK, ISSUE_TYPE_BUG, create as create_issue, TASK_PRIORITY_LOW, BUG_LEVEL_MINOR, BUG_PRIORITY_LOW,
    assign_exec_user, assign_check_user, link_sprit,
    TASK_PRIORITY_MIDDLE,
    TASK_PRIORITY_HIGH,
    BUG_PRIORITY_NORMAL,
    BUG_PRIORITY_HIGH,
    BUG_PRIORITY_URGENT,
    BUG_PRIORITY_IMMEDIATE,
    BUG_LEVEL_MAJOR,
    BUG_LEVEL_CRITICAL,
    BUG_LEVEL_BLOCKER
} from "@/api/project_issue";
import { useStores } from "@/hooks";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { request } from "@/utils/request";


export interface AddIssueModalProps {
    issueType?: ISSUE_TYPE;
    onClose: () => void;
}

const AddIssueModal = (props: AddIssueModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');
    const entryStore = useStores('entryStore');


    const [issueType, setIssueType] = useState<ISSUE_TYPE>(props.issueType ?? ISSUE_TYPE_TASK);
    const [title, setTitle] = useState("");
    const [execUserId, setExecUserId] = useState("");
    const [checkUserId, setCheckUserId] = useState("");
    const [taskPriority, setTaskPriority] = useState<TASK_PRIORITY>(TASK_PRIORITY_LOW);
    const [bugPriority, setBugPriority] = useState<BUG_PRIORITY>(BUG_PRIORITY_LOW);
    const [bugLevel, setBugLevel] = useState<BUG_LEVEL>(BUG_LEVEL_MINOR);

    const addIssue = async () => {
        const createRes = await request(create_issue({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_type: issueType,
            basic_info: {
                title: title,
                content: JSON.stringify({ type: "doc" }),
                tag_id_list: [],
            },
            extra_info: {
                ExtraTaskInfo: issueType == ISSUE_TYPE_TASK ? {
                    priority: taskPriority,
                } : undefined,
                ExtraBugInfo: issueType == ISSUE_TYPE_TASK ? undefined : {
                    software_version: "",
                    level: bugLevel,
                    priority: bugPriority,
                },
            }
        }));
        if (execUserId != "") {
            await request(assign_exec_user(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, execUserId));
        }
        if (checkUserId != "") {
            await request(assign_check_user(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, checkUserId));
        }
        await request(link_sprit(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, entryStore.curEntry?.entry_id ?? ""));
        props.onClose();
        message.info(`增加${issueType == ISSUE_TYPE_TASK ? "任务" : "缺陷"}成功`);
    };

    return (
        <Modal open title="增加任务/缺陷"
            okText="增加" okButtonProps={{ disabled: title == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addIssue();
            }}>
            <Form labelCol={{ span: 3 }}>
                <Form.Item label="类型">
                    <Select value={issueType} onChange={value => setIssueType(value)} disabled={props.issueType != null}>
                        <Select.Option value={ISSUE_TYPE_TASK}>任务</Select.Option>
                        <Select.Option value={ISSUE_TYPE_BUG}>缺陷</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="执行人">
                    <Select value={execUserId} onChange={value => setExecUserId(value)}>
                        <Select.Option value="">未指定</Select.Option>
                        {memberStore.memberList.filter(item => item.member.member_user_id != checkUserId).map(item => (
                            <Select.Option key={item.member.member_user_id} value={item.member.member_user_id}>
                                <Space>
                                    <UserPhoto logoUri={item.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                    {item.member.display_name}
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="检查人">
                    <Select value={checkUserId} onChange={value => setCheckUserId(value)}>
                        <Select.Option value="">未指定</Select.Option>
                        {memberStore.memberList.filter(item => item.member.member_user_id != execUserId).map(item => (
                            <Select.Option key={item.member.member_user_id} value={item.member.member_user_id}>
                                <Space>
                                    <UserPhoto logoUri={item.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                    {item.member.display_name}
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                {issueType == ISSUE_TYPE_TASK && (
                    <Form.Item label="优先级">
                        <Select value={taskPriority} onChange={value => setTaskPriority(value)}>
                            <Select.Option value={TASK_PRIORITY_LOW}>低优先级</Select.Option>
                            <Select.Option value={TASK_PRIORITY_MIDDLE}>正常处理</Select.Option>
                            <Select.Option value={TASK_PRIORITY_HIGH}>高度重视</Select.Option>
                        </Select>
                    </Form.Item>
                )}
                {issueType == ISSUE_TYPE_BUG && (
                    <>
                        <Form.Item label="缺陷级别">
                            <Select value={bugLevel} onChange={value => setBugLevel(value)}>
                                <Select.Option value={BUG_LEVEL_MINOR}>提示</Select.Option>
                                <Select.Option value={BUG_LEVEL_MAJOR}>一般</Select.Option>
                                <Select.Option value={BUG_LEVEL_CRITICAL}>严重</Select.Option>
                                <Select.Option value={BUG_LEVEL_BLOCKER}>致命</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="优先级">
                            <Select value={bugPriority} onChange={value => setBugPriority(value)}>
                                <Select.Option value={BUG_PRIORITY_LOW}>低优先级</Select.Option>
                                <Select.Option value={BUG_PRIORITY_NORMAL}>正常处理</Select.Option>
                                <Select.Option value={BUG_PRIORITY_HIGH}>高度重视</Select.Option>
                                <Select.Option value={BUG_PRIORITY_URGENT}>急需解决</Select.Option>
                                <Select.Option value={BUG_PRIORITY_IMMEDIATE}>马上解决</Select.Option>
                            </Select>
                        </Form.Item>

                    </>
                )}
            </Form>
        </Modal>
    );
};
export default observer(AddIssueModal);
