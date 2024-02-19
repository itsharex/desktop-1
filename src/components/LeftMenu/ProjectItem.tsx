import React, { useState } from "react";
import cls from './index.module.less';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { Badge, Tooltip } from "antd";
import { APP_PROJECT_HOME_PATH, APP_PROJECT_MY_WORK_PATH, PROJECT_HOME_TYPE } from "@/utils/constant";
import { CaretRightFilled, FolderFilled } from "@ant-design/icons";
import { useHistory, useLocation } from "react-router-dom";
import type { WebProjectInfo } from "@/stores/project";

const HotkeyWrap = (props: { title: string, hotkey: string }) => {
    const [hover, setHover] = useState(false);
    return (
        <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {props.title}
            {hover == true && (
                <span>
                    &nbsp;({props.hotkey})
                </span>
            )}
        </span>
    )
}

const ProjectItem: React.FC<{ item: WebProjectInfo }> = ({ item }) => {
    const location = useLocation();
    const history = useHistory();

    const appStore = useStores('appStore');
    const projectStore = useStores('projectStore');
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
                                projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT;
                                history.push(APP_PROJECT_HOME_PATH);
                            });
                        });
                        return;
                    }
                    projectStore.setCurProjectId(item.project_id).then(() => {
                        entryStore.reset();
                        projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT;
                        history.push(APP_PROJECT_HOME_PATH);
                    });
                }}><FolderFilled style={{ color: item.project_id == projectStore.curProjectId ? "white" : "inherit" }} />
                    &nbsp;<Tooltip title={item.project_id == projectStore.curProjectId ? "快捷键:alt+0":""} placement="right" color="cyan">{item.basic_info.project_name}</Tooltip>
                </span>
            </div>
            {item.project_id == projectStore.curProjectId && (
                <div>
                    <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_WORK_PLAN_LIST ? cls.active_sub_menu : ""}`}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (appStore.inEdit) {
                                appStore.showCheckLeave(() => {
                                    projectStore.setCurProjectId(item.project_id).then(() => {
                                        entryStore.reset();
                                        projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_WORK_PLAN_LIST;
                                        history.push(APP_PROJECT_HOME_PATH);
                                    });
                                });
                                return;
                            }
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_WORK_PLAN_LIST;
                                history.push(APP_PROJECT_HOME_PATH);
                            });
                        }}><CaretRightFilled /><HotkeyWrap title="工作计划" hotkey="alt+1" /></div>
                    <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_DOC_LIST ? cls.active_sub_menu : ""}`}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (appStore.inEdit) {
                                appStore.showCheckLeave(() => {
                                    projectStore.setCurProjectId(item.project_id).then(() => {
                                        entryStore.reset();
                                        projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_DOC_LIST;
                                        history.push(APP_PROJECT_HOME_PATH);
                                    });
                                });
                                return;
                            }
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_DOC_LIST;
                                history.push(APP_PROJECT_HOME_PATH);
                            });
                        }}><CaretRightFilled /><HotkeyWrap title="项目文档" hotkey="alt+2" /></div>
                    <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_BOARD_LIST ? cls.active_sub_menu : ""}`}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (appStore.inEdit) {
                                appStore.showCheckLeave(() => {
                                    projectStore.setCurProjectId(item.project_id).then(() => {
                                        entryStore.reset();
                                        projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_BOARD_LIST;
                                        history.push(APP_PROJECT_HOME_PATH);
                                    });
                                });
                                return;
                            }
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_BOARD_LIST;
                                history.push(APP_PROJECT_HOME_PATH);
                            });
                        }}><CaretRightFilled /><HotkeyWrap title="信息面板" hotkey="alt+3" /></div>
                    <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_PAGES_LIST ? cls.active_sub_menu : ""}`}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (appStore.inEdit) {
                                appStore.showCheckLeave(() => {
                                    projectStore.setCurProjectId(item.project_id).then(() => {
                                        entryStore.reset();
                                        projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_PAGES_LIST;
                                        history.push(APP_PROJECT_HOME_PATH);
                                    });
                                });
                                return;
                            }
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_PAGES_LIST;
                                history.push(APP_PROJECT_HOME_PATH);
                            });
                        }}><CaretRightFilled /><HotkeyWrap title="静态网页" hotkey="alt+4" /></div>
                    <div className={`${cls.project_sub_menu} ${location.pathname.startsWith(APP_PROJECT_MY_WORK_PATH) ? cls.active_sub_menu : ""}`}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (appStore.inEdit) {
                                appStore.showCheckLeave(() => {
                                    projectStore.setCurProjectId(item.project_id).then(() => {
                                        entryStore.reset();
                                        projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT;
                                        history.push(APP_PROJECT_MY_WORK_PATH);
                                    });
                                });
                                return;
                            }
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT;
                                history.push(APP_PROJECT_MY_WORK_PATH);
                            });
                        }}><CaretRightFilled /><HotkeyWrap title="我的工作" hotkey="alt+9" /></div>
                </div>
            )}
        </div>
    );
};

export default observer(ProjectItem);