import React, { useState } from "react";
import { Button, Checkbox, Divider, Form, Input, Modal, message } from "antd";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { FolderOpenOutlined } from "@ant-design/icons";
import { save as save_dialog } from '@tauri-apps/api/dialog';
import { Workbook } from "exceljs";
import { writeBinaryFile, exists, removeFile } from '@tauri-apps/api/fs';
import { BUG_LEVEL_BLOCKER, BUG_LEVEL_CRITICAL, BUG_LEVEL_MAJOR, BUG_LEVEL_MINOR, BUG_PRIORITY_HIGH, BUG_PRIORITY_IMMEDIATE, BUG_PRIORITY_LOW, BUG_PRIORITY_NORMAL, BUG_PRIORITY_URGENT, ISSUE_STATE_CHECK, ISSUE_STATE_CLOSE, ISSUE_STATE_PLAN, ISSUE_STATE_PROCESS, PROCESS_STAGE_DOING, PROCESS_STAGE_DONE, PROCESS_STAGE_TODO, TASK_PRIORITY_HIGH, TASK_PRIORITY_LOW, TASK_PRIORITY_MIDDLE, type IssueInfo } from "@/api/project_issue";
import { request } from "@/utils/request";
import { list_summary_item } from "@/api/project_sprit";
import type { LocalIssueStore, LocalTestcaseStore } from "@/stores/local";
import type { CaseInfo } from "@/api/project_testcase";

type IssueItem = {
    issueIndex: number;
    title: string;
    state: string;
    processStage: string;
    createDisplayName: string;
    execDisplayName: string;
    checkDisplayName: string;
    tagNames: string;
    subIssueDoneCount: number;
    subIssueTotalCount: number;
    startTime: string | Date;
    endTime: string | Date;
    deadLineTime: string | Date;
    estimateMinutes: string | number;
    remainMinutes: string | number;
    requirementTitle: string;
};

type TaskItem = IssueItem & {
    priority: string;
};

type BugItem = IssueItem & {
    softwareVersion: string;
    level: string;
    priority: string;
};


const IssueColumns = [
    { header: "ID", key: "issueIndex", width: 10 },
    { header: "标题", key: "title", width: 100 },
    { header: "状态", key: "state", width: 10 },
    { header: "处理阶段", key: "processStage", width: 14 },
    { header: "创建者", key: "createDisplayName", width: 14 },
    { header: "执行者", key: "execDisplayName", width: 14 },
    { header: "检查者", key: "checkDisplayName", width: 14 },
    { header: "标签", key: "tagNames", width: 20 },
    { header: "子任务完成数量", key: "subIssueDoneCount", width: 10 },
    { header: "子任务总数量", key: "subIssueTotalCount", width: 14 },
    { header: "开始时间", key: "startTime", width: 20 },
    { header: "结束时间", key: "endTime", width: 20 },
    { header: "截止时间", key: "deadLineTime", width: 20 },
    { header: "预估时间(分钟)", key: "estimateMinutes", width: 14 },
    { header: "剩余时间(分钟)", key: "remainMinutes", width: 14 },
    { header: "需求标题", key: "requirementTitle", width: 100 },
];

export interface ExportModalProps {
    taskStore: LocalIssueStore;
    bugStore: LocalIssueStore;
    testcaseStore: LocalTestcaseStore;
    onClose: () => void;
}

