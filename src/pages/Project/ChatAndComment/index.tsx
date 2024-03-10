import { Badge, Tabs, message } from "antd";
import React, { useState } from "react";
import { observer } from 'mobx-react';
import UnreadCommentList from "./UnreadCommentList";
import { useStores } from "@/hooks";
import ChatGroupList from "./ChatGroupList";
import Button from "@/components/Button";
import SelectGroupMemberModal from "./components/SelectGroupMemberModal";
import { create_group } from "@/api/project_chat";
import { request } from "@/utils/request";
import ChatMsgList from "./ChatMsgList";
import BulletinList from "./BulletinList";

const ChatAndCommentPanel = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

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

    return (
        <>
            <Tabs style={{ width: "100%" }} type="card"
                tabBarStyle={{ height: "45px", marginBottom: "0px" }}
                activeKey={projectStore.showChatAndCommentTab}
                onChange={key => projectStore.setShowChatAndComment(true, (key as ("chat" | "comment" | "bulletin" | "member")))}
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
                        key: "bulletin",
                        label: (
                            <div style={{ paddingRight: "20px" }}>
                                <Badge count={(projectStore.curProject?.project_status.bulletin_count ?? 0)} offset={[10, 0]} style={{ padding: '0 3px', height: '16px', lineHeight: '16px' }}>
                                    公告
                                </Badge>
                            </div>
                        ),
                        children: (
                            <div style={{ height: "calc(100vh - 136px)", overflowY: "hidden" }}>
                                {projectStore.showChatAndCommentTab == "bulletin" && (<BulletinList />)}
                            </div>
                        )
                    },
                ]} tabBarExtraContent={
                    <div style={{ marginRight: "10px" }}>
                        {projectStore.showChatAndCommentTab == "chat" && (
                            <>
                                {projectStore.curProjectId != "" && projectStore.curProject?.chat_store.curGroupId == "" && (
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowCreateGroupModal(true);
                                    }}  >创建沟通群</Button>
                                )}
                            </>
                        )}
                        {projectStore.showChatAndCommentTab == "bulletin" && projectStore.isAdmin && !projectStore.isClosed && (
                            <Button onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                projectStore.projectModal.createBulletin = true;
                            }}>发布公告</Button>
                        )}
                    </div>
                } />
            {showCreateGroupModal == true && (
                <SelectGroupMemberModal onCancel={() => setShowCreateGroupModal(false)} onOk={(newTitle, newUserIdList) => {
                    createChatGroup(newTitle, newUserIdList).then(() => setShowCreateGroupModal(false));
                }} />
            )}
        </>
    );
};

export default observer(ChatAndCommentPanel);