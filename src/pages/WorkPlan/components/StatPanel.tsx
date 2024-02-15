import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { ColumnsType } from 'antd/lib/table';
import { useStores } from "@/hooks";
import { ISSUE_STATE_CHECK, ISSUE_STATE_CLOSE, ISSUE_STATE_PROCESS, PROCESS_STAGE_DOING, PROCESS_STAGE_DONE, PROCESS_STAGE_TODO } from "@/api/project_issue";
import { Space, Table } from 'antd';
import { WarningOutlined } from "@ant-design/icons";
import type { LocalIssueStore } from "@/stores/local";
import type { SpritStatus } from "../SpritDetail";

interface StatInfo {
    memberUserId: string;
    name: string;

    totalTaskCount: number;
    todoTaskCount: number;
    doingTaskCount: number;
    doneTaskCount: number;
    inCheckTaskCount: number;
    closeTaskCount: number;
    totalTaskHour: number;
    remainTaskHour: number;
    taskProgress: number;

    totalBugCount: number;
    todoBugCount: number;
    doingBugCount: number;
    doneBugCount: number;
    inCheckBugCount: number;
    closeBugCount: number;
    totalBugHour: number;
    remainBugHour: number;
    bugProgress: number;

}

export interface StatPanelProps {
    taskStore: LocalIssueStore;
    bugStore: LocalIssueStore;
    spritStatus: SpritStatus;
}

