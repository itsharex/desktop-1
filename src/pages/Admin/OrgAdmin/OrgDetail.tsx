//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import { AdminPermInfo, get_admin_perm, get_admin_session } from '@/api/admin_auth';
import type { OrgInfo } from '@/api/org';
import type { MemberInfo } from '@/api/org_mebmer';
import { runInAction } from 'mobx';
import { useLocalObservable, observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router-dom';
import { get as get_org, update as update_org } from "@/api/org_admin";
import { request } from '@/utils/request';
import { list as list_member } from "@/api/org_member_admin";
import type { ColumnsType } from 'antd/es/table';
import { Button, Descriptions, Space, Table, Tag } from 'antd';
import { UserDetailState } from '../UserAdmin/UserDetail';
import { ADMIN_PATH_USER_DETAIL_SUFFIX } from '@/utils/constant';
import { LeftOutlined, LinkOutlined } from '@ant-design/icons';
import moment from 'moment';
import s from "./OrgDetail.module.less";
import { EditText } from '@/components/EditCell/EditText';

export interface OrgDetailState {
    orgId: string;
}

const OrgDetail = () => {
    const history = useHistory();
    const location = useLocation();
    const state: OrgDetailState = location.state as OrgDetailState;

    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);

    const localStore = useLocalObservable(() => ({
        memberInfoList: [] as MemberInfo[],
        setMemberInfoList(infoList: MemberInfo[]) {
            runInAction(() => {
                this.memberInfoList = infoList;
            });
        },
    }));

    const loadOrgInfo = async () => {
        const sessionId = await get_admin_session();
        const res = await request(get_org({
            admin_session_id: sessionId,
            org_id: state.orgId,
        }));
        setOrgInfo(res.org_info);
    };

    const loadMemberList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_member({
            admin_session_id: sessionId,
            org_id: state.orgId,
        }));
        localStore.setMemberInfoList(res.member_info_list);
    };

    const memberColumns: ColumnsType<MemberInfo> = [
        {
            title: "成员昵称",
            width: 100,
            render: (_, row: MemberInfo) => (
                <Button type="link"
                    style={{ minWidth: 0, paddingLeft: 0 }}
                    disabled={!(permInfo?.user_perm.read ?? false)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const userState: UserDetailState = {
                            userId: row.member_user_id,
                        };
                        history.push(ADMIN_PATH_USER_DETAIL_SUFFIX, userState);
                    }}><LinkOutlined />&nbsp;{row.display_name}</Button>
            ),
        },
        {
            title: "加入时间",
            width: 150,
            render: (_, row: MemberInfo) => (
                moment(row.create_time).format("YYYY-MM-DD HH:mm:ss")
            ),

        },
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadOrgInfo();
        loadMemberList();
    }, []);


    return (
        <div className={s.content_wrap}>
            <Descriptions title={
                <Space>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        history.goBack();
                    }}><LeftOutlined /></a>
                    <span>团队详情</span>
                </Space>
            } bordered>
                <Descriptions.Item label="团队名称">
                    {orgInfo != null && (
                        <EditText editable={permInfo?.org_perm.update ?? false} content={orgInfo.owner_display_name}
                            onChange={async value => {
                                if (value.trim() == "") {
                                    return false;
                                }
                                if (orgInfo == null) {
                                    return false;
                                }
                                try {
                                    const sessionId = await get_admin_session();
                                    await request(update_org({
                                        admin_session_id: sessionId,
                                        org_id: state.orgId,
                                        basic_info: {
                                            ...orgInfo.basic_info,
                                            org_name: value.trim(),
                                        },
                                    }));
                                    await loadOrgInfo();
                                    return true;
                                } catch (e) {
                                    console.log(e);
                                    return false;
                                }
                            }} showEditIcon />
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="部门数量">
                    {orgInfo?.depart_ment_count ?? 0}
                </Descriptions.Item>
                <Descriptions.Item label="管理员">
                    {orgInfo?.owner_display_name ?? ""}
                </Descriptions.Item>
                <Descriptions.Item label="功能" span={3}>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {orgInfo?.setting.enable_day_report && <Tag>日报</Tag>}
                        {orgInfo?.setting.enble_week_report && <Tag>周报</Tag>}
                        {orgInfo?.setting.enable_okr && <Tag>个人目标</Tag>}
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="团队成员" span={3}>
                    <Table rowKey="member_user_id" columns={memberColumns} dataSource={localStore.memberInfoList} pagination={false} />
                </Descriptions.Item>
            </Descriptions>

        </div>
    );
};

export default observer(OrgDetail);