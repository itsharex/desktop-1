//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, message, Modal, Space, Table } from "antd";
import { useHistory } from "react-router-dom";
import { useStores } from "@/hooks";
import type { OrgInfo } from "@/api/org";
import { update_org } from "@/api/org";
import { leave as leave_org } from "@/api/org_mebmer";
import { request } from "@/utils/request";
import type { ColumnsType } from 'antd/lib/table';
import { EditText } from "@/components/EditCell/EditText";
import { APP_ORG_PATH } from "@/utils/constant";
import UserPhoto from "@/components/Portrait/UserPhoto";
import RemoveOrgModal from "./components/RemoveOrgModal";


const OrgManager = () => {
    const history = useHistory();

    const appStore = useStores('appStore');
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');

    const [leaverOrgInfo, setLeaverOrgInfo] = useState<OrgInfo | null>(null);
    const [removeOrgInfo, setRemoveOrgInfo] = useState<OrgInfo | null>(null);


    const leaveOrg = async () => {
        if (leaverOrgInfo == null) {
            return;
        }
        const orgId = leaverOrgInfo.org_id;
        await request(leave_org({
            session_id: userStore.sessionId,
            org_id: orgId,
        }));
        orgStore.onLeave(orgId, userStore.userInfo.userId, history);
        setLeaverOrgInfo(null);
        message.info("退出团队成功");
    };

    const columns: ColumnsType<OrgInfo> = [
        {
            title: "团队名称",
            render: (_, row: OrgInfo) => (
                <Space>
                    <EditText editable={row.owner_user_id == userStore.userInfo.userId}
                        content={row.basic_info.org_name} onChange={async value => {
                            if (value.trim() == "") {
                                return false;
                            }
                            try {
                                await request(update_org({
                                    session_id: userStore.sessionId,
                                    org_id: row.org_id,
                                    basic_info: {
                                        org_name: value,
                                        org_desc: row.basic_info.org_desc,
                                    },
                                }));
                                return true;
                            } catch (e) {
                                console.log(e);
                                return false;
                            }
                        }} showEditIcon={true} onClick={() => {
                            projectStore.setCurProjectId("");
                            orgStore.setCurOrgId(row.org_id);
                            history.push(APP_ORG_PATH);
                        }} />
                </Space>
            ),
        },
        {
            title: "部门数量",
            dataIndex: "depart_ment_count",
            width: 100,
        },
        {
            title: "成员数量",
            dataIndex: "member_count",
            width: 100,
        },
        {
            title: "管理员",
            width: 150,
            render: (_, row: OrgInfo) => (
                <Space style={{ overflow: "hidden", textOverflow: "clip", whiteSpace: "nowrap" }}>
                    <UserPhoto logoUri={row.owner_logo_uri} style={{ width: "20px", borderRadius: "10px" }} />
                    <span>{row.owner_display_name}</span>
                </Space>
            ),
        },
        {
            title: "操作",
            width: 150,
            render: (_, row: OrgInfo) => (
                <Space>
                    {row.owner_user_id == userStore.userInfo.userId && (
                        <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setRemoveOrgInfo(row);
                            }}>删除团队</Button>
                    )}
                    {row.owner_user_id != userStore.userInfo.userId && (
                        <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setLeaverOrgInfo(row);
                            }}>退出团队</Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Card title="团队列表" extra={
            <Button type="primary" onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                appStore.showCreateOrJoinOrg = true;
            }}>创建/加入团队</Button>
        }
            headStyle={{ fontSize: "18px" }}
            bodyStyle={{ height: "calc(100vh - 90px)", overflow: "hidden" }}>
            <Table rowKey="org_id" dataSource={orgStore.orgList} columns={columns} pagination={false} scroll={{ y: "calc(100vh - 170px)" }} />
            {leaverOrgInfo !== null && (
                <Modal open title={`退出团队 ${leaverOrgInfo.basic_info.org_name}`}
                    okText="退出" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setLeaverOrgInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        leaveOrg();
                    }}>
                    <p>是否退出团队&nbsp;{leaverOrgInfo.basic_info.org_name}&nbsp;?</p>
                    <p>退出团队需要重新邀请才能进入团队</p>
                </Modal>
            )}
            {removeOrgInfo !== null && (
                <RemoveOrgModal orgInfo={removeOrgInfo} onClose={() => setRemoveOrgInfo(null)} />
            )}
        </Card>
    );
}

export default observer(OrgManager);