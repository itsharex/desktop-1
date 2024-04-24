import React, { useState } from "react";
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
import ForumThreadList from "./components/ForumThreadList";

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
                            <MemberPanel curMember={curDepartMentOrMember.value as MemberInfo} />
                        )}
                    </>
                )}
                {curOrgForumInfo != null && curForumThreadId == "" && (
                    <ForumThreadList forumInfo={curOrgForumInfo} onChange={newThreadId => setCurForumThreadId(newThreadId)}
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
            </div>
        </div>
    );
};

export default observer(OrgDetail);