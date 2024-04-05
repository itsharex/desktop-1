import React, { useState } from "react";
import { MemberInfo } from "@/api/org_mebmer";
import { Button, Tabs } from "antd";
import { observer } from 'mobx-react';
import OkrList, { EditModal as EditOkrModal } from "./OkrList";
import DayReportList, { EditModal as EditDayReportModal } from "./DayReportList";
import { PlusOutlined } from "@ant-design/icons";
import { useStores } from "@/hooks";


export interface MemberPanelProps {
    curMember: MemberInfo;
}

const MemberPanel = (props: MemberPanelProps) => {
    const userStore = useStores('userStore');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeKey, setActiveKey] = useState<"dayReport" | "weekReport" | "okr">("dayReport");

    const [dayReportDataVersion, setDayReportDataVersion] = useState(0);
    // const [weekReportDataVersion, setWeekReportDataVersion] = useState(0);
    const [okrDataVersion, setOkrDataVersion] = useState(0);

    return (
        <>
            <Tabs activeKey={activeKey} onChange={key => setActiveKey(key as "dayReport" | "weekReport" | "okr")}
                type="card"
                tabBarStyle={{ fontSize: "16px", fontWeight: 600, paddingLeft: "10px", height: "40px" }}
                items={[
                    {
                        key: "dayReport",
                        label: "日报",
                        children: (
                            <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                                <DayReportList memberUserId={props.curMember.member_user_id} dataVersion={dayReportDataVersion} />
                            </div>
                        ),
                    },
                    {
                        key: "weekReport",
                        label: "周报",
                    },
                    {
                        key: "okr",
                        label: "个人目标",
                        children: (
                            <div style={{ height: "calc(100vh - 110px)", overflowY: "scroll", padding: "10px 10px" }}>
                                <OkrList memberUserId={props.curMember.member_user_id} dataVersion={okrDataVersion} />
                            </div>
                        ),
                    }
                ]} tabBarExtraContent={
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
            {showCreateModal == true && activeKey == "weekReport" && "xx"}
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