const ExportModal = (props: ExportModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const [exportTask, setExportTask] = useState(true);
    const [exportBug, setExportBug] = useState(true);
    const [exportTestcase, setExportTestcase] = useState(true);
    const [exportSummary, setExportSummary] = useState(true);
    const [localPath, setLocalPath] = useState("");

    const choicePath = async () => {
        const selected = await save_dialog({
            title: "选择导出文件",
            filters: [
                {
                    name: "xlsx文件",
                    extensions: ["xlsx"],
                }
            ],
        });
        if (selected == null) {
            return;
        }
        setLocalPath(selected);
    };

    const convertIssueItem = (issue: IssueInfo): IssueItem => {
        let state = "";
        switch (issue.state) {
            case ISSUE_STATE_PLAN:
                state = "规划中"
                break;
            case ISSUE_STATE_PROCESS:
                state = "处理中";
                break;
            case ISSUE_STATE_CHECK:
                state = "验证中";
                break;
            case ISSUE_STATE_CLOSE:
                state = "已完成";
                break;
        }
        let processStage = "";
        if (issue.state == ISSUE_STATE_PROCESS) {
            switch (issue.process_stage) {
                case PROCESS_STAGE_TODO:
                    processStage = "未开始";
                    break;
                case PROCESS_STAGE_DOING:
                    processStage = "执行中";
                    break;
                case PROCESS_STAGE_DONE:
                    processStage = "待检查";
                    break;
            }
        }
        return {
            issueIndex: issue.issue_index,
            title: issue.basic_info.title,
            state: state,
            processStage: processStage,
            createDisplayName: issue.create_display_name,
            execDisplayName: issue.exec_display_name,
            checkDisplayName: issue.check_display_name,
            tagNames: issue.tag_info_list.map(item => item.tag_name).join(","),
            subIssueDoneCount: issue.sub_issue_status.done_count,
            subIssueTotalCount: issue.sub_issue_status.total_count,
            startTime: issue.has_start_time ? new Date(issue.start_time) : "",
            endTime: issue.has_end_time ? new Date(issue.end_time) : "",
            deadLineTime: issue.has_dead_line_time ? new Date(issue.dead_line_time) : "",
            estimateMinutes: issue.has_estimate_minutes ? issue.estimate_minutes : "",
            remainMinutes: issue.has_remain_minutes ? issue.remain_minutes : "",
            requirementTitle: issue.requirement_title,
        };
    };

    const runExportBasic = (workbook: Workbook) => {
        if (entryStore.curEntry == null) {
            return;
        }
        const sheet = workbook.addWorksheet("基本信息");
        sheet.columns = [
            { key: "name", width: 20 },
            { key: "value", width: 20 },
        ];
        sheet.addRows([
            { name: "名称", value: entryStore.curEntry.entry_title },
            { name: "开始时间", value: new Date(entryStore.curEntry.extra_info.ExtraSpritInfo?.start_time ?? 0) },
            { name: "结束时间", value: new Date(entryStore.curEntry.extra_info.ExtraSpritInfo?.end_time ?? 0) },
            { name: "创建者", value: entryStore.curEntry.create_display_name },
            { name: "创建时间", value: new Date(entryStore.curEntry.create_time) },
        ]);
    };

    const runExportBug = (workbook: Workbook) => {
        const sheet = workbook.addWorksheet("缺陷列表");
        sheet.columns = [
            ...IssueColumns,
            { header: "优先级", key: "priority", width: 14 },
            { header: "软件版本", key: "softwareVersion", width: 14 },
            { header: "缺陷级别", key: "level", width: 14 },
        ];
        for (const issue of props.bugStore.itemList) {
            const item = convertIssueItem(issue);
            let priority = "";
            let level = "";
            if (issue.extra_info.ExtraBugInfo != undefined) {
                switch (issue.extra_info.ExtraBugInfo.priority) {
                    case BUG_PRIORITY_LOW:
                        priority = "低优先级";
                        break;
                    case BUG_PRIORITY_NORMAL:
                        priority = "正常处理";
                        break;
                    case BUG_PRIORITY_HIGH:
                        priority = "高度重视";
                        break;
                    case BUG_PRIORITY_URGENT:
                        priority = "急需解决";
                        break;
                    case BUG_PRIORITY_IMMEDIATE:
                        priority = "马上解决";
                        break;
                }
                switch (issue.extra_info.ExtraBugInfo.level) {
                    case BUG_LEVEL_MINOR:
                        level = "提示";
                        break;
                    case BUG_LEVEL_MAJOR:
                        level = "一般";
                        break;
                    case BUG_LEVEL_CRITICAL:
                        level = "严重";
                        break;
                    case BUG_LEVEL_BLOCKER:
                        level = "致命";
                        break;
                }
            }
            const row: BugItem = {
                ...item,
                priority: priority,
                softwareVersion: issue.extra_info.ExtraBugInfo?.software_version ?? "",
                level: level,
            };
            sheet.addRow(row);
        }
    };

    const runExportTask = (workbook: Workbook) => {
        const sheet = workbook.addWorksheet("任务列表");
        sheet.columns = [
            ...IssueColumns,
            { header: "优先级", key: "priority", width: 14 },
        ];
        for (const issue of props.taskStore.itemList) {
            const item = convertIssueItem(issue);
            let priority = "";
            if (issue.extra_info.ExtraTaskInfo != undefined) {
                switch (issue.extra_info.ExtraTaskInfo.priority) {
                    case TASK_PRIORITY_LOW:
                        priority = "低优先级";
                        break;
                    case TASK_PRIORITY_MIDDLE:
                        priority = "正常处理";
                        break;
                    case TASK_PRIORITY_HIGH:
                        priority = "高度重视";
                        break;
                }
            }
            const row: TaskItem = {
                ...item,
                priority: priority,
            };
            sheet.addRow(row);
        }
    };

    const runExportTestcase = (workbook: Workbook) => {
        const sheet = workbook.addWorksheet("测试用例");

        sheet.columns = [
            { header: "标题", key: "title", width: 100 },
            { header: "测试方式", key: "testMethod", width: 40 },
            { header: "测试结果", key: "resultCount", width: 14 },
            { header: "时间", key: "createTime", width: 20 },
        ];
        for (const item of props.testcaseStore.itemList) {
            const tmpList = [] as string[];
            if ((item.dataValue as CaseInfo).test_method.unit_test) {
                tmpList.push("单元测试");
            }
            if ((item.dataValue as CaseInfo).test_method.ci_test) {
                tmpList.push("集成测试");
            }
            if ((item.dataValue as CaseInfo).test_method.load_test) {
                tmpList.push("压力测试");
            }
            if ((item.dataValue as CaseInfo).test_method.manual_test) {
                tmpList.push("手动测试");
            }
            sheet.addRow({
                title: (item.dataValue as CaseInfo).title,
                testMethod: tmpList.join(","),
                resultCount: (item.dataValue as CaseInfo).result_count,
                createTime: new Date((item.dataValue as CaseInfo).create_time),
            });
        }
    };

    const runExportSummary = async (workbook: Workbook) => {
        const res = await request(list_summary_item({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            sprit_id: entryStore.curEntry?.entry_id ?? "",
            filter_by_tag_id: false,
            tag_id: "",
        }));

        const sheet = workbook.addWorksheet("工作总结");
        sheet.columns = [
            { header: "用户", key: "createDisplayName", width: 14 },
            { header: "内容", key: "content", width: 100 },
            { header: "时间", key: "createTime", width: 20 },
            { header: "标签", key: "tagName", width: 14 },
        ];

        for (const summary of res.item_list) {
            sheet.addRow({
                createDisplayName: summary.create_display_name,
                content: summary.content,
                createTime: new Date(summary.create_time),
                tagName: summary.tag_info.tag_name,
            });
        }
    };

    const runExport = async () => {
        const workbook = new Workbook();
        workbook.creator = userStore.userInfo.displayName;
        runExportBasic(workbook);
        if (exportTask) {
            runExportTask(workbook);
        }
        if (exportBug) {
            runExportBug(workbook);
        }
        if (exportTestcase) {
            await runExportTestcase(workbook);
        }
        if (exportSummary) {
            await runExportSummary(workbook);
        }
        const buf = await workbook.xlsx.writeBuffer();
        const fileExist = await exists(localPath);
        if (fileExist) {
            await removeFile(localPath);
        }
        await writeBinaryFile(localPath, buf);
        message.info("导出成功");
        props.onClose();
    };

    return (
        <Modal open title="导出工作计划"
            okText="导出" okButtonProps={{ disabled: localPath.trim() == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                runExport();
            }}>
            <Form>
                <Form.Item label="导出文件">
                    <Input value={localPath} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setLocalPath(e.target.value);
                    }} addonAfter={<Button type="link" style={{ height: 20 }} icon={<FolderOpenOutlined />} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        choicePath();
                    }} />} />
                </Form.Item>
            </Form>
            <Divider orientation="left">导出信息</Divider>
            <Form>
                <Form.Item label="基本信息">
                    <Checkbox checked disabled />
                </Form.Item>
                <Form.Item label="任务列表">
                    <Checkbox checked={exportTask} onChange={e => {
                        e.stopPropagation();
                        setExportTask(e.target.checked);
                    }} />
                </Form.Item>
                <Form.Item label="缺陷列表">
                    <Checkbox checked={exportBug} onChange={e => {
                        e.stopPropagation();
                        setExportBug(e.target.checked);
                    }} />
                </Form.Item>
                <Form.Item label="测试用例">
                    <Checkbox checked={exportTestcase} onChange={e => {
                        e.stopPropagation();
                        setExportTestcase(e.target.checked);
                    }} />
                </Form.Item>
                <Form.Item label="工作总结">
                    <Checkbox checked={exportSummary} onChange={e => {
                        e.stopPropagation();
                        setExportSummary(e.target.checked);
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default observer(ExportModal);