//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { DatePicker, Descriptions, Divider, Form, Input, Modal, Select, message } from "antd";
import { BUG_LEVEL_MINOR, BUG_PRIORITY_LOW, ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, TASK_PRIORITY_LOW, assign_check_user, assign_exec_user, create as create_issue, link_sprit, set_dead_line_time } from "@/api/project_issue";
import { change_file_fs, change_file_owner, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_ISSUE, FILE_OWNER_TYPE_PROJECT } from "@/api/fs";
import { Moment } from "moment";
import { EditSelectItem } from "@/components/EditCell/EditSelect";
import { bugLvSelectItems, bugPrioritySelectItems, taskPrioritySelectItems } from "./components/constant";
import { getMemberSelectItems } from "./components/utils";
import { request } from "@/utils/request";
import { ISSUE_TAB_LIST_TYPE, LinkSpritInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";

interface RenderSelectProps {
    itemList: EditSelectItem[];
    value: string | number;
    allowClear: boolean;
    onChange: (value: string | number | undefined) => boolean;
}

const RenderSelect: React.FC<RenderSelectProps> = (props) => {
    const [selValue, setSelValue] = useState(props.value);

    return (
        <Select
            allowClear={props.allowClear}
            value={selValue}
            showArrow={true}
            style={{ width: "120px" }}
            onChange={(value) => {
                if (props.onChange(value)) {
                    setSelValue(value);
                }
            }}>
            {props.itemList.map(item => (
                <Select.Option key={item.value} value={item.value}>
                    <span style={{ color: item.color, display: "inline-block", width: "80px", textAlign: "center" }}>{item.label}</span>
                </Select.Option>
            ))}
        </Select>
    );
};

const CreateModal = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores("memberStore");
    const linkAuxStore = useStores("linkAuxStore");

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.issue_fs_id ?? '',
        ownerType: FILE_OWNER_TYPE_PROJECT,
        ownerId: projectStore.curProjectId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
    });

    const [title, setTitle] = useState("");
    const [bugLv, setBugLv] = useState(BUG_LEVEL_MINOR);
    const [bugPriority, setBugPriority] = useState(BUG_PRIORITY_LOW);
    const [softVersion, setSoftVersion] = useState("");
    const [taskPriority, setTaskPriority] = useState(TASK_PRIORITY_LOW);
    const [execUserId, setExecUserId] = useState("");
    const [checkUserId, setCheckUserId] = useState("");
    const [deadLineTime, setDeadLineTime] = useState<Moment | null>(null);

    const memberSelectItems = getMemberSelectItems(memberStore.memberList.map(item => item.member));

    const createIssue = async () => {
        if (title == "") {
            message.error("标题不能为空");
            return;
        }
        if (editorRef.current == null) {
            return;
        }
        const content = editorRef.current.getContent();;
        //更新文件存储
        await change_file_fs(
            content,
            projectStore.curProject?.issue_fs_id ?? '',
            userStore.sessionId,
            FILE_OWNER_TYPE_PROJECT,
            projectStore.curProjectId,
        );
        const createRes = await request(create_issue({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_type: projectStore.projectModal.createIssueType,
            basic_info: {
                title: title,
                content: JSON.stringify(content),
                tag_id_list: [],
            },
            extra_info: {
                ExtraTaskInfo: projectStore.projectModal.createIssueType == ISSUE_TYPE_TASK ? {
                    priority: taskPriority,
                } : undefined,
                ExtraBugInfo: projectStore.projectModal.createIssueType == ISSUE_TYPE_BUG ? {
                    software_version: softVersion,
                    level: bugLv,
                    priority: bugPriority,
                } : undefined,
            }
        }));
        if (!createRes) {
            return;
        }
        if (deadLineTime != null) {
            await request(set_dead_line_time({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                issue_id: createRes.issue_id,
                dead_line_time: deadLineTime.startOf("day").valueOf(),
            }));
        }
        //变更文件Owner
        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_ISSUE, createRes.issue_id);
        if (execUserId != "") {
            await request(assign_exec_user(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, execUserId));
        }
        if (checkUserId != "") {
            await request(assign_check_user(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, checkUserId));
        }
        message.info(`创建${projectStore.projectModal.createIssueType == ISSUE_TYPE_TASK ? "任务" : "缺陷"}成功`);
        if (projectStore.projectModal.createIssueLinkSpritId != "" && projectStore.isAdmin) {
            //关联工作计划(工作计划)
            await request(link_sprit(userStore.sessionId, projectStore.curProjectId, createRes.issue_id, projectStore.projectModal.createIssueLinkSpritId));
            linkAuxStore.goToLink(new LinkSpritInfo("", projectStore.curProjectId, projectStore.projectModal.createIssueLinkSpritId), history);
        } else {
            if (projectStore.projectModal.createIssueType == ISSUE_TYPE_TASK) {
                linkAuxStore.goToTaskList({
                    stateList: [],
                    execUserIdList: [],
                    checkUserIdList: [],
                    tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL,
                }, history);
            } else {
                linkAuxStore.goToBugList({
                    stateList: [],
                    execUserIdList: [],
                    checkUserIdList: [],
                    tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL,
                }, history);
            }
        }
        projectStore.projectModal.setCreateIssue(false, 0, "");
    }

    return (
        <Modal open title={projectStore.projectModal.createIssueType == ISSUE_TYPE_TASK ? "创建任务" : "创建缺陷"}
            okText="创建" okButtonProps={{ disabled: title.trim() == "" }} width={800}
            bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.setCreateIssue(false, 0, "");
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createIssue();
            }}
        >
            <Form labelCol={{ span: 2 }}>
                <Form.Item label="标题">
                    <Input
                        allowClear
                        bordered={false}
                        placeholder={`请输入标题`}
                        style={{ marginBottom: '12px', borderBottom: "1px solid #e4e4e8" }}
                        onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setTitle(e.target.value);
                        }}
                    />
                </Form.Item>
                <Form.Item label="内容">
                    <div className="_chatContext">
                        {editor}
                    </div>
                </Form.Item>
            </Form>
            <Divider orientation="left">其他配置</Divider>
            <Descriptions bordered>
                {projectStore.projectModal.createIssueType == ISSUE_TYPE_BUG && (
                    <>
                        <Descriptions.Item label="级别">
                            <RenderSelect itemList={bugLvSelectItems} value={BUG_LEVEL_MINOR}
                                allowClear={false}
                                onChange={
                                    (value) => {
                                        setBugLv(value as number);
                                        return true;
                                    }} />
                        </Descriptions.Item>
                        <Descriptions.Item label="优先级">
                            <RenderSelect itemList={bugPrioritySelectItems} value={BUG_PRIORITY_LOW}
                                allowClear={false}
                                onChange={
                                    (value) => {
                                        setBugPriority(value as number);
                                        return true;
                                    }} />
                        </Descriptions.Item>
                        <Descriptions.Item label="软件版本">
                            <Input style={{ width: "120px" }} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSoftVersion(e.target.value);
                            }} />
                        </Descriptions.Item>
                    </>
                )}
                {projectStore.projectModal.createIssueType == ISSUE_TYPE_TASK && (
                    <Descriptions.Item label="优先级">
                        <RenderSelect itemList={taskPrioritySelectItems} value={TASK_PRIORITY_LOW}
                            allowClear={false}
                            onChange={(value) => {
                                setTaskPriority(value as number);
                                return true;
                            }} />
                    </Descriptions.Item>
                )}
                <Descriptions.Item label="处理人">
                    <RenderSelect itemList={memberSelectItems} value=""
                        allowClear
                        onChange={(value) => {
                            let v = value;
                            if (v === undefined) {
                                v = "";
                            }
                            if (checkUserId != "" && checkUserId == v) {
                                message.error("处理人和验收人不能是同一人");
                                return false;
                            }
                            setExecUserId(v as string);
                            return true;
                        }} />
                </Descriptions.Item>
                <Descriptions.Item label="验收人">
                    <RenderSelect itemList={memberSelectItems} value=""
                        allowClear
                        onChange={(value) => {
                            let v = value;
                            if (v === undefined) {
                                v = "";
                            }
                            if (execUserId != "" && execUserId == v) {
                                message.error("验收人和处理人不能是同一人");
                                return false;
                            }
                            setCheckUserId(v as string);
                            return true;
                        }} />
                </Descriptions.Item>
                <Descriptions.Item label="截止时间">
                    <DatePicker style={{ width: "120px" }} allowClear onChange={value => setDeadLineTime(value)} popupStyle={{ zIndex: 10000 }} />
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default observer(CreateModal);