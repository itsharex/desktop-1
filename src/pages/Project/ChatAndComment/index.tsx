import { Badge, Modal, Popover, Space, Tabs, message } from "antd";
import React, { useState } from "react";
import { observer } from 'mobx-react';
import UnreadCommentList from "./UnreadCommentList";
import { useStores } from "@/hooks";
import ChatGroupList from "./ChatGroupList";
import Button from "@/components/Button";
import { DeleteOutlined, LogoutOutlined, MoreOutlined, PlusOutlined, UserAddOutlined, UserSwitchOutlined } from "@ant-design/icons";
import SelectGroupMemberModal from "./components/SelectGroupMemberModal";
import { create_group, update_group, update_group_member, leave_group, remove_group } from "@/api/project_chat";
import { request } from "@/utils/request";
import ChatMsgList from "./ChatMsgList";
import InviteListModal from "./components/InviteListModal";
import MemberList from "./MemberList";
import MemberDetail from "./MemberDetail";

const ChatAndCommentPanel = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');
    const appStore = useStores('appStore');

    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showUpdateGroupModal, setShowUpdateGroupModal] = useState(false);
    const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
    const [showRemoveGroupModal, setShowRemoveGroupModal] = useState(false);
    const [showInviteListModal, setShowInviteListModal] = useState(false);

    const createChatGroup = async (newTitle: string, newUserIdList: string[]) => {
        if (newUserIdList.length < 2) {
            return;
        }
        const res = await request(create_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            title: newTitle,
            member_user_id_list: newUserIdList,
        }));
        projectStore.curProject?.chat_store.onUpdateMember(res.chat_group_id);
        message.info("创建成果");
    };

    const updateChatGroup = async (newTitle: string, newUserIdList: string[]) => {
        if (newTitle != projectStore.curProject?.chat_store.curGroup?.groupInfo.title) {
            await request(update_group({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                chat_group_id: projectStore.curProject?.chat_store.curGroupId ?? "",
                title: newTitle,
            }));
            projectStore.curProject?.chat_store.onUpdateGroup(projectStore.curProject?.chat_store.curGroupId ?? "");
        }
        await request(update_group_member({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: projectStore.curProject?.chat_store.curGroupId ?? "",
            member_user_id_list: newUserIdList,
        }));
        projectStore.curProject?.chat_store.onUpdateMember(projectStore.curProject?.chat_store.curGroupId ?? "");
        message.info("更新成功");
    }

    const leaveGroup = async () => {
        const groupId = projectStore.curProject?.chat_store.curGroupId ?? "";
        await request(leave_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: groupId,
        }));
        await projectStore.curProject?.chat_store.onLeaveGroup(groupId);
        setShowLeaveGroupModal(false);
        message.info("离开沟通群成功");
    };

    const removeGroup = async () => {
        const groupId = projectStore.curProject?.chat_store.curGroupId ?? "";
        await request(remove_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            chat_group_id: groupId,
        }));
        await projectStore.curProject?.chat_store.onLeaveGroup(groupId);
        setShowRemoveGroupModal(false);
        message.info("删除沟通群成功");
    };

    return (
        <>
            <Tabs style={{ width: "100%" }} type="card"
                tabBarStyle={{ height: "45px", marginBottom: "0px" }}
                activeKey={projectStore.showChatAndCommentTab}
                onChange={key => projectStore.setShowChatAndComment(true, (key as ("chat" | "comment" | "member")))}
                items={[
                    {
                        key: "chat",
                        label: (
                            <div style={{ paddingRight: "20px" }}>
                                <Badge count={projectStore.curProject?.chat_store.totalUnread ?? 0} offset={[10, 0]} style={{ padding: '0 3px', height: '16px', lineHeight: '16px' }}>
                                    沟通
                                </Badge>
                            </div>),
                        children: (
                            <div style={{ height: "calc(100vh - 136px)", overflowY: projectStore.curProject?.chat_store.curGroupId == "" ? "auto" : "hidden" }}>
                                {projectStore.showChatAndCommentTab == "chat" && (
                                    <>
                                        {projectStore.curProjectId != "" && projectStore.curProject?.chat_store.curGroupId == "" && <ChatGroupList />}
                                        {projectStore.curProjectId != "" && projectStore.curProject?.chat_store.curGroupId != "" && <ChatMsgList />}
                                    </>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "comment",
                        label: (
                            <div style={{ paddingRight: "20px" }}>
                                <Badge count={projectStore.curProject?.project_status.unread_comment_count ?? 0} offset={[10, 0]} style={{ padding: '0 3px', height: '16px', lineHeight: '16px' }}>
                                    未读评论
                                </Badge>
                            </div>),
                        children: (
                            <div style={{ height: "calc(100vh - 136px)", overflowY: "auto" }}>
                                {projectStore.showChatAndCommentTab == "comment" && (<UnreadCommentList />)}
                            </div>
                        ),
                    },
                    {
                        key: "member",
                        label: "项目成员",
                        children: (
                            <div style={{ height: "calc(100vh - 136px)", overflowY: "hidden" }}>
                                {projectStore.showChatAndCommentTab == "member" && (
                                    <>
                                        {projectStore.curProjectId != "" && memberStore.showDetailMemberId == "" && <MemberList />}
                                        {projectStore.curProjectId != "" && memberStore.showDetailMemberId != "" && <MemberDetail />}
                                    </>
                                )}
                            </div>
                        ),
                    },

                ]} tabBarExtraContent={
                    <div style={{ marginRight: "10px" }}>
                        {projectStore.showChatAndCommentTab == "chat" && (
                            <>
                                {projectStore.curProjectId != "" && projectStore.curProject?.chat_store.curGroupId == "" && (
                                    <Button type="link" icon={<PlusOutlined />} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowCreateGroupModal(true);
                                    }} style={{ minWidth: 0, padding: "0px 0px" }} />
                                )}
                                {projectStore.curProjectId != "" && projectStore.curProject?.chat_store.curGroupId != "" && (
                                    <Space>
                                        {(projectStore.curProject?.chat_store.curGroup?.groupInfo.user_perm.can_update ?? false) == true && (
                                            <Button type="link" icon={<UserSwitchOutlined />} style={{ minWidth: 0, padding: "0px 0px" }}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowUpdateGroupModal(true);
                                                }} />
                                        )}
                                        {projectStore.curProject?.chat_store.curGroupId != projectStore.curProject?.default_chat_group_id && (
                                            <Popover trigger="click" placement="left" content={
                                                <Space direction="vertical">
                                                    <Button type="link" danger icon={<LogoutOutlined />}
                                                        disabled={(projectStore.curProject?.chat_store.curGroup?.groupInfo.user_perm.can_leave ?? false) == false}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setShowLeaveGroupModal(true);
                                                        }}>
                                                        退出沟通群
                                                    </Button>
                                                    <Button type="link" danger icon={<DeleteOutlined />}
                                                        disabled={(projectStore.curProject?.chat_store.curGroup?.groupInfo.user_perm.can_remove ?? false) == false}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setShowRemoveGroupModal(true);
                                                        }}>
                                                        删除沟通群
                                                    </Button>
                                                </Space>
                                            }>
                                                <MoreOutlined />
                                            </Popover>
                                        )}
                                    </Space>

                                )}
                            </>
                        )}
                        {projectStore.showChatAndCommentTab == "member" && (
                            <>
                                {!(projectStore.curProject?.closed) && projectStore.isAdmin && appStore.clientCfg?.can_invite && (
                                    <Space>
                                        <Button style={{ minWidth: 0 }} icon={<UserAddOutlined />}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                memberStore.showInviteMember = true;
                                            }}>邀请成员</Button>
                                        <Popover trigger="click" placement="bottom" content={
                                            <div style={{ padding: "10px 10px" }}>
                                                <Button type="link" onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setShowInviteListModal(true);
                                                }}>查看未过期邀请记录</Button>
                                            </div>
                                        }>
                                            <MoreOutlined />
                                        </Popover>
                                    </Space>
                                )}
                            </>

                        )}
                    </div>
                } />
            {showCreateGroupModal == true && (
                <SelectGroupMemberModal onCancel={() => setShowCreateGroupModal(false)} onOk={(newTitle, newUserIdList) => {
                    createChatGroup(newTitle, newUserIdList).then(() => setShowCreateGroupModal(false));
                }} />
            )}
            {showUpdateGroupModal == true && (
                <SelectGroupMemberModal onCancel={() => setShowUpdateGroupModal(false)} onOk={(newTitle, newUserIdList) => {
                    updateChatGroup(newTitle, newUserIdList).then(() => setShowUpdateGroupModal(false));
                }} />
            )}
            {showLeaveGroupModal == true && projectStore.curProject != undefined && projectStore.curProject.chat_store.curGroup != undefined && (
                <Modal open title="离开沟通群"
                    okText="离开" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowLeaveGroupModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        leaveGroup();
                    }}>
                    是否离开沟通群{projectStore.curProject.chat_store.curGroup.groupInfo.title}?
                </Modal>
            )}
            {showRemoveGroupModal == true && projectStore.curProject != undefined && projectStore.curProject.chat_store.curGroup != undefined && (
                <Modal open title="删除沟通群"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveGroupModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeGroup();
                    }}>
                    是否删除沟通群{projectStore.curProject.chat_store.curGroup.groupInfo.title}?
                </Modal>
            )}
            {showInviteListModal == true && (
                <InviteListModal onClose={() => setShowInviteListModal(false)} />
            )}
        </>
    );
};

export default observer(ChatAndCommentPanel);