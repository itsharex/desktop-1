import React, { useEffect, useState } from "react";
import { observer, useLocalObservable } from 'mobx-react';
import { Button, Card, Descriptions, Select, Space, Table, Tooltip } from "antd";
import { useStores } from "@/hooks";
import type { WebMemberInfo } from "@/stores/member";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { DoubleLeftOutlined, LinkOutlined } from "@ant-design/icons";
import moment from "moment";
import EventCom from "@/components/EventCom";
import { type PluginEvent, list_project_event } from "@/api/events";
import { request } from "@/utils/request";
import { EVENT_ICON_LIST } from "../Record/common";
import { timeToDateString } from "@/utils/utils";
import type { ISSUE_STATE, ISSUE_TYPE, IssueInfo } from "@/api/project_issue";
import { ISSUE_TYPE_TASK, ISSUE_TYPE_BUG, ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK, list as list_issue, SORT_TYPE_DSC, SORT_KEY_UPDATE_TIME, ASSGIN_USER_EXEC, ASSGIN_USER_CHECK } from "@/api/project_issue";
import { LocalIssueStore } from "@/stores/local";
import type { ColumnsType } from 'antd/lib/table';
import { LinkBugInfo, LinkTaskInfo } from "@/stores/linkAux";
import { useHistory } from "react-router-dom";
import { issueState } from "@/utils/constant";
import { getStateColor } from "@/pages/Issue/components/utils";
import { SHORT_NOTE_BUG, SHORT_NOTE_TASK } from "@/api/short_note";

interface IssueListProps {
    memberUserId: string;
    issueType: ISSUE_TYPE;
    issueState: ISSUE_STATE
}

