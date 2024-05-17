//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Descriptions, Table, Form, Modal, Input, message, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import type { UserInfo } from '@/api/user';
import { USER_STATE_NORMAL, USER_STATE_FORBIDDEN, USER_TYPE_INTERNAL } from '@/api/user';
import s from './UserDetail.module.less';
import { EditSelect } from "@/components/EditCell/EditSelect";
import { useHistory, useLocation } from 'react-router-dom';
import { request } from '@/utils/request';
import { get as get_user, reset_password, set_state, set_test_account } from '@/api/user_admin';
import moment from 'moment';
import { list as list_project } from '@/api/project_admin';
import type { ProjectInfo } from '@/api/project';
import type { ColumnsType } from 'antd/es/table';
import { LeftOutlined, LinkOutlined } from '@ant-design/icons';
import Button from '@/components/Button';
import type { ProjectDetailState } from '../ProjectAdmin/ProjectDetail';
import { ADMIN_PATH_ORG_DETAIL_SUFFIX, ADMIN_PATH_PROJECT_DETAIL_SUFFIX } from '@/utils/constant';
import type { OrgInfo } from '@/api/org';
import { list as list_org } from '@/api/org_admin';
import type { OrgDetailState } from '../OrgAdmin/OrgDetail';


export interface UserDetailState {
    userId: string;
};

interface ResetPasswordValues {
    password?: string;
};

