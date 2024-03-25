import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, List, message, Modal, Popover, Space, Tabs } from "antd";
import { useStores } from "@/hooks";
import type { UserNoticeInfo } from "@/api/user_notice";
import { list_notice, mark_has_read, remove_notice } from "@/api/user_notice";
import { request } from "@/utils/request";
import moment from "moment";
import { ack_join as ack_join_project } from "@/api/project_member";
import { MAIN_CONTENT_CONTENT_LIST, MAIN_CONTENT_MY_WORK } from "@/api/project";
import { useHistory } from "react-router-dom";
import { APP_PROJECT_HOME_PATH, APP_PROJECT_MY_WORK_PATH } from "@/utils/constant";
import { MoreOutlined } from "@ant-design/icons";
import UserPhoto from "../Portrait/UserPhoto";

const PAGE_SIZE = 10;

interface NoticeMsgProps {
    notice: UserNoticeInfo;
    onRead: () => void;
    onClick: () => void;
}

const NoticeMsg = (props: NoticeMsgProps) => {
    const userStore = useStores('userStore');

    const markHasRead = async () => {
        if (props.notice.has_read) {
            return;
        }
        await request(mark_has_read({
            session_id: userStore.sessionId,
            notice_from_id: props.notice.notice_from_id,
        }));
        await userStore.updateNoticeStatus(userStore.sessionId);
        props.onRead();
    };

    return (
        <div>
            <span>{moment(props.notice.time_stamp).format("YYYY-MM-DD HH:mm")}</span>
            &nbsp;&nbsp;
            {props.notice.send_user_id != "" && (
                <Space style={{ paddingRight: "10px" }}>
                    <UserPhoto logoUri={props.notice.send_user_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                    {props.notice.send_user_display_name}
                </Space>
            )}
            {props.notice.notice_data.AddToProjectFromOrgData !== undefined && (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    markHasRead();
                    props.onClick();
                }} style={{ fontWeight: props.notice.has_read ? 0 : 600 }}>邀请您加入项目&nbsp;{props.notice.notice_data.AddToProjectFromOrgData.project_name}</a>
            )}
        </div>
    );
};

const UserNoticeList = () => {
    const history = useHistory();

    const appStore = useStores('appStore');
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');
    const entryStore = useStores('entryStore');

    const [activeKey, setAcviteKey] = useState<"unread" | "all">(userStore.userInfo.unReadNotice > 0 ? "unread" : "all");
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [noticeList, setNoticeList] = useState([] as UserNoticeInfo[]);
    const [curNoticeInfo, setCurNoticeInfo] = useState<UserNoticeInfo | null>(null);

    const loadNoticeList = async () => {
        const res = await request(list_notice({
            session_id: userStore.sessionId,
            filter_by_has_read: activeKey == "unread",
            has_read: false,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setNoticeList(res.user_notice_list);
    };

    const removeNotice = async (noticeFromId: string) => {
        await request(remove_notice({
            session_id: userStore.sessionId,
            notice_from_id: noticeFromId,
        }));
        await loadNoticeList();
        await userStore.updateNoticeStatus(userStore.sessionId);
        message.info("删除成功");
    };

    const ackJoinProject = async (projectId: string) => {
        await request(ack_join_project({
            session_id: userStore.sessionId,
            project_id: projectId,
        }));

        setCurNoticeInfo(null);
        message.info("加入项目成功");
        await userStore.updateNoticeStatus(userStore.sessionId);
        projectStore.updateProject(projectId);

        if (appStore.inEdit) {
            appStore.showCheckLeave(() => {
                projectStore.setCurProjectId(projectId).then(() => {
                    entryStore.reset();
                    projectStore.projectHome.homeType = projectStore.curProject?.setting.main_content ?? MAIN_CONTENT_CONTENT_LIST;
                    if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_MY_WORK) {
                        history.push(APP_PROJECT_MY_WORK_PATH);
                    } else {
                        history.push(APP_PROJECT_HOME_PATH);
                    }
                });
                orgStore.setCurOrgId("");
            });
            return;
        }
        projectStore.setCurProjectId(projectId).then(() => {
            entryStore.reset();
            projectStore.projectHome.homeType = projectStore.curProject?.setting.main_content ?? MAIN_CONTENT_CONTENT_LIST;
            if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_MY_WORK) {
                history.push(APP_PROJECT_MY_WORK_PATH);
            } else {
                history.push(APP_PROJECT_HOME_PATH);
            }
        });
        orgStore.setCurOrgId("");
    };

    useEffect(() => {
        loadNoticeList();
    }, [curPage, activeKey]);

    return (
        <>
            <Tabs style={{ padding: "10px 10px", width: "300px" }} activeKey={activeKey} onChange={key => {
                setAcviteKey(key as "unread" | "all");
                setCurPage(0);
            }}>

                <Tabs.TabPane tab="未读消息" key="unread">
                    <List style={{ maxHeight: "calc(100vh - 400px)", overflowY: "scroll" }} rowKey="notice_from_id" dataSource={noticeList}
                        pagination={{ total: totalCount, pageSize: PAGE_SIZE, current: curPage + 1, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                        renderItem={(notice) => (
                            <List.Item extra={
                                <Popover trigger="click" placement="bottom" content={
                                    <div style={{ padding: "10px 10px" }}>
                                        <Button type="link" danger onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            removeNotice(notice.notice_from_id);
                                        }}>删除</Button>
                                    </div>
                                }>
                                    <MoreOutlined />
                                </Popover>
                            }>
                                <NoticeMsg notice={notice} onRead={() => {
                                    const tmpList = noticeList.slice();
                                    const index = tmpList.findIndex(item => item.notice_from_id == notice.notice_from_id);
                                    if (index != -1) {
                                        tmpList[index].has_read = true;
                                        setNoticeList(tmpList);
                                    }
                                }} onClick={() => setCurNoticeInfo(notice)} />
                            </List.Item>
                        )} />
                </Tabs.TabPane>

                <Tabs.TabPane tab="全部消息" key="all">
                    <List style={{ maxHeight: "calc(100vh - 400px)", overflowY: "scroll" }} rowKey="notice_from_id" dataSource={noticeList}
                        pagination={{ total: totalCount, pageSize: PAGE_SIZE, current: curPage + 1, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                        renderItem={(notice) => (
                            <List.Item extra={
                                <Popover trigger="click" placement="bottom" content={
                                    <div style={{ padding: "10px 10px" }}>
                                        <Button type="link" danger onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            removeNotice(notice.notice_from_id);
                                        }}>删除</Button>
                                    </div>
                                }>
                                    <MoreOutlined />
                                </Popover>
                            }>
                                <NoticeMsg notice={notice} onRead={() => {
                                    const tmpList = noticeList.slice();
                                    const index = tmpList.findIndex(item => item.notice_from_id == notice.notice_from_id);
                                    if (index != -1) {
                                        tmpList[index].has_read = true;
                                        setNoticeList(tmpList);
                                    }
                                }} onClick={() => setCurNoticeInfo(notice)} />
                            </List.Item>
                        )} />
                </Tabs.TabPane>
            </Tabs>
            {curNoticeInfo != null && curNoticeInfo.notice_data.AddToProjectFromOrgData !== undefined && (
                <Modal open title="加入项目" okText="加入"
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCurNoticeInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        ackJoinProject(curNoticeInfo.notice_data.AddToProjectFromOrgData?.project_id ?? "");
                    }}>
                    是否加入项目&nbsp;{curNoticeInfo.notice_data.AddToProjectFromOrgData.project_name}&nbsp;?
                </Modal>
            )}
        </>
    );
};

export default observer(UserNoticeList);