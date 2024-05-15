//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import cls from './index.module.less';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { Badge } from "antd";
import { APP_PROJECT_HOME_PATH } from "@/utils/constant";
import { FolderFilled } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import type { WebProjectInfo } from "@/stores/project";
import { MAIN_CONTENT_CONTENT_LIST } from "@/api/project";

const ProjectItem: React.FC<{ item: WebProjectInfo }> = ({ item }) => {
    const history = useHistory();

    const appStore = useStores('appStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');
    const entryStore = useStores('entryStore');


    return (
        <div className={cls.project_child_wrap}>
            <div className={`${cls.project_child_title} ${item.closed && cls.close} ${item.project_id == projectStore.curProjectId ? cls.active_menu : ""}`}>
                {item.project_id !== projectStore.curProjectId &&
                    <Badge count={item.project_status.total_count + item.chat_store.totalUnread} className={cls.badge} />
                }

                <span className={cls.name} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (appStore.inEdit) {
                        appStore.showCheckLeave(() => {
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                                history.push(APP_PROJECT_HOME_PATH);
                            });
                            orgStore.setCurOrgId("");
                            appStore.curExtraMenu = null;
                        });
                        return;
                    }
                    projectStore.setCurProjectId(item.project_id).then(() => {
                        entryStore.reset();
                        projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                        history.push(APP_PROJECT_HOME_PATH);
                    });
                    orgStore.setCurOrgId("");
                    appStore.curExtraMenu = null;
                }}><FolderFilled style={{ color: item.project_id == projectStore.curProjectId ? "white" : "inherit" }} />
                    &nbsp;{item.basic_info.project_name}
                </span>
            </div>
        </div>
    );
};

export default observer(ProjectItem);