//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useRef, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { LinkBugInfo, LinkTaskInfo } from "@/stores/linkAux";
import type { IssueInfo } from "@/api/project_issue";
import { ISSUE_STATE_CHECK, ISSUE_STATE_CLOSE, ISSUE_STATE_PLAN, ISSUE_STATE_PROCESS, ISSUE_TYPE_TASK } from "@/api/project_issue";
import { issueState, ISSUE_STATE_COLOR_ENUM } from "@/utils/constant";
import type { Task as GanttTask } from 'gantt-task-react';
import { Gantt, ViewMode, } from 'gantt-task-react';
import "gantt-task-react/dist/index.css";
import { Card, Descriptions, Space } from "antd";
import { useSize } from "ahooks";
import { WarningOutlined } from "@ant-design/icons";
import type { LocalIssueStore } from "@/stores/local";
import type { SpritStatus } from "../SpritDetail";

type ExtGanttTask = GanttTask & {
    issue: IssueInfo;
};

const getColor = (v: number) => {
    switch (v) {
        case ISSUE_STATE_PLAN:
            return ISSUE_STATE_COLOR_ENUM.规划中颜色;
        case ISSUE_STATE_PROCESS:
            return ISSUE_STATE_COLOR_ENUM.处理颜色;
        case ISSUE_STATE_CHECK:
            return ISSUE_STATE_COLOR_ENUM.验收颜色;
        case ISSUE_STATE_CLOSE:
            return ISSUE_STATE_COLOR_ENUM.关闭颜色;
        default:
            return ISSUE_STATE_COLOR_ENUM.规划中颜色;
    }
};

const renderState = (val: number) => {
    const v = issueState[val];
    return (
        <div
            style={{
                background: `rgb(${getColor(val)} / 20%)`,
                width: '50px',
                margin: '0 auto',
                borderRadius: '50px',
                textAlign: 'center',
                color: `rgb(${getColor(val)})`,
            }}
        >
            {v?.label}
        </div>
    );
};

const TooltipContent: React.FC<{
    task: GanttTask;
    fontSize: string;
    fontFamily: string;
}> = observer((props) => {
    return (


        <div style={{ backgroundColor: "white", padding: "10px 10px", border: "1px solid #e4e4e8" }}>
            <Descriptions title={`${(props.task as ExtGanttTask).issue.issue_type == ISSUE_TYPE_TASK ? "任务" : "缺陷"}:${(props.task as ExtGanttTask).issue.basic_info.title}`} bordered={true}>
                <Descriptions.Item label="阶段">{renderState((props.task as ExtGanttTask).issue.state)}</Descriptions.Item>
                <Descriptions.Item label="预估时间">
                    <span style={{ color: (props.task as ExtGanttTask).issue.has_estimate_minutes ? undefined : "red" }}>
                        {(props.task as ExtGanttTask).issue.has_estimate_minutes ? `${((props.task as ExtGanttTask).issue.estimate_minutes / 60).toFixed(1)}小时` : "未设置"}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="剩余时间">
                    <span style={{ color: (props.task as ExtGanttTask).issue.has_remain_minutes ? undefined : "red" }}>
                        {(props.task as ExtGanttTask).issue.has_remain_minutes ? `${((props.task as ExtGanttTask).issue.remain_minutes / 60).toFixed(1)}小时` : "未设置"}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="预估开始时间">
                    <span style={{ color: (props.task as ExtGanttTask).issue.has_start_time ? undefined : "red" }}>
                        {(props.task as ExtGanttTask).issue.has_start_time ? moment((props.task as ExtGanttTask).issue.start_time).format("YYYY-MM-DD") : "未设置"}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="预估结束时间">
                    <span style={{ color: (props.task as ExtGanttTask).issue.has_end_time ? undefined : "red" }}>
                        {(props.task as ExtGanttTask).issue.has_end_time ? moment((props.task as ExtGanttTask).issue.end_time).format("YYYY-MM-DD") : "未设置"}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="截止时间">
                    {(props.task as ExtGanttTask).issue.has_dead_line_time == true && moment((props.task as ExtGanttTask).issue.dead_line_time).format("YYYY-MM-DD")}
                </Descriptions.Item>
                <Descriptions.Item label="创建者">{(props.task as ExtGanttTask).issue.create_display_name}</Descriptions.Item>
                <Descriptions.Item label="执行者">
                    <span style={{ color: (props.task as ExtGanttTask).issue.exec_user_id == "" ? "red" : undefined }}>
                        {(props.task as ExtGanttTask).issue.exec_user_id == "" ? "未设置" : (props.task as ExtGanttTask).issue.exec_display_name}
                    </span>
                </Descriptions.Item>
                <Descriptions.Item label="检查者">{(props.task as ExtGanttTask).issue.check_display_name}</Descriptions.Item>
            </Descriptions>

        </div>


    );
});