const UserDetail = () => {
    const history = useHistory();
    const location = useLocation();

    const state: UserDetailState = location.state as UserDetailState;

    const [resetForm] = Form.useForm();

    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [projectList, setProjectList] = useState<ProjectInfo[]>([]);
    const [orgList, setOrgList] = useState<OrgInfo[]>([]);
    const [showResetModal, setShowResetModal] = useState(false);

    const loadUserInfo = async () => {
        const sessionId = await get_admin_session();
        const res = await request(get_user({
            admin_session_id: sessionId,
            user_id: state.userId,
        }));
        setUserInfo(res.user_info);
    };

    const loadProjectList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_project({
            admin_session_id: sessionId,
            filter_closed: false,
            closed: false,
            filter_by_user_id: true,
            user_id: state.userId,
            filter_by_keyword: false,
            filter_by_remove: true,
            remove: false,
            keyword: "",
            offset: 0,
            limit: 99,
        }));
        setProjectList(res.project_info_list);
    };

    const loadOrgList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_org({
            admin_session_id: sessionId,
            filter_by_user_id: true,
            user_id: state.userId,
            filter_by_keyword: false,
            keyword: "",
            offset: 0,
            limit: 99,
        }));
        setOrgList(res.org_list);
    };

    const prjColumns: ColumnsType<ProjectInfo> = [
        {
            title: "项目名称",
            width: 150,
            render: (_, row: ProjectInfo) => (
                <Button type="link" disabled={!(permInfo?.project_perm.read ?? false)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const prjState: ProjectDetailState = {
                            projectId: row.project_id,
                        };
                        history.push(ADMIN_PATH_PROJECT_DETAIL_SUFFIX, prjState);
                    }}>{row.basic_info.project_name}&nbsp;&nbsp;<LinkOutlined /></Button>
            ),
        },
        {
            title: "状态",
            width: 80,
            render: (_, row: ProjectInfo) => (row.closed ? "关闭" : "打开"),
        },
        {
            title: "超级管理员",
            width: 100,
            dataIndex: "owner_display_name",
        },
    ];

    const orgColumns: ColumnsType<OrgInfo> = [
        {
            title: "团队名称",
            width: 150,
            render: (_, row: OrgInfo) => (
                <Button type="link" disabled={!(permInfo?.org_perm.read ?? false)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const orgState:OrgDetailState = {
                            orgId:row.org_id,
                        }
                        history.push(ADMIN_PATH_ORG_DETAIL_SUFFIX, orgState);
                    }}>
                    {row.basic_info.org_name}&nbsp;&nbsp;<LinkOutlined />
                </Button>
            )
        },
        {
            title: "管理员",
            width: 100,
            dataIndex: "owner_display_name",
        },
        {
            title: "部门数量",
            width: 100,
            dataIndex: "depart_ment_count",
        },
        {
            title: "成员数量",
            width: 100,
            dataIndex: "member_count",
        },
        {
            title: "功能",
            width: 200,
            render: (_, row: OrgInfo) => (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {row.setting.enable_day_report && <Tag>日报</Tag>}
                    {row.setting.enble_week_report && <Tag>周报</Tag>}
                    {row.setting.enable_okr && <Tag>个人目标</Tag>}
                </div>
            )
        }
    ];

    const resetPassword = async () => {
        const values = resetForm.getFieldsValue() as ResetPasswordValues;
        const password = (values.password ?? "").trim();
        if (password == "") {
            message.error("请输入密码");
            return;
        }
        if (password.length < 6) {
            message.error("密码太简单");
            return;
        }
        const sessionId = await get_admin_session();
        await request(reset_password({
            admin_session_id: sessionId,
            user_id: state.userId,
            password: password,
        }));
        setShowResetModal(false);
        message.info("重设密码成功");
    };

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadUserInfo();
        loadProjectList();
        loadOrgList();
    }, [state.userId]);

    return (
        <div className={s.content_wrap}>
            {userInfo != null && permInfo != null && (
                <Descriptions title={
                    <Space>
                        <a onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            history.goBack();
                        }}><LeftOutlined /></a>
                        <span>用户详情({userInfo.user_name})</span>
                    </Space>
                } bordered>
                    <Descriptions.Item label="昵称">{userInfo.basic_info.display_name}</Descriptions.Item>
                    <Descriptions.Item label="体验账号">
                        <EditSelect editable={permInfo.user_perm.set_test_account && userInfo.user_type == USER_TYPE_INTERNAL} curValue={userInfo.test_account ? 1 : 0} itemList={[
                            {
                                label: "是",
                                value: 1,
                                color: "black",
                            },
                            {
                                label: "否",
                                value: 0,
                                color: "black",
                            },
                        ]} onChange={async (value) => {
                            try {
                                const sessionId = await get_admin_session();
                                await request(set_test_account({
                                    admin_session_id: sessionId,
                                    user_id: state.userId,
                                    test_account: value == 1,
                                }));
                                return true;
                            } catch (e) {
                                console.log(e);
                            }
                            return false;
                        }} showEditIcon={true} allowClear={false} />
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                        <EditSelect editable={permInfo.user_perm.set_state && userInfo.user_type == USER_TYPE_INTERNAL} curValue={userInfo.user_state} itemList={[
                            {
                                label: "正常",
                                value: USER_STATE_NORMAL,
                                color: "black",
                            },
                            {
                                label: "禁用",
                                value: USER_STATE_FORBIDDEN,
                                color: "black",
                            },
                        ]} onChange={async (value) => {
                            try {
                                const sessionId = await get_admin_session();
                                await request(set_state({
                                    admin_session_id: sessionId,
                                    user_id: state.userId,
                                    user_state: value as number,
                                }));
                                return true;
                            } catch (e) {
                                console.log(e);
                            }
                            return false;
                        }} showEditIcon={true} allowClear={false} />
                    </Descriptions.Item>
                    <Descriptions.Item label="密码">
                        ******
                        {permInfo?.user_perm.reset_password == true && userInfo.user_type == USER_TYPE_INTERNAL && (
                            <Button type="link" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowResetModal(true);
                            }}>重设密码</Button>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">{userInfo != null && moment(userInfo.create_time).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
                    <Descriptions.Item label="更新时间">{userInfo != null && moment(userInfo.update_time).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
                    <Descriptions.Item label="所在项目" span={3}>
                        <Table rowKey="project_id" columns={prjColumns} dataSource={projectList} pagination={false} />
                    </Descriptions.Item>
                    <Descriptions.Item label="所在团队" span={3}>
                        <Table rowKey="org_id" columns={orgColumns} dataSource={orgList} pagination={false} />
                    </Descriptions.Item>
                </Descriptions>
            )}
            {showResetModal == true && (
                <Modal open title="重设密码"
                    okText="更新密码"
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowResetModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        resetPassword();
                    }}
                >
                    <Form form={resetForm}>
                        <Form.Item label="密码" name="password" rules={[{ required: true, min: 6 }]}>
                            <Input.Password />
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </div>
    );
};

export default UserDetail;