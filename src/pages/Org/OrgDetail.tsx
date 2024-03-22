import React, { useState } from "react";
import { observer } from 'mobx-react';
import s from "./OrgDetail.module.less";
import { useStores } from "@/hooks";
import { Button, Card } from "antd";
import { ReadOnlyEditor } from "@/components/Editor";
import UpdateOrgModal from "./components/UpdateOrgModal";
import type { DepartMentOrMember } from "@/api/org";
import OrgTree from "./components/OrgTree";

const OrgDetail = () => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [showUpdateOrgModal, setShowUpdateOrgModal] = useState(false);
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
                        <OrgTree curItem={curDepartMentOrMember} onChange={newItem=>setCurDepartMentOrMember(newItem)}/>
                    </div>
                    <Card bordered={false} title="团队简介" className={s.desc} bodyStyle={{ overflowY: "scroll", height: "160px" }}
                        extra={
                            <>
                                {orgStore.curOrg != undefined && userStore.userInfo.userId == orgStore.curOrg.owner_user_id && (
                                    <Button type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowUpdateOrgModal(true);
                                    }}>修改简介</Button>
                                )}
                            </>
                        }>
                        <ReadOnlyEditor content={orgStore.curOrg?.basic_info.org_desc ?? ""} />
                    </Card>
                </div>
            </div>
            <div className={s.right}>
                xx
            </div>

            {orgStore.curOrg != undefined && showUpdateOrgModal == true && (
                <UpdateOrgModal orgInfo={orgStore.curOrg} onClose={() => setShowUpdateOrgModal(false)} />
            )}
        </div>
    );
};

export default observer(OrgDetail);