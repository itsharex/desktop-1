//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Descriptions, Space, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import s from './ProjectDetail.module.less';
import { useHistory, useLocation } from 'react-router-dom';
import { get as get_project, update as update_project } from '@/api/project_admin';
import type { ProjectInfo } from '@/api/project';
import { request } from '@/utils/request';
import { list as list_member } from '@/api/project_member_admin';
import type { MemberInfo } from '@/api/project_member';
import type { ColumnsType } from 'antd/es/table';
import Button from '@/components/Button';
import type { UserDetailState } from "../UserAdmin/UserDetail";
import { ADMIN_PATH_USER_DETAIL_SUFFIX } from '@/utils/constant';
import { LeftOutlined, LinkOutlined } from '@ant-design/icons';
import moment from 'moment';
import { EditText } from '@/components/EditCell/EditText';
import { useLocalObservable, observer } from 'mobx-react';
import { runInAction } from 'mobx';
import ProjectEvList from './components/ProjectEvList';

export interface ProjectDetailState {
    projectId: string;
};

const ProjectDetail = () => {
    const history = useHistory();
    const location = useLocation();
    const state: ProjectDetailState = location.state as ProjectDetailState;

    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);

    const localStore = useLocalObservable(() => ({
        memberInfoList: [] as MemberInfo[],
        setMemberInfoList(infoList: MemberInfo[]) {
            runInAction(() => {
                this.memberInfoList = infoList;
            });
        },
    }));

    const loadProjectInfo = async () => {
        const sessionId = await get_admin_session();
        const res = await request(get_project({
            admin_session_id: sessionId,
            project_id: state.projectId,
        }));
        setProjectInfo(res.project_info);
    };



    const loadMemberList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_member({
            admin_session_id: sessionId,
            project_id: state.projectId,
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
            title: "成员角色",
            width: 100,
            render: (_, row: MemberInfo) => (
                <>
                    {row.member_user_id == projectInfo?.owner_user_id && "超级管理员"}
                    {row.member_user_id != projectInfo?.owner_user_id && row.role_name}
                </>
            ),
        },
        {
            title: "加入时间",
            width: 150,
            render: (_, row: MemberInfo) => (
                moment(row.create_time).format("YYYY-MM-DD HH:mm:ss")
            ),

        },
        {
            title: "更新时间",
            width: 150,
            render: (_, row: MemberInfo) => (
                moment(row.update_time).format("YYYY-MM-DD HH:mm:ss")
            ),
        }
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadProjectInfo();
        loadMemberList();
    }, [])

    return (
        <div className={s.content_wrap}>
            <Descriptions title={
                <Space>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        history.goBack();
                    }}><LeftOutlined /></a>
                    <span>项目详情</span>
                </Space>
            } bordered>
                <Descriptions.Item label="项目名称">{projectInfo != null && (
                    <EditText editable={projectInfo.closed == false && permInfo?.project_perm.update == true} content={projectInfo.basic_info.project_name} onChange={async (value) => {
                        const prjName = value.trim();
                        if (prjName == "") {
                            return false;
                        }
                        if (projectInfo == null) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_project({
                                admin_session_id: sessionId,
                                project_id: state.projectId,
                                basic_info: {
                                    project_name: prjName,
                                    project_desc: projectInfo.basic_info.project_desc,
                                },
                                owner_user_id: projectInfo.owner_user_id,
                            }));
                            return true;
                        } catch (e) {
                            console.log(e);
                        }
                        return false;
                    }} showEditIcon={true} />
                )}</Descriptions.Item>
                <Descriptions.Item label="项目状态">{projectInfo != null && (projectInfo.closed ? "关闭" : "打开")}</Descriptions.Item>
                <Descriptions.Item label="超级管理员">{projectInfo?.owner_display_name ?? ""}</Descriptions.Item>
                <Descriptions.Item label="项目成员" span={3}>
                    <Table rowKey="member_user_id" columns={memberColumns} dataSource={localStore.memberInfoList} pagination={false} />
                </Descriptions.Item>
                {permInfo?.project_perm.access_event == true && (
                    <Descriptions.Item label="项目事件" span={3}>
                        <ProjectEvList projectId={state.projectId} memberList={localStore.memberInfoList} />
                    </Descriptions.Item>
                )}
            </Descriptions>
        </div>
    );
};

export default observer(ProjectDetail);