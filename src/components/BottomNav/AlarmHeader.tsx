import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { ALARM_TYPE_ISSUE_DELAY_ALERT, ALARM_TYPE_ISSUE_DELAY_HIT, ALARM_TYPE_ISSUE_DEPEND_ALERT, ALARM_TYPE_ISSUE_DEPEND_HIT, ALARM_TYPE_ISSUE_REOPEN_ALERT, ALARM_TYPE_ISSUE_REOPEN_HIT } from "@/api/project_alarm";
import { list_alarm, remove_alarm } from "@/api/project_alarm";
import type { Alarm } from "@/api/project_alarm";
import { Badge, Button,  Popover, Space, Table, message } from "antd";
import type { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import { useHistory } from "react-router-dom";
import { ISSUE_TYPE_TASK } from "@/api/project_issue";
import { LinkBugInfo, LinkTaskInfo } from "@/stores/linkAux";
import { AlertTwoTone } from "@ant-design/icons";

const PAGE_SIZE = 5;


interface AlarmListProps {
    includeHit: boolean;
    includeAlert: boolean;
}

const AlarmList: React.FC<AlarmListProps> = (props) => {
    const history = useHistory();

    const userStore = useStores("userStore");
    const projectStore = useStores("projectStore");
    const linkAuxStore = useStores("linkAuxStore");

    const [alarmList, setAlarmList] = useState<Alarm[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadAlarmList = async () => {
        const res = await request(list_alarm({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            include_hit: props.includeHit,
            include_alert: props.includeAlert,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setAlarmList(res.alarm_list);
    };

    const goToAlarmSource = (alarm: Alarm) => {
        let issueId = "";
        let issueType = ISSUE_TYPE_TASK;

        if (alarm.alarm_type == ALARM_TYPE_ISSUE_DEPEND_HIT) {
            issueId = alarm.content.IssueDependHitInfo?.issue_id ?? "";
            issueType = alarm.content.IssueDependHitInfo?.issue_type ?? 0;
        } else if (alarm.alarm_type == ALARM_TYPE_ISSUE_DEPEND_ALERT) {
            issueId = alarm.content.IssueDependAlertInfo?.issue_id ?? "";
            issueType = alarm.content.IssueDependAlertInfo?.issue_type ?? 0;
        } else if (alarm.alarm_type == ALARM_TYPE_ISSUE_DELAY_HIT) {
            issueId = alarm.content.IssueDelayHitInfo?.issue_id ?? "";
            issueType = alarm.content.IssueDelayHitInfo?.issue_type ?? 0;
        } else if (alarm.alarm_type == ALARM_TYPE_ISSUE_DELAY_ALERT) {
            issueId = alarm.content.IssueDelayAlertInfo?.issue_id ?? "";
            issueType = alarm.content.IssueDelayAlertInfo?.issue_type ?? 0;
        } else if (alarm.alarm_type == ALARM_TYPE_ISSUE_REOPEN_HIT) {
            issueId = alarm.content.IssueReOpenHitInfo?.issue_id ?? "";
            issueType = alarm.content.IssueReOpenHitInfo?.issue_type ?? 0;
        } else if (alarm.alarm_type == ALARM_TYPE_ISSUE_REOPEN_ALERT) {
            issueId = alarm.content.IssueReOpenAlertInfo?.issue_id ?? "";
            issueType = alarm.content.IssueReOpenAlertInfo?.issue_type ?? 0;
        }
        if (issueId != "") {
            if (issueType == ISSUE_TYPE_TASK) {
                linkAuxStore.goToLink(new LinkTaskInfo("", projectStore.curProjectId, issueId), history);
            } else {
                linkAuxStore.goToLink(new LinkBugInfo("", projectStore.curProjectId, issueId), history);
            }
        }
    };

    const removeAlarm = async (alarmId: string) => {
        await request(remove_alarm({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            alarm_id: alarmId,
        }));
        await loadAlarmList();
        message.info("删除预警成功");
    };

    const columns: ColumnsType<Alarm> = [
        {
            title: "内容",
            width: 250,
            render: (_, record: Alarm) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    goToAlarmSource(record);
                }}>{record.title}</a>
            )
        },
        {
            title: "风险类型",
            width: 100,
            render: (_, record: Alarm) => {
                if (record.alarm_type == ALARM_TYPE_ISSUE_DEPEND_HIT || record.alarm_type == ALARM_TYPE_ISSUE_DEPEND_ALERT) {
                    return "被依赖超过阈值";
                } else if (record.alarm_type == ALARM_TYPE_ISSUE_DELAY_HIT || record.alarm_type == ALARM_TYPE_ISSUE_DELAY_ALERT) {
                    return "超时未完成";
                } else if (record.alarm_type == ALARM_TYPE_ISSUE_REOPEN_HIT || record.alarm_type == ALARM_TYPE_ISSUE_REOPEN_ALERT) {
                    return "重新打开次数过多";
                }
                return "";
            },
        },
        {
            title: "预警时间",
            width: 150,
            render: (_, record: Alarm) => moment(record.time_stamp).format("YYYY-MM-DD HH:mm")
        },
        {
            title: "操作",
            width: 60,
            render: (_, record: Alarm) => (
                <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} disabled={projectStore.isClosed || (!projectStore.isAdmin)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeAlarm(record.alarm_id);
                    }}>删除</Button>
            ),
        }
    ];

    useEffect(() => {
        loadAlarmList();
    }, [projectStore.curProjectId, curPage]);

    return (
        <div style={{ padding: "10px 10px", maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}>
            <Table rowKey="alarm_id" dataSource={alarmList} columns={columns} pagination={{
                total: totalCount,
                current: curPage + 1,
                pageSize: PAGE_SIZE,
                onChange: (page => setCurPage(page - 1)),
                hideOnSinglePage: true,
            }} />
        </div>
    );
}

const AlarmHeader = () => {
    const appStore = useStores("appStore");
    const projectStore = useStores("projectStore");

    return (
        <div style={{ marginRight: "80px" }}>
            <Space size="middle">
                <Popover open={projectStore.curProject?.project_status.alarm_hit_count == 0 ? false : undefined} trigger="hover"
                    mouseLeaveDelay={1}
                    content={<AlarmList includeHit={true} includeAlert={false} />} placement="topLeft" destroyTooltipOnHide autoAdjustOverflow>
                    <Badge count={projectStore.curProject?.project_status.alarm_hit_count} size="small" dot={appStore.focusMode}>
                        <AlertTwoTone style={{ fontSize: "20px", cursor: "default" }} twoToneColor={projectStore.curProject?.project_status.alarm_hit_count == 0 ? "#ccc" : ["#aaa", "yellow"]} title="风险提示" />
                    </Badge>
                </Popover>


                <Popover open={projectStore.curProject?.project_status.alarm_alert_count == 0 ? false : undefined} trigger="hover"
                    mouseLeaveDelay={1}
                    content={<AlarmList includeHit={false} includeAlert={true} />} placement="topLeft" destroyTooltipOnHide autoAdjustOverflow>
                    <Badge count={projectStore.curProject?.project_status.alarm_alert_count} size="small" dot={appStore.focusMode}>
                        <AlertTwoTone style={{ fontSize: "20px", cursor: "default" }} twoToneColor={projectStore.curProject?.project_status.alarm_alert_count == 0 ? "#ccc" : ["#aaa", "red"]} title="风险警告" />
                    </Badge>
                </Popover>

            </Space>
        </div >
    );
};

export default observer(AlarmHeader);