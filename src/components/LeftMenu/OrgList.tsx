//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import cls from './index.module.less';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from "react-router-dom";
import classNames from "classnames";
import { APP_ORG_MANAGER_PATH, APP_ORG_PATH } from "@/utils/constant";
import { TeamOutlined } from "@ant-design/icons";
import { useStores } from "@/hooks";
import CreatedOrJoinOrg from "./CreatedOrJoinOrg";
import InviteOrgMember from "./InviteOrgMember";

const OrgList = () => {
    const location = useLocation();
    const history = useHistory();

    const appStore = useStores('appStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');

    return (
        <div className={cls.project_menu}>
            <div className={classNames(cls.menu_title, location.pathname.startsWith(APP_ORG_MANAGER_PATH) ? cls.active_menu : "")}>
                <div style={{ width: "120px", cursor: "pointer" }} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (appStore.inEdit) {
                        appStore.showCheckLeave(() => {
                            projectStore.setCurProjectId("");
                            orgStore.setCurOrgId("");
                            history.push(APP_ORG_MANAGER_PATH);
                        });
                    } else {
                        projectStore.setCurProjectId("");
                        orgStore.setCurOrgId("");
                        history.push(APP_ORG_MANAGER_PATH);
                    }
                }}>
                    <TeamOutlined style={{ width: "20px" }} />团队
                </div>
            </div>

            <div style={{ maxHeight: "calc(50vh - 150px)", overflowY: "scroll" }}>
                {orgStore.orgList.map(item => (
                    <div key={item.org_id} className={cls.project_child_menu}>
                        <div className={cls.project_child_wrap}>
                            <div className={`${cls.project_child_title} ${item.org_id == orgStore.curOrgId ? cls.active_menu : ""}`}>
                                <span className={cls.name} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (appStore.inEdit) {
                                        appStore.showCheckLeave(() => {
                                            orgStore.setCurOrgId(item.org_id).then(() => {
                                                history.push(APP_ORG_PATH);
                                            });
                                            projectStore.setCurProjectId("");
                                        });
                                        return;
                                    }
                                    orgStore.setCurOrgId(item.org_id).then(() => {
                                        history.push(APP_ORG_PATH);
                                    });
                                    projectStore.setCurProjectId("");
                                }}>
                                    {item.basic_info.org_name}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {appStore.showCreateOrJoinOrg && <CreatedOrJoinOrg
                visible={appStore.showCreateOrJoinOrg}
                onChange={(val) => (appStore.showCreateOrJoinOrg = val)}
            />}

            {orgStore.showInviteMember && <InviteOrgMember visible={orgStore.showInviteMember} onChange={val => orgStore.showInviteMember = val} />}
        </div>
    );
};

export default observer(OrgList);