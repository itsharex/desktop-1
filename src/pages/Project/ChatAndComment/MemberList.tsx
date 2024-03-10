import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useHistory } from "react-router-dom";
import { useStores } from "@/hooks";
import type { RoleInfo } from "@/api/project_member";
import { request } from "@/utils/request";
import { list_role, set_member_role, remove_member, leave as leave_project } from '@/api/project_member';
import { Button, Modal, Select, Table, message } from "antd";
import type { WebMemberInfo } from "@/stores/member";
import type { ColumnsType } from 'antd/es/table';
import { change_owner } from "@/api/project";
import { MinusCircleOutlined } from "@ant-design/icons";
import UserPhoto from "@/components/Portrait/UserPhoto";

const MemberList = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const memberStore = useStores('memberStore');
    const projectStore = useStores('projectStore');

    const [roleList, setRoleList] = useState<RoleInfo[]>([]);
    const [removeMemberUserId, setRemoveMemberUserId] = useState("");
    const [ownerMemberUserId, setOwnerMemberUserId] = useState("");

    const loadRoleList = async () => {
        const res = await request(list_role(userStore.sessionId, projectStore.curProjectId));
        if (res) {
            setRoleList(res.role_list);
        }
    };

    const updateMemberRole = async (memberUserId: string, roleId: string) => {
        await set_member_role(userStore.sessionId, projectStore.curProjectId, roleId, memberUserId);
        memberStore.updateMemberRole(memberUserId, roleId);
        message.info("修改角色成功");
    };

    const changeOwner = async () => {
        await request(change_owner(userStore.sessionId, projectStore.curProjectId, ownerMemberUserId));

        await projectStore.updateProject(projectStore.curProjectId);
        await memberStore.updateMemberInfo(projectStore.curProjectId, userStore.userInfo.userId);
        setOwnerMemberUserId("");
        message.info("转移超级管理员权限成功");
    };

    const removeMember = async () => {
        await request(remove_member(userStore.sessionId, projectStore.curProjectId, removeMemberUserId));
        await memberStore.loadMemberList(projectStore.curProjectId);
        setRemoveMemberUserId("");
        message.info("移除用户成功");
    };

    const leaveProject = async () => {
        await request(leave_project(userStore.sessionId, projectStore.curProjectId));
        setRemoveMemberUserId("");
        projectStore.removeProject(projectStore.curProjectId, history);
        message.info("退出项目成功");
    };

    const columns: ColumnsType<WebMemberInfo> = [
        {
            title: "用户昵称",
            render: (_, row: WebMemberInfo) => (
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    memberStore.showDetailMemberId = row.member.member_user_id;
                }}>
                    <UserPhoto logoUri={row.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                    &nbsp;&nbsp;{row.member.display_name}
                </a>
            ),
        },
        {
            title: "用户角色",
            width: 120,
            render: (_, row: WebMemberInfo) => (
                <div>
                    {row.member.is_project_owner == true && "超级管理员"}
                    {row.member.is_project_owner == false && (
                        <Select value={row.member.role_id}
                            style={{ width: 100 }}
                            disabled={!projectStore.isAdmin} onChange={value => {
                                if (value == "") {
                                    setOwnerMemberUserId(row.member.member_user_id);
                                } else {
                                    updateMemberRole(row.member.member_user_id, value);
                                }
                            }}>
                            {projectStore.curProject?.owner_user_id == userStore.userInfo.userId && (
                                <Select.Option value="">超级管理员</Select.Option>
                            )}
                            {roleList.map(item => (
                                <Select.Option value={item.role_id} key={item.role_id}>
                                    {item.basic_info.role_name}
                                </Select.Option>
                            ))}
                        </Select>
                    )}
                </div>
            )
        },
        {
            title: "操作",
            width: 90,
            render: (_, row: WebMemberInfo) => (
                <div>
                    {userStore.userInfo.userId == row.member.member_user_id && userStore.userInfo.userId != (projectStore.curProject?.owner_user_id ?? "") && (
                        <Button type="link"
                            style={{ minWidth: 0, padding: "0px 0px" }} danger
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setRemoveMemberUserId(row.member.member_user_id);
                            }}>退出项目</Button>
                    )}
                    {userStore.userInfo.userId != row.member.member_user_id && (
                        <Button
                            type="link"
                            style={{ minWidth: 0, padding: "0px 0px" }}
                            disabled={projectStore.isClosed || !projectStore.isAdmin}
                            danger
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setRemoveMemberUserId(row.member.member_user_id);
                            }}
                        >
                            <MinusCircleOutlined />
                            移除
                        </Button>
                    )}
                </div>
            ),
        }
    ];

    useEffect(() => {
        loadRoleList();
    }, [projectStore.curProjectId]);

    return (
        <>
            <Table rowKey="member_user_id" dataSource={memberStore.memberList} pagination={false} columns={columns}
                scroll={{ y: "calc(100vh - 160px)" }}/>
            {ownerMemberUserId != "" && (
                <Modal
                    title="转移超级管理员"
                    open
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOwnerMemberUserId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        changeOwner();
                    }}>
                    是否把<b>&nbsp;超级管理员&nbsp;</b>转移给 {memberStore.getMember(ownerMemberUserId)?.member.display_name ?? ""}?
                </Modal>
            )}
            {removeMemberUserId != "" && (
                <Modal title={userStore.userInfo.userId == removeMemberUserId ? "退出项目" : "移除人员"} open
                    okButtonProps={{ danger: true }}
                    okText={userStore.userInfo.userId == removeMemberUserId ? "退出" : "移除"}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveMemberUserId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (userStore.userInfo.userId == removeMemberUserId) {
                            leaveProject();
                        } else {
                            removeMember();
                        }
                    }}>
                    <div
                        style={{
                            fontSize: '14px',
                            lineHeight: '20px',
                            marginBottom: '20px',
                            color: ' #2C2D2E',
                        }}
                    >
                        {userStore.userInfo.userId == removeMemberUserId && "是否确定退出项目?"}
                        {userStore.userInfo.userId != removeMemberUserId &&
                            <span>是否确认移除成员 {memberStore.getMember(removeMemberUserId)?.member.display_name ?? ""}？</span>
                        }
                    </div>
                </Modal>
            )}
        </>
    );
};

export default observer(MemberList);