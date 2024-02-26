import React, { useState } from "react";
import cls from './index.module.less';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { Badge, Tooltip } from "antd";
import { APP_PROJECT_HOME_PATH, APP_PROJECT_MY_WORK_PATH } from "@/utils/constant";
import { CaretRightFilled, FolderFilled } from "@ant-design/icons";
import { useHistory, useLocation } from "react-router-dom";
import type { WebProjectInfo } from "@/stores/project";
import { MAIN_CONTENT_BOARD_LIST, MAIN_CONTENT_CONTENT_LIST, MAIN_CONTENT_DOC_LIST, MAIN_CONTENT_MY_WORK, MAIN_CONTENT_PAGES_LIST, MAIN_CONTENT_SPRIT_LIST } from "@/api/project";

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

    const calcHotKey = (): string => {
        if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_CONTENT_LIST) {
            return "alt+0";
        } else if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_SPRIT_LIST) {
            return "alt+1";
        } else if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_DOC_LIST) {
            return "alt+2";
        } else if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_BOARD_LIST) {
            return "alt+3";
        } else if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_PAGES_LIST) {
            return "alt+4";
        } else if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_MY_WORK) {
            return "alt+9";
        }
        return "";
    }

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
                                projectStore.projectHome.homeType = projectStore.curProject?.setting.main_content ?? MAIN_CONTENT_CONTENT_LIST;
                                if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_MY_WORK) {
                                    history.push(APP_PROJECT_MY_WORK_PATH);
                                } else {
                                    history.push(APP_PROJECT_HOME_PATH);
                                }
                            });
                        });
                        return;
                    }
                    projectStore.setCurProjectId(item.project_id).then(() => {
                        entryStore.reset();
                        projectStore.projectHome.homeType = projectStore.curProject?.setting.main_content ?? MAIN_CONTENT_CONTENT_LIST;
                        if (projectStore.curProject?.setting.main_content == MAIN_CONTENT_MY_WORK) {
                            history.push(APP_PROJECT_MY_WORK_PATH);
                        } else {
                            history.push(APP_PROJECT_HOME_PATH);
                        }
                    });
                }}><FolderFilled style={{ color: item.project_id == projectStore.curProjectId ? "white" : "inherit" }} />
                    &nbsp;<Tooltip title={item.project_id == projectStore.curProjectId ? `快捷键:${calcHotKey()}` : ""} placement="right" color="cyan">{item.basic_info.project_name}</Tooltip>
                </span>
            </div>
            {item.project_id == projectStore.curProjectId && (
                <div>

                    {projectStore.curProject?.setting.main_content != MAIN_CONTENT_CONTENT_LIST && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_CONTENT_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                            }}><CaretRightFilled /><HotkeyWrap title="内容面板" hotkey="alt+0" /></div>

                    )}

                    {projectStore.curProject?.setting.main_content != MAIN_CONTENT_SPRIT_LIST && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_SPRIT_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_SPRIT_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_SPRIT_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                            }}><CaretRightFilled /><HotkeyWrap title="工作计划" hotkey="alt+1" /></div>

                    )}

                    {projectStore.curProject?.setting.main_content != MAIN_CONTENT_DOC_LIST && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_DOC_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_DOC_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_DOC_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                            }}><CaretRightFilled /><HotkeyWrap title="项目文档" hotkey="alt+2" /></div>
                    )}

                    {projectStore.curProject?.setting.main_content != MAIN_CONTENT_BOARD_LIST && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_BOARD_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_BOARD_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_BOARD_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                            }}><CaretRightFilled /><HotkeyWrap title="信息面板" hotkey="alt+3" /></div>
                    )}

                    {projectStore.curProject?.setting.main_content != MAIN_CONTENT_PAGES_LIST && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_PAGES_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_PAGES_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_PAGES_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                            }}><CaretRightFilled /><HotkeyWrap title="静态网页" hotkey="alt+4" /></div>
                    )}
                    {projectStore.curProject?.setting.main_content != MAIN_CONTENT_MY_WORK && (
                        <div className={`${cls.project_sub_menu} ${location.pathname.startsWith(APP_PROJECT_MY_WORK_PATH) ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                                            history.push(APP_PROJECT_MY_WORK_PATH);
                                        });
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                                    history.push(APP_PROJECT_MY_WORK_PATH);
                                });
                            }}><CaretRightFilled /><HotkeyWrap title="我的工作" hotkey="alt+9" /></div>
                    )}
                </div>
            )}
        </div>
    );
};

export default observer(ProjectItem);