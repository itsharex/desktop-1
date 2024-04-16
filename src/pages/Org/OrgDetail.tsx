import React, { useState } from "react";
import { observer } from 'mobx-react';
import s from "./OrgDetail.module.less";
import { useStores } from "@/hooks";
import { Card } from "antd";
import { ReadOnlyEditor } from "@/components/Editor";
import type { DepartMentInfo, DepartMentOrMember } from "@/api/org";
import OrgTree from "./components/OrgTree";
import DepartMentPanel from "./components/DepartMentPanel";
import MemberPanel from "./components/MemberPanel";
import type { MemberInfo } from "@/api/org_mebmer";

const OrgDetail = () => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [curDepartMentOrMember, setCurDepartMentOrMember] = useState<DepartMentOrMember>({
        type: "member",
        id: userStore.userInfo.userId,
        value: orgStore.memberList.find(item => item.member_user_id == userStore.userInfo.userId),
    });

    return (
        <div className={s.detail_wrap}>
            <div className={s.left}>
                <div className={s.menu_wrap}>
                    <div className={s.menu}>
                        <OrgTree curItem={curDepartMentOrMember} onChange={newItem => setCurDepartMentOrMember(newItem)} />
                    </div>
                    <Card bordered={false} title="团队简介" className={s.desc} bodyStyle={{ overflowY: "scroll", height: "160px" }}
                        headStyle={{ backgroundColor: "#eee", fontWeight: 600 }}>
                        <ReadOnlyEditor content={orgStore.curOrg?.basic_info.org_desc ?? ""} />
                    </Card>
                </div>
            </div>
            <div className={s.right}>
                {curDepartMentOrMember.type == "departMent" && (
                    <DepartMentPanel curDepartMent={curDepartMentOrMember.value as (DepartMentInfo | undefined)}
                        onSelect={newItem => setCurDepartMentOrMember(newItem)} />
                )}
                {curDepartMentOrMember.type == "member" && curDepartMentOrMember.value !== undefined && (
                    <MemberPanel curMember={curDepartMentOrMember.value as MemberInfo} />
                )}
            </div>
        </div>
    );
};

export default observer(OrgDetail);