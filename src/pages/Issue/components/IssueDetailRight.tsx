import type { IssueInfo } from "@/api/project_issue";
import { ISSUE_STATE_PROCESS } from "@/api/project_issue";

import { getIssueText, getIsTask, timeToDateString } from "@/utils/utils";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import s from './IssueDetailRight.module.less';
import { Timeline, Tooltip, } from 'antd';
import type { PluginEvent } from '@/api/events';
import { EVENT_TYPE_BUG, EVENT_TYPE_TASK, EVENT_REF_TYPE_TASK, EVENT_REF_TYPE_BUG, list_event_by_ref } from '@/api/events';
import EventCom from "@/components/EventCom";
import { useStores } from "@/hooks";
import type { ListEventByRefRequest } from '@/api/events';
import { request } from '@/utils/request';
import { issueState } from "@/utils/constant";
import { EditText } from "@/components/EditCell/EditText";
import { getMemberSelectItems, getStateColor, updateCheckAward, updateCheckUser, updateEndTime, updateEstimateMinutes, updateExecAward, updateExecUser, updateExtraInfo, updateRemainMinutes } from "./utils";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { EditSelect } from "@/components/EditCell/EditSelect";
import { awardSelectItems, bugLvSelectItems, bugPrioritySelectItems, hourSelectItems, taskPrioritySelectItems } from "./constant";
import { EditDate } from "@/components/EditCell/EditDate";


type TimeLineType = PluginEvent;

export interface IssueDetailRightProps {
    issue: IssueInfo;
    dataVersion: number;
    onUpdate: () => void;
    setShowStageModal: () => void;
}

