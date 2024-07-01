//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { MemberInfo } from "@/api/org_mebmer";
import { Button, Tabs } from "antd";
import { observer } from 'mobx-react';
import OkrList, { EditModal as EditOkrModal } from "./OkrList";
import DayReportList, { EditModal as EditDayReportModal } from "./DayReportList";
import WeekReportList, { EditModal as EditWeekReportModal } from "./WeekReportList";
import { PlusOutlined } from "@ant-design/icons";
import { useStores } from "@/hooks";
import type { Tab } from "rc-tabs/lib/interface";
import LearnRecordList from "./LearnRecordList";
import UserContentList from "./UserContentList";
import MemberResume from "./MemberResume";

export interface MemberPanelProps {
    curMember: MemberInfo;
    onGotoForum: (newForumId: string, newThreadId: string) => void;
}

const MemberPanel = (props: MemberPanelProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores("orgStore");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeKey, setActiveKey] = useState<"dayReport" | "weekReport" | "okr" | "learnRecord" | "contentList" | "resume" | "">("");

    const [dayReportDataVersion, setDayReportDataVersion] = useState(0);
    const [weekReportDataVersion, setWeekReportDataVersion] = useState(0);
    const [okrDataVersion, setOkrDataVersion] = useState(0);

    const [tabList, setTabList] = useState<Tab[]>([]);

    const calcTabList = () => {
        const tmpList: Tab[] = [];
        if (orgStore.curOrg?.setting.enable_day_report == true) {
            tmpList.push({
                key: "dayReport",
                label: "日报",
                children: (
                    <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                        {activeKey == "dayReport" && (
                            <DayReportList memberUserId={props.curMember.member_user_id} dataVersion={dayReportDataVersion} />
                        )}
                    </div>
                ),
            });
        }
        if (orgStore.curOrg?.setting.enble_week_report == true) {
            tmpList.push({
                key: "weekReport",
                label: "周报",
                children: (
                    <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                        {activeKey == "weekReport" && (
                            <WeekReportList memberUserId={props.curMember.member_user_id} dataVersion={weekReportDataVersion} />
                        )}
                    </div>
                ),
            });
        }
        if (orgStore.curOrg?.setting.enable_okr == true) {
            tmpList.push({
                key: "okr",
                label: "个人目标",
                children: (
                    <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                        {activeKey == "okr" && (
                            <OkrList memberUserId={props.curMember.member_user_id} dataVersion={okrDataVersion} />
                        )}
                    </div>
                ),
            });
        }
        if (userStore.userInfo.featureInfo.enable_skill_center) {
            tmpList.push({
                key: "learnRecord",
                label: "学习记录",
                children: (
                    <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                        {activeKey == "learnRecord" && (
                            <LearnRecordList memberUserId={props.curMember.member_user_id} />
                        )}
                    </div>
                ),
            });
        }
        tmpList.push({
            key: "contentList",
            label: "讨论记录",
            children: (
                <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                    {activeKey == "contentList" && (
                        <UserContentList memberUserId={props.curMember.member_user_id}
                            onClick={(newForumId, newThreadId) => {
                                props.onGotoForum(newForumId, newThreadId);
                            }} />
                    )}
                </div>
            )
        });
        if (props.curMember.has_resume) {
            tmpList.push({
                key: "resume",
                label: "个人信息",
                children: (
                    <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                        {activeKey == "resume" && (
                            <MemberResume memberUserId={props.curMember.member_user_id} />
                        )}
                    </div>
                ),
            });
        }
        if (tmpList.length > 0 && tmpList.map(item => item.key).includes(activeKey) == false) {
            setActiveKey((tmpList[0].key ?? "") as "dayReport" | "weekReport" | "okr" | "learnRecord" | "contentList" | "resume");
        }
        setTabList(tmpList);
    };

    useEffect(() => {
        calcTabList();
    }, [orgStore.curOrg?.setting.enable_day_report, orgStore.curOrg?.setting.enble_week_report,
    orgStore.curOrg?.setting.enable_okr, userStore.userInfo.featureInfo.enable_skill_center,
        activeKey, dayReportDataVersion, weekReportDataVersion, okrDataVersion, props.curMember.has_resume]);

    return (
        <>
            <Tabs activeKey={activeKey} onChange={key => setActiveKey(key as "dayReport" | "weekReport" | "okr" | "learnRecord" | "contentList")}
                type="card"
                tabBarStyle={{ fontSize: "16px", fontWeight: 600, paddingLeft: "10px", height: "40px" }}
                items={tabList} tabBarExtraContent={
                    <div style={{ paddingRight: "10px" }}>
                        {activeKey == "dayReport" && props.curMember.member_user_id == userStore.userInfo.userId && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowCreateModal(true);
                            }}>创建日报</Button>
                        )}
                        {activeKey == "weekReport" && props.curMember.member_user_id == userStore.userInfo.userId && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowCreateModal(true);
                            }}>创建周报</Button>
                        )}
                        {activeKey == "okr" && props.curMember.member_user_id == userStore.userInfo.userId && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowCreateModal(true);
                            }}>创建个人目标</Button>
                        )}
                    </div>
                } />
            {showCreateModal == true && activeKey == "dayReport" && (
                <EditDayReportModal onCancel={() => setShowCreateModal(false)} onOk={() => {
                    setDayReportDataVersion(oldValue => oldValue + 1);
                    setShowCreateModal(false);
                }} />
            )}
            {showCreateModal == true && activeKey == "weekReport" && (
                <EditWeekReportModal onCancel={() => setShowCreateModal(false)} onOk={() => {
                    setWeekReportDataVersion(oldValue => oldValue + 1);
                    setShowCreateModal(false);
                }} />
            )}
            {showCreateModal == true && activeKey == "okr" && (
                <EditOkrModal onCancel={() => setShowCreateModal(false)} onOk={() => {
                    setOkrDataVersion(oldValue => oldValue + 1);
                    setShowCreateModal(false);
                }} />
            )}
        </>
    );
};

export default observer(MemberPanel);