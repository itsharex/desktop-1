import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import s from "./OrgDetail.module.less";
import { useStores } from "@/hooks";
import type { DepartMentInfo, DepartMentOrMember } from "@/api/org";
import OrgTree from "./components/OrgTree";
import DepartMentPanel from "./components/DepartMentPanel";
import MemberPanel from "./components/MemberPanel";
import type { MemberInfo } from "@/api/org_mebmer";
import OrgForumList from "./components/OrgForumList";
import type { OrgForumInfo } from "@/api/org_forum";
import { get_forum } from "@/api/org_forum";
import ForumThreadList from "./components/ForumThreadList";
import ThreadContentList from "./components/ThreadContentList";
import { request } from "@/utils/request";

const OrgDetail = () => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [curDepartMentOrMember, setCurDepartMentOrMember] = useState<DepartMentOrMember>({
        type: "member",
        id: userStore.userInfo.userId,
        value: orgStore.memberList.find(item => item.member_user_id == userStore.userInfo.userId),
    });
    const [curOrgForumInfo, setCurOrgForumInfo] = useState<OrgForumInfo | null>(null);
    const [curForumThreadId, setCurForumThreadId] = useState("");
    const [curThreadPage, setCurThreadPage] = useState(0);

    const goToForumThread = async (newForumId: string, newThreadId: string) => {
        const res = await request(get_forum({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: newForumId,
        }));
        setCurOrgForumInfo(res.forum_info);
        setCurForumThreadId(newThreadId);
        setCurThreadPage(0);
        setCurDepartMentOrMember({
            type: "member",
            id: "__NOT_EXIST_USER",
            value: undefined,
        });
    };

    useEffect(() => {
        if (orgStore.curOrgId != "") {
            setCurForumThreadId("");
            setCurThreadPage(0);
            setCurOrgForumInfo(null);
            let count = 0;
            const t = setInterval(() => {
                count += 1;
                if (count > 20) {
                    clearInterval(t);
                    return;
                }
                const member = orgStore.memberList.find(item => item.member_user_id == userStore.userInfo.userId);
                if (member != undefined) {
                    clearInterval(t);
                    setCurDepartMentOrMember({
                        type: "member",
                        id: userStore.userInfo.userId,
                        value: member,
                    });
                }
            }, 100);

        }
    }, [orgStore.curOrgId]);

    return (
        <div className={s.detail_wrap}>
            <div className={s.left}>
                <div className={s.menu_wrap}>
                    <div className={s.menu}>
                        <OrgTree curItem={curDepartMentOrMember} onChange={newItem => {
                            setCurDepartMentOrMember(newItem);
                            setCurOrgForumInfo(null);
                        }} />
                    </div>
                    <OrgForumList curOrgForumId={curOrgForumInfo?.forum_id ?? ""} onChange={newForumInfo => {
                        setCurOrgForumInfo(newForumInfo);
                        setCurForumThreadId("");
                        setCurThreadPage(0);
                        if (newForumInfo != null) {
                            setCurDepartMentOrMember({
                                type: "member",
                                id: "__NOT_EXIST_USER",
                                value: undefined,
                            });
                        } else {
                            setCurDepartMentOrMember({
                                type: "member",
                                id: userStore.userInfo.userId,
                                value: orgStore.memberList.find(item => item.member_user_id == userStore.userInfo.userId),
                            });
                        }
                    }} />
                </div>
            </div>
            <div className={s.right}>
                {curOrgForumInfo == null && (
                    <>
                        {curDepartMentOrMember.type == "departMent" && (
                            <DepartMentPanel curDepartMent={curDepartMentOrMember.value as (DepartMentInfo | undefined)}
                                onSelect={newItem => setCurDepartMentOrMember(newItem)} />
                        )}
                        {curDepartMentOrMember.type == "member" && curDepartMentOrMember.value !== undefined && (
                            <MemberPanel curMember={curDepartMentOrMember.value as MemberInfo}
                                onGotoForum={(newForumId, newThreadId) => {
                                    goToForumThread(newForumId, newThreadId);
                                }} />
                        )}
                    </>
                )}
                {curOrgForumInfo != null && curForumThreadId == "" && (
                    <ForumThreadList curPage={curThreadPage} onChangePage={newPage => setCurThreadPage(newPage)}
                        forumInfo={curOrgForumInfo} onChange={newThreadId => setCurForumThreadId(newThreadId)}
                        onClickMember={memberUserId => {
                            setCurOrgForumInfo(null);
                            setCurForumThreadId("");
                            setCurDepartMentOrMember({
                                type: "member",
                                id: memberUserId,
                                value: orgStore.memberList.find(item => item.member_user_id == memberUserId),
                            });
                        }} />
                )}
                {curOrgForumInfo != null && curForumThreadId != "" && (
                    <ThreadContentList forumInfo={curOrgForumInfo} threadId={curForumThreadId} onBack={() => setCurForumThreadId("")} />
                )}
            </div>
        </div>
    );
};

export default observer(OrgDetail);