const StatPanel = (props: StatPanelProps) => {
    const memberStore = useStores('memberStore');

    const [statInfoList, setStatInfoList] = useState<StatInfo[]>([]);

    const genStatInfo = () => {
        const tmpList: StatInfo[] = [];
        memberStore.memberList.forEach(member => {
            const tmpStat: StatInfo = {
                memberUserId: member.member.member_user_id,
                name: member.member.display_name,

                totalTaskCount: 0,
                todoTaskCount: 0,
                doingTaskCount: 0,
                doneTaskCount: 0,
                inCheckTaskCount: 0,
                closeTaskCount: 0,
                totalTaskHour: 0,
                remainTaskHour: 0,
                taskProgress: 0,

                totalBugCount: 0,
                todoBugCount: 0,
                doingBugCount: 0,
                doneBugCount: 0,
                inCheckBugCount: 0,
                closeBugCount: 0,
                totalBugHour: 0,
                remainBugHour: 0,
                bugProgress: 0,
            };
            for (const task of props.taskStore.itemList) {
                if (task.exec_user_id == tmpStat.memberUserId || task.check_user_id == tmpStat.memberUserId) {
                    tmpStat.totalTaskCount += 1;
                }

                if (task.exec_user_id == tmpStat.memberUserId && task.state == ISSUE_STATE_PROCESS) {
                    if (task.process_stage == PROCESS_STAGE_TODO) {
                        tmpStat.todoTaskCount += 1;
                    } else if (task.process_stage == PROCESS_STAGE_DOING) {
                        tmpStat.doingTaskCount += 1;
                    } else if (task.process_stage == PROCESS_STAGE_DONE) {
                        tmpStat.doneTaskCount += 1;
                    }
                } else if (task.check_user_id == tmpStat.memberUserId && task.state == ISSUE_STATE_CHECK) {
                    tmpStat.inCheckTaskCount += 1
                } else if (task.state == ISSUE_STATE_CLOSE) {
                    tmpStat.closeTaskCount += 1
                }

                if (task.exec_user_id == tmpStat.memberUserId) {
                    tmpStat.totalTaskHour += (task.estimate_minutes / 60);
                    tmpStat.remainTaskHour += (task.remain_minutes / 60);
                }
            }
            for (const bug of props.bugStore.itemList) {
                if (bug.exec_user_id == tmpStat.memberUserId || bug.check_user_id == tmpStat.memberUserId) {
                    tmpStat.totalBugCount += 1;
                }

                if (bug.exec_user_id == tmpStat.memberUserId && bug.state == ISSUE_STATE_PROCESS) {
                    if (bug.process_stage == PROCESS_STAGE_TODO) {
                        tmpStat.todoBugCount += 1;
                    } else if (bug.process_stage == PROCESS_STAGE_DOING) {
                        tmpStat.doingBugCount += 1;
                    } else if (bug.process_stage == PROCESS_STAGE_DONE) {
                        tmpStat.doneBugCount += 1;
                    }
                } else if (bug.check_user_id == tmpStat.memberUserId && bug.state == ISSUE_STATE_CHECK) {
                    tmpStat.inCheckBugCount += 1
                } else if (bug.state == ISSUE_STATE_CLOSE) {
                    tmpStat.closeBugCount += 1
                }

                if (bug.exec_user_id == tmpStat.memberUserId) {
                    tmpStat.totalBugHour += (bug.estimate_minutes / 60);
                    tmpStat.remainBugHour += (bug.remain_minutes / 60);
                }
            }
            if (tmpStat.totalBugCount == 0 && tmpStat.totalTaskCount == 0) {
                return;
            }
            if (tmpStat.totalTaskHour > 0.00000000000001) {
                tmpStat.taskProgress = 1.0 - tmpStat.remainTaskHour / tmpStat.totalTaskHour;
            }
            if (tmpStat.totalBugHour > 0.00000000000001) {
                tmpStat.bugProgress = 1.0 - tmpStat.remainBugHour / tmpStat.totalBugHour;
            }
            tmpList.push(tmpStat);
        })
        //计算累计值
        const allStat: StatInfo = {
            memberUserId: "",
            name: "总计",

            totalTaskCount: 0,
            todoTaskCount: 0,
            doingTaskCount: 0,
            doneTaskCount: 0,
            inCheckTaskCount: 0,
            closeTaskCount: 0,
            totalTaskHour: 0,
            remainTaskHour: 0,
            taskProgress: 0,

            totalBugCount: 0,
            todoBugCount: 0,
            doingBugCount: 0,
            doneBugCount: 0,
            inCheckBugCount: 0,
            closeBugCount: 0,
            totalBugHour: 0,
            remainBugHour: 0,
            bugProgress: 0,
        };
        for (const stat of tmpList) {
            allStat.totalTaskCount += stat.totalTaskCount;
            allStat.todoTaskCount += stat.todoTaskCount;
            allStat.doingTaskCount += stat.doingTaskCount;
            allStat.doneTaskCount += stat.doneTaskCount;
            allStat.inCheckTaskCount += stat.inCheckTaskCount;
            allStat.closeTaskCount += stat.closeTaskCount;
            allStat.totalTaskHour += stat.totalTaskHour;
            allStat.remainTaskHour += stat.remainTaskHour;

            allStat.totalBugCount += stat.totalBugCount
            allStat.todoBugCount += stat.todoBugCount
            allStat.doingBugCount += stat.doingBugCount
            allStat.doneBugCount += stat.doneBugCount
            allStat.inCheckBugCount += stat.inCheckBugCount
            allStat.closeBugCount += stat.closeBugCount
            allStat.totalBugHour += stat.totalBugHour
            allStat.remainBugHour += stat.remainBugHour
        }
        if (allStat.totalTaskHour > 0.00000000000001) {
            allStat.taskProgress = 1.0 - allStat.remainTaskHour / allStat.totalTaskHour;
        }
        if (allStat.totalBugHour > 0.00000000000001) {
            allStat.bugProgress = 1.0 - allStat.remainBugHour / allStat.totalBugHour;
        }
        tmpList.push(allStat);
        setStatInfoList(tmpList);
    }

    const columns: ColumnsType<StatInfo> = [
        {
            title: "名称",
            dataIndex: "name",
        },
        {
            title: "总任务数",
            dataIndex: "totalTaskCount",
        },
        {
            title: "未开始任务",
            dataIndex: "todoTaskCount",
        },
        {
            title: "执行中任务",
            dataIndex: "doingTaskCount",
        },
        {
            title: "待检查任务",
            dataIndex: "doneTaskCount",
        },
        {
            title: "检查中任务",
            dataIndex: "inCheckTaskCount",
        },
        {
            title: "完成任务",
            dataIndex: "doneTaskCount",
        },
        {
            title: "任务预估时间",
            dataIndex: "totalTaskHour",
            render: (v: number) => (<>
                {v < 0.000000001 && <span>-</span>}
                {v > 0.000000001 && <span>{v.toFixed(1)}小时</span>}
            </>),
        },
        {
            title: "任务剩余时间",
            render: (_, record: StatInfo) => (<>
                {record.totalTaskHour < 0.000000001 && <span>-</span>}
                {record.totalTaskHour > 0.000000001 && <span>{record.remainTaskHour.toFixed(1)}小时</span>}
            </>),
        },
        {
            title: "任务执行进度",
            render: (_, record: StatInfo) => (<>
                {record.totalTaskHour < 0.000000001 && <span>-</span>}
                {record.totalTaskHour > 0.000000001 && <span>{(record.taskProgress * 100.0).toFixed(0)}%</span>}
            </>),
        },
        {
            title: "总缺陷数",
            dataIndex: "totalBugCount",
        },
        {
            title: "未开始缺陷",
            dataIndex: "todoBugCount",
        },
        {
            title: "执行中缺陷",
            dataIndex: "doingBugCount",
        },
        {
            title: "待检查缺陷",
            dataIndex: "doneBugCount",
        },
        {
            title: "检查中缺陷",
            dataIndex: "inCheckBugCount",
        },
        {
            title: "完成缺陷",
            dataIndex: "closeBugCount",
        },
        {
            title: "缺陷预估时间",
            dataIndex: "totalBugHour",
            render: (v: number) => (<>
                {v < 0.000000001 && <span>-</span>}
                {v > 0.000000001 && <span>{v.toFixed(1)}小时</span>}
            </>),
        },
        {
            title: "缺陷剩余时间",
            render: (_, record: StatInfo) => (<>
                {record.totalBugHour < 0.000000001 && <span>-</span>}
                {record.totalBugHour > 0.000000001 && <span>{record.remainBugHour.toFixed(1)}小时</span>}
            </>),
        },
        {
            title: "缺陷执行进度",
            render: (_, record: StatInfo) => (<>
                {record.totalBugHour < 0.000000001 && <span>-</span>}
                {record.totalBugHour > 0.000000001 && <span>{(record.bugProgress * 100.0).toFixed(0)}%</span>}
            </>),
        },

    ];

    const hasMissData = () => {
        const status = props.spritStatus;
        return (status.missExecBugCount + status.missExecTaskCount + status.missProgressBugCount + status.missProgressTaskCount) > 0;
    }

    useEffect(() => {
        genStatInfo();
    }, [props.taskStore.itemList,props.bugStore.itemList]);

    return (
        <div style={{ height: "calc(100vh - 140px)", overflowY: "scroll" }}>
            {hasMissData() && (
                <Space style={{ marginLeft: "10px", color: "red" }}>
                    <WarningOutlined />
                    统计信息存在偏差。
                    {props.spritStatus.missExecTaskCount > 0 && `有${props.spritStatus.missExecTaskCount}个任务未指定执行人。`}
                    {props.spritStatus.missExecBugCount > 0 && `有${props.spritStatus.missExecBugCount}个缺陷未指定执行人。`}
                    {props.spritStatus.missProgressTaskCount > 0 && `有${props.spritStatus.missProgressTaskCount}个任务未指定进度。`}
                    {props.spritStatus.missProgressBugCount > 0 && `有${props.spritStatus.missProgressBugCount}个缺陷未指定进度。`}
                </Space>
            )}
            <Table rowKey="memberUserId" dataSource={statInfoList} columns={columns} pagination={false} />
        </div>
    );
}

export default observer(StatPanel);