const IssueList = observer((props: IssueListProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const issueStore = useLocalObservable(() => new LocalIssueStore(userStore.sessionId, projectStore.curProjectId, "", props.issueType));

    const loadIssueList = async () => {
        const res = await request(list_issue({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_param: {
                filter_by_issue_type: true,
                issue_type: props.issueType,
                filter_by_state: true,
                state_list: [props.issueState],
                filter_by_create_user_id: false,
                create_user_id_list: [],
                filter_by_assgin_user_id: true,
                assgin_user_id_list: [props.memberUserId],
                assgin_user_type: props.issueState == ISSUE_STATE_PROCESS ? ASSGIN_USER_EXEC : ASSGIN_USER_CHECK,
                filter_by_sprit_id: false,
                sprit_id_list: [],
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
        issueStore.itemList = res.info_list;
    };

    const columns: ColumnsType<IssueInfo> = [
        {
            title: '名称',
            ellipsis: true,
            width: 250,
            fixed: true,
            render: (_, record: IssueInfo) => {
                return (
                    <span
                        style={{ cursor: 'pointer', display: "inline-block", paddingTop: "5px", paddingBottom: "5px" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (record.issue_type == ISSUE_TYPE_TASK) {
                                linkAuxStore.goToLink(new LinkTaskInfo("", record.project_id, record.issue_id), history);
                            } else if (record.issue_type == ISSUE_TYPE_BUG) {
                                linkAuxStore.goToLink(new LinkBugInfo("", record.project_id, record.issue_id), history);
                            }
                        }}
                    >
                        <a><LinkOutlined />&nbsp;{record.basic_info.title}</a>
                    </span>
                );
            },
        },
        {
            title: '状态',
            dataIndex: 'state',
            width: 100,
            align: 'center',
            render: (val: number, row: IssueInfo) => {
                const v = issueState[val];
                let tips = "";
                if (row.user_issue_perm.next_state_list.length == 0) {
                    if ([ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK].includes(row.state) && (
                        (userStore.userInfo.userId == row.exec_user_id) || (userStore.userInfo.userId == row.check_user_id)
                    )) {
                        tips = "请等待同事更新状态"
                    }
                }
                return (
                    <div
                        tabIndex={0}
                        style={{
                            background: `rgb(${getStateColor(val)} / 20%)`,
                            width: '60px',
                            borderRadius: '50px',
                            textAlign: 'center',
                            color: `rgb(${getStateColor(val)})`,
                            margin: '0 auto',
                        }}
                    >
                        <Tooltip title={tips}>{v.label}</Tooltip>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        loadIssueList();
    }, []);

    useEffect(() => {
        return () => {
            issueStore.unlisten();
        };
    }, []);

    return (
        <Table rowKey="issue_id" dataSource={issueStore.itemList} columns={columns} pagination={false} />
    );
});

interface MemberEventListProps {
    lastEventTime: number;
    memberUserId: string;
}

const MemberEventList = (props: MemberEventListProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [eventList, setEventList] = useState([] as PluginEvent[]);

    const loadEventList = async () => {
        const res = await request(list_project_event({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            filter_by_member_user_id: true,
            member_user_id: props.memberUserId,
            from_time: moment(props.lastEventTime).add(-3, "days").valueOf(),
            to_time: props.lastEventTime,
            offset: 0,
            limit: 999,
        }));
        const tmpList = res.event_list.sort((a, b) => b.event_time - a.event_time);
        setEventList(tmpList);
    };

    useEffect(() => {
        loadEventList();
    }, [props.lastEventTime, props.memberUserId]);

    return (
        <>
            {eventList.map(item => (
                <div key={item.event_id} style={{ marginBottom: "10px" }}>
                    <EventCom
                        item={item}
                        skipProjectName={true}
                        skipLink={false}
                        showMoreLink={false}
                        showSource={true}
                    >
                        <img
                            style={{ width: "16px", height: "16px", margin: "0 5px 0 0" }}
                            src={EVENT_ICON_LIST[item.event_type]?.icon}
                            alt=""
                        />
                        <span style={{ margin: "0 12px 0 0", color: "#8a8a8a" }}>{timeToDateString(item.event_time)}</span>
                    </EventCom>
                </div>
            ))}
        </>
    );
};

const MemberDetail = () => {
    const history = useHistory();
    
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [memberInfo, setMemberInfo] = useState<WebMemberInfo | undefined>(undefined);

    useEffect(() => {
        if (memberStore.showDetailMemberId == "") {
            setMemberInfo(undefined);
        } else {
            setMemberInfo(memberStore.getMember(memberStore.showDetailMemberId));
        }
    }, [memberStore.showDetailMemberId]);

    return (
        <Card title={<Space size="small">
            <Button type="link" icon={<DoubleLeftOutlined />} onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                memberStore.showDetailMemberId = "";
            }} style={{ minWidth: 0, padding: "0px 0px" }} title="返回" />
            <span style={{ fontSize: "16px", fontWeight: 600 }}>成员详情</span>
        </Space>} extra={
            <Select style={{ width: "150px" }} value={memberStore.showDetailMemberId} onChange={value => {
                memberStore.showDetailMemberId = value;
            }}>
                {memberStore.memberList.map(item => (
                    <Select.Option key={item.member.member_user_id} value={item.member.member_user_id}>
                        <UserPhoto logoUri={item.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                        &nbsp;&nbsp;{item.member.display_name}
                    </Select.Option>
                ))}
            </Select>
        } headStyle={{ paddingLeft: 0 }} bodyStyle={{ height: "calc(100vh - 190px)", overflowY: "scroll" }} style={{ width: "100%" }} bordered={false}>
            {memberInfo != undefined && (
                <>
                    <Card title="成员状态" style={{ marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }} bodyStyle={{ padding: "0px 0px" }}>
                        <Descriptions column={2} bordered labelStyle={{ width: "100px" }}>
                            <Descriptions.Item label="用户昵称">
                                {memberInfo.member.display_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="用户角色">
                                {memberInfo.member.role_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="已执行任务">
                                {memberInfo.issue_member_state?.task_exec_done_count ?? 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="已检查任务">
                                {memberInfo.issue_member_state?.task_check_done_count ?? 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="未执行任务">
                                {memberInfo.issue_member_state?.task_un_exec_count ?? 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="未检查任务">
                                {memberInfo.issue_member_state?.task_un_check_count ?? 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="已处理缺陷">
                                {memberInfo.issue_member_state?.bug_exec_done_count ?? 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="已检查缺陷">
                                {memberInfo.issue_member_state?.bug_check_done_count ?? 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="未处理缺陷">
                                {memberInfo.issue_member_state?.bug_un_exec_count ?? 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="未检查缺陷">
                                {memberInfo.issue_member_state?.bug_un_check_count ?? 0}
                            </Descriptions.Item>
                            {memberInfo.short_note_list.length > 0 && (
                                <Descriptions.Item label="桌面便签" span={2}>
                                    {memberInfo.short_note_list.map(item => (
                                        <div key={item.target_id}>
                                            {item.short_note_type == SHORT_NOTE_TASK && (
                                                <span>任务:&nbsp;<a onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    linkAuxStore.goToLink(new LinkTaskInfo("", item.project_id, item.target_id), history);
                                                }}>{item.title}</a></span>
                                            )}
                                            {item.short_note_type == SHORT_NOTE_BUG && (
                                                <span>缺陷:&nbsp;<a onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    linkAuxStore.goToLink(new LinkBugInfo("", item.project_id, item.target_id), history);
                                                }}>{item.title}</a></span>
                                            )}
                                        </div>
                                    ))}
                                </Descriptions.Item>
                            )}
                            {memberInfo.last_event !== undefined && (
                                <Descriptions.Item span={2} label="工作状态">
                                    <span>{moment(memberInfo.last_event.event_time).format("YYYY-MM-DD HH:mm:ss")}</span>
                                    <EventCom key={memberInfo.last_event.event_id} item={memberInfo.last_event!}
                                        skipProjectName={true} skipLink={true}
                                        showMoreLink={true} onLinkClick={() => { }} />
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                    {(memberInfo.issue_member_state?.task_un_exec_count ?? 0) > 0 && (
                        <Card title="未完成任务" style={{ marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }}>
                            <IssueList issueType={ISSUE_TYPE_TASK} issueState={ISSUE_STATE_PROCESS} memberUserId={memberInfo.member.member_user_id} />
                        </Card>
                    )}
                    {(memberInfo.issue_member_state?.task_un_check_count ?? 0) > 0 && (
                        <Card title="未检查任务" style={{ marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }}>
                            <IssueList issueType={ISSUE_TYPE_TASK} issueState={ISSUE_STATE_CHECK} memberUserId={memberInfo.member.member_user_id} />
                        </Card>
                    )}
                    {(memberInfo.issue_member_state?.bug_un_exec_count ?? 0) > 0 && (
                        <Card title="未处理缺陷" style={{ marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }} >
                            <IssueList issueType={ISSUE_TYPE_BUG} issueState={ISSUE_STATE_PROCESS} memberUserId={memberInfo.member.member_user_id} />
                        </Card>
                    )}
                    {(memberInfo.issue_member_state?.task_un_check_count ?? 0) > 0 && (
                        <Card title="未检查缺陷" style={{ marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }}>
                            <IssueList issueType={ISSUE_TYPE_BUG} issueState={ISSUE_STATE_CHECK} memberUserId={memberInfo.member.member_user_id} />
                        </Card>
                    )}
                    <Card title="用户行为" style={{ marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }}>
                        <MemberEventList lastEventTime={memberInfo.last_event?.event_time ?? 0} memberUserId={memberInfo.member.member_user_id} />
                    </Card>
                </>
            )}
        </Card>
    );
};

export default observer(MemberDetail);