const IssueDetailRight: React.FC<IssueDetailRightProps> = (props) => {
    const { pathname } = useLocation();
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores("memberStore");

    const [timeLine, setTimeLine] = useState<TimeLineType[]>();

    const loadEvent = async () => {
        const req: ListEventByRefRequest = {
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            event_type: getIsTask(pathname) ? EVENT_TYPE_TASK : EVENT_TYPE_BUG,
            ref_type: getIsTask(pathname) ? EVENT_REF_TYPE_TASK : EVENT_REF_TYPE_BUG,
            ref_id: props.issue.issue_id,
        };
        const res = await request(list_event_by_ref(req));
        if (res) {
            setTimeLine(res.event_list);
        }
    }

    useEffect(() => {
        loadEvent();
    }, [props.issue.issue_id, props.dataVersion])

    const memberSelectItems = getMemberSelectItems(memberStore.memberList.map(item => item.member));

    return (
        <div className={s.RightCom}>
            <div className={s.basic_info_wrap}>
                <div className={s.basic_info}>
                    <span>当前阶段</span>
                    <div
                        tabIndex={0}
                        style={{
                            background: `rgb(${getStateColor(props.issue.state)} / 20%)`,
                            width: '50px',
                            borderRadius: '50px',
                            textAlign: 'center',
                            color: `rgb(${getStateColor(props.issue.state)})`,
                            cursor: `${props.issue.user_issue_perm.next_state_list.length > 0 ? "pointer" : "default"}`,
                            paddingLeft: "0px",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (props.issue.user_issue_perm.next_state_list.length > 0) {
                                props.setShowStageModal();
                            }
                        }}
                    >
                        <Tooltip title={""}>{issueState[props.issue.state].label}</Tooltip>
                    </div>
                </div>
                {!getIsTask(pathname) && (
                    <>
                        <div className={s.basic_info}>
                            <span>级别</span>
                            <div>
                                <EditSelect editable={true} curValue={props.issue.extra_info.ExtraBugInfo!.level} itemList={bugLvSelectItems} onChange={async (value) => {
                                    return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, props.issue.issue_id, {
                                        ExtraBugInfo: {
                                            ...props.issue.extra_info.ExtraBugInfo!,
                                            level: value as number,
                                        },
                                    });
                                }} showEditIcon={true} /></div>
                        </div>
                        <div className={s.basic_info}>
                            <span>优先级</span>
                            <div>
                                <EditSelect editable={true} curValue={props.issue.extra_info.ExtraBugInfo!.priority}
                                    itemList={bugPrioritySelectItems}
                                    onChange={async (value) => {
                                        return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, props.issue.issue_id, {
                                            ExtraBugInfo: {
                                                ...props.issue.extra_info.ExtraBugInfo!,
                                                priority: value as number,
                                            }
                                        });

                                    }} showEditIcon={true} />
                            </div>
                        </div>
                        <div className={s.basic_info}>
                            <span>软件版本</span>
                            <div>
                                <EditText editable={true}
                                    content={props.issue.extra_info.ExtraBugInfo?.software_version ?? ""}
                                    onChange={async (value: string) => {
                                        return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, props.issue.issue_id, {
                                            ExtraBugInfo: {
                                                ...props.issue.extra_info.ExtraBugInfo!,
                                                software_version: value,
                                            },
                                        });
                                    }} showEditIcon={true} />
                            </div>
                        </div>

                    </>
                )}
                {getIsTask(pathname) && (
                    <div className={s.basic_info}>
                        <span>优先级</span>
                        <div><EditSelect editable={true} curValue={props.issue.extra_info.ExtraTaskInfo!.priority}
                            itemList={taskPrioritySelectItems}
                            onChange={async (value) => {
                                return await updateExtraInfo(userStore.sessionId, projectStore.curProjectId, props.issue.issue_id, {
                                    ExtraTaskInfo: {
                                        ...props.issue.extra_info.ExtraTaskInfo!,
                                        priority: value as number,
                                    }
                                });

                            }} showEditIcon={true} />
                        </div>
                    </div>
                )}
                <div className={s.basic_info}>
                    <span>处理人</span>
                    <div>
                        <EditSelect
                            editable={props.issue.user_issue_perm.can_assign_exec_user}
                            curValue={props.issue.exec_user_id}
                            itemList={memberSelectItems}
                            onChange={async (value) => {
                                const res = await updateExecUser(userStore.sessionId, props.issue.project_id, props.issue.issue_id, value as string);
                                if (res) {
                                    props.onUpdate();
                                }
                                return res;
                            }} showEditIcon={true} />
                    </div>
                </div>
                <div className={s.basic_info}>
                    <span>验收人</span>
                    <div>
                        <EditSelect
                            editable={props.issue.user_issue_perm.can_assign_check_user}
                            curValue={props.issue.check_user_id}
                            itemList={memberSelectItems}
                            onChange={async (value) => {
                                const res = await updateCheckUser(userStore.sessionId, props.issue.project_id, props.issue.issue_id, value as string);
                                if (res) {
                                    props.onUpdate();
                                }
                                return res;
                            }} showEditIcon={true} />
                    </div>
                </div>
                <div className={s.basic_info}>
                    <span>处理贡献
                        <Tooltip title={`当${getIssueText(pathname)}关闭后，会给处理人增加的项目贡献值`} trigger="click">
                            <a><QuestionCircleOutlined /></a>
                        </Tooltip>
                    </span>
                    <div>
                        <EditSelect
                            editable={props.issue.user_issue_perm.can_set_award}
                            curValue={props.issue.exec_award_point}
                            itemList={awardSelectItems}
                            onChange={async (value) => {
                                return await updateExecAward(userStore.sessionId, props.issue.project_id, props.issue.issue_id, value as number);
                            }} showEditIcon={true} />
                    </div>
                </div>
                <div className={s.basic_info}>
                    <span>验收贡献
                        <Tooltip title={`当${getIssueText(pathname)}关闭后，会给验收人增加的项目贡献值`} trigger="click">
                            <a><QuestionCircleOutlined /></a>
                        </Tooltip>
                    </span>
                    <div>
                        <EditSelect
                            editable={props.issue.user_issue_perm.can_set_award}
                            curValue={props.issue.check_award_point}
                            itemList={awardSelectItems}
                            onChange={async (value) => {
                                return await updateCheckAward(userStore.sessionId, props.issue.project_id, props.issue.issue_id, value as number);
                            }} showEditIcon={true} />
                    </div>
                </div>
                <div className={s.basic_info}>
                    <span>剩余工时</span>
                    <div>
                        <EditSelect
                            editable={props.issue.exec_user_id == userStore.userInfo.userId && props.issue.state == ISSUE_STATE_PROCESS}
                            curValue={props.issue.has_remain_minutes ? props.issue.remain_minutes : -1}
                            itemList={hourSelectItems}
                            onChange={async (value) => {
                                return await updateRemainMinutes(userStore.sessionId, props.issue.project_id, props.issue.issue_id, value as number);
                            }} showEditIcon={true} />
                    </div>
                </div>
                <div className={s.basic_info}>
                    <span>预估工时</span>
                    <div>
                        <EditSelect
                            editable={props.issue.exec_user_id == userStore.userInfo.userId && props.issue.state == ISSUE_STATE_PROCESS}
                            curValue={props.issue.has_estimate_minutes ? props.issue.estimate_minutes : -1}
                            itemList={hourSelectItems}
                            onChange={async (value) => {
                                return await updateEstimateMinutes(userStore.sessionId, props.issue.project_id, props.issue.issue_id, value as number);
                            }} showEditIcon={true} />
                    </div>
                </div>
                <div className={s.basic_info}>
                    <span>预估完成时间</span>
                    <div>
                        <EditDate
                            editable={props.issue.exec_user_id == userStore.userInfo.userId && props.issue.state == ISSUE_STATE_PROCESS}
                            hasTimeStamp={props.issue.has_end_time}
                            timeStamp={props.issue.end_time}
                            onChange={async (value) => {
                                return await updateEndTime(userStore.sessionId, props.issue.project_id, props.issue.issue_id, value);
                            }} showEditIcon={true} />
                    </div>
                </div>
            </div>
            <div className={s.hr} />
            <div
                className={s.time_line_wrap}
                style={{
                    height: `${getIsTask(pathname) ? 'calc(100% - 290px)' : 'calc(100% - 350px)'}`,
                }}
            >
                <h2>动态</h2>
                <Timeline className={s.timeLine} reverse={true}>
                    {timeLine?.map((item) => (
                        <Timeline.Item color="gray" key={item.event_id}>
                            <p>{timeToDateString(item.event_time)}</p>
                            <EventCom key={item.event_id} item={item} skipProjectName={true} skipLink={true} showMoreLink={true} />
                        </Timeline.Item>
                    ))}
                </Timeline>
            </div>
        </div>
    );
};

export default IssueDetailRight;