//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import cls from './index.module.less';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";

import ProjectItem from "./ProjectItem";
import CreatedOrJoinProject from "./CreatedOrJoinProject";
import InviteProjectMember from "./InviteProjectMember";
import { ProjectOutlined } from "@ant-design/icons";
import classNames from "classnames";
import { useHistory, useLocation } from "react-router-dom";
import { APP_PROJECT_MANAGER_PATH } from "@/utils/constant";


const ProjectList = () => {
    const location = useLocation();
    const history = useHistory();

    const appStore = useStores('appStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');
    const memberStore = useStores('memberStore');

    return (
        <div className={cls.project_menu}>
            <div className={classNames(cls.menu_title, location.pathname.startsWith(APP_PROJECT_MANAGER_PATH) ? cls.active_menu : "")}>
                <div style={{ width: "120px", cursor: "pointer" }} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (appStore.inEdit) {
                        appStore.showCheckLeave(() => {
                            projectStore.setCurProjectId("");
                            orgStore.setCurOrgId("");
                            history.push(APP_PROJECT_MANAGER_PATH);
                        });
                    } else {
                        projectStore.setCurProjectId("");
                        orgStore.setCurOrgId("");
                        history.push(APP_PROJECT_MANAGER_PATH);
                    }
                }}>
                    <ProjectOutlined style={{ width: "20px" }} />项目
                </div>

            </div>
            <div style={{ maxHeight: "calc(50vh - 150px)", overflowY: "scroll" }}>
                {projectStore.projectList.map(item => (
                    <div key={item.project_id} className={cls.project_child_menu}>
                        <ProjectItem item={item} />
                    </div>
                ))}
            </div>

            {appStore.showCreateOrJoinProject && <CreatedOrJoinProject
                visible={appStore.showCreateOrJoinProject}
                onChange={(val) => (appStore.showCreateOrJoinProject = val)}
            />}
            {
                memberStore.showInviteMember && <InviteProjectMember
                    visible={memberStore.showInviteMember}
                    onChange={(val) => memberStore.showInviteMember = val} />
            }
        </div>
    )
};

export default observer(ProjectList);