interface GanttPanelProps {
    spritName: string;
    startTime: number;
    endTime: number;
    taskStore: LocalIssueStore;
    bugStore: LocalIssueStore;
    spritStatus: SpritStatus;
}

const GanttPanel: React.FC<GanttPanelProps> = (props) => {
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');
    const entryStore = useStores('entryStore');

    const history = useHistory();

    const wrapRef = useRef<HTMLDivElement>(null);
    const wrapRefSize = useSize(wrapRef);

    const [taskList, setTaskList] = useState<GanttTask[]>([]);

    const calcName = (issue: IssueInfo): string => {
        const parts: string[] = [`状态:${issueState[issue.state].label}`];
        if (issue.exec_display_name != "") {
            parts.push("执行者:" + issue.exec_display_name);
        }
        if (issue.check_display_name != "") {
            parts.push("检查者:" + issue.check_display_name)
        }
        return `${issue.issue_type == ISSUE_TYPE_TASK ? "任务" : "缺陷"}:${issue.basic_info.title}(${parts.join(",")})`;
    }

    const hasMissData = () => {
        const status = props.spritStatus;
        return (status.missExecBugCount + status.missExecTaskCount + status.missProgressBugCount + status.missProgressTaskCount + status.missTimeBugCount + status.missTimeTaskCount) > 0;
    }

    useEffect(() => {
        const tmpList: ExtGanttTask[] = [];
        let totalEstimate = 0;
        let totalRemain = 0;
        for (const task of props.taskStore.itemList) {
            const startTime = task.has_start_time ? task.start_time : props.startTime;
            const endTime = task.has_end_time ? task.end_time : props.endTime;
            let progress = 0;
            if (task.has_remain_minutes && task.has_estimate_minutes) {
                progress = Math.floor((1 - task.remain_minutes / task.estimate_minutes) * 100);
            }
            tmpList.push({
                id: task.issue_id,
                type: "task",
                name: calcName(task),
                start: moment(startTime).startOf("day").toDate(),
                end: moment(endTime).endOf("day").toDate(),
                progress: progress,
                styles: {
                    backgroundColor: (task.has_start_time && task.has_end_time && task.has_remain_minutes && task.has_estimate_minutes) ? "forestgreen" : "crimson",
                    backgroundSelectedColor: "gold",
                },
                issue: task,
            });
            if (task.has_estimate_minutes) {
                totalEstimate += task.estimate_minutes;
            }
            if (task.has_remain_minutes) {
                totalRemain += task.remain_minutes;
            }
        }
        for (const bug of props.bugStore.itemList) {
            const startTime = bug.has_start_time ? bug.start_time : props.startTime;
            const endTime = bug.has_end_time ? bug.end_time : props.endTime;
            let progress = 0;
            if (bug.has_remain_minutes && bug.has_estimate_minutes) {
                progress = Math.floor((1 - bug.remain_minutes / bug.estimate_minutes) * 100);
            }
            tmpList.push({
                id: bug.issue_id,
                type: "task",
                name: calcName(bug),
                start: moment(startTime).startOf("day").toDate(),
                end: moment(endTime).endOf("day").toDate(),
                progress: progress,
                styles: {
                    backgroundColor: (bug.has_start_time && bug.has_end_time && bug.has_remain_minutes && bug.has_estimate_minutes) ? "forestgreen" : "crimson",
                    backgroundSelectedColor: "gold",
                },
                issue: bug,
            });
            if (bug.has_estimate_minutes) {
                totalEstimate += bug.estimate_minutes;
            }
            if (bug.has_remain_minutes) {
                totalRemain += bug.remain_minutes;
            }
        }
        let progress = 0;
        if (totalEstimate > 0) {
            progress = Math.floor((1 - totalRemain / totalEstimate) * 100);
        }
        const spritTask: GanttTask = {
            id: entryStore.curEntry?.entry_id ?? "",
            type: "project",
            name: `${props.spritName}(${moment(props.startTime).format("YYYY-MM-DD")}至${moment(props.endTime).format("YYYY-MM-DD")})`,
            start: moment(props.startTime).startOf("day").toDate(),
            end: moment(props.endTime).endOf("day").toDate(),
            progress: progress,
        };
        setTaskList([spritTask, ...tmpList]);
    }, [props.taskStore.itemList, props.bugStore.itemList]);

    return (
        <Card bordered={false} bodyStyle={{ padding: "0px 0px" }}
            title={(
                <>
                    {hasMissData() && (
                        <Space style={{ marginLeft: "10px", color: "red" }}>
                            <WarningOutlined />
                            甘特图存在偏差。
                            {props.spritStatus.missTimeTaskCount > 0 && `有${props.spritStatus.missTimeTaskCount}个任务未指定开始结束时间。`}
                            {props.spritStatus.missTimeBugCount > 0 && `有${props.spritStatus.missTimeBugCount}个缺陷未指定开始结束时间。`}
                            {props.spritStatus.missExecTaskCount > 0 && `有${props.spritStatus.missExecTaskCount}个任务未指定执行人。`}
                            {props.spritStatus.missExecBugCount > 0 && `有${props.spritStatus.missExecBugCount}个缺陷未指定执行人。`}
                            {props.spritStatus.missProgressTaskCount > 0 && `有${props.spritStatus.missProgressTaskCount}个任务未指定进度。`}
                            {props.spritStatus.missProgressBugCount > 0 && `有${props.spritStatus.missProgressBugCount}个缺陷未指定进度。`}
                        </Space>
                    )}
                </>
            )}
            extra={
                <Space style={{ fontSize: "14px", fontWeight: 600 }}>
                    <div>图例说明:</div>
                    <div style={{ backgroundColor: "forestgreen", padding: "4px 8px", borderRadius: "6px" }}>参数正常</div>
                    <div style={{ backgroundColor: "crimson", padding: "4px 8px", borderRadius: "6px" }}>参数异常</div>
                </Space>
            }>
            <div style={{ height: "calc(100vh - 190px)", overflowY: "hidden" }} ref={wrapRef}>
                {taskList.length > 0 && wrapRefSize != undefined && (
                    <Gantt tasks={taskList} viewMode={ViewMode.Day} locale="chi" listCellWidth="" columnWidth={100} TooltipContent={TooltipContent}
                        rowHeight={36} rtl={false} preStepsCount={2} ganttHeight={wrapRefSize.height - 60}
                        onClick={task => {
                            if (props.taskStore.itemList.map(item => item.issue_id).includes(task.id)) {
                                linkAuxStore.goToLink(new LinkTaskInfo("", projectStore.curProjectId, task.id), history);
                            } else if (props.bugStore.itemList.map(item => item.issue_id).includes(task.id)) {
                                linkAuxStore.goToLink(new LinkBugInfo("", projectStore.curProjectId, task.id), history);
                            }
                        }} />
                )}
            </div>
        </Card>
    );
}

export default observer(GanttPanel);