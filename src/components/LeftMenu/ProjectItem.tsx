//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import cls from './index.module.less';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { Badge, Tooltip } from "antd";
import { APP_PROJECT_HOME_PATH, APP_PROJECT_MY_WORK_PATH } from "@/utils/constant";
import { CaretRightFilled, FolderFilled } from "@ant-design/icons";
import { useHistory, useLocation } from "react-router-dom";
import type { WebProjectInfo } from "@/stores/project";
import { MAIN_CONTENT_API_COLL_LIST, MAIN_CONTENT_BOARD_LIST, MAIN_CONTENT_CONTENT_LIST, MAIN_CONTENT_DATA_ANNO_LIST, MAIN_CONTENT_DOC_LIST, MAIN_CONTENT_FILE_LIST, MAIN_CONTENT_PAGES_LIST, MAIN_CONTENT_SPRIT_LIST } from "@/api/project";

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
                        });
                        return;
                    }
                    projectStore.setCurProjectId(item.project_id).then(() => {
                        entryStore.reset();
                        projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                        history.push(APP_PROJECT_HOME_PATH);
                    });
                    orgStore.setCurOrgId("");
                }}><FolderFilled style={{ color: item.project_id == projectStore.curProjectId ? "white" : "inherit" }} />
                    &nbsp;<Tooltip title={item.project_id == projectStore.curProjectId ? `快捷键:alt+0` : ""} placement="right" color="cyan">{item.basic_info.project_name}</Tooltip>
                </span>
            </div>
            {item.project_id == projectStore.curProjectId && (
                <div>
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
                                    orgStore.setCurOrgId("");
                                });
                                return;
                            }
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = MAIN_CONTENT_SPRIT_LIST;
                                history.push(APP_PROJECT_HOME_PATH);
                            });
                            orgStore.setCurOrgId("");
                        }}><CaretRightFilled /><HotkeyWrap title="工作计划" hotkey="alt+1" /></div>

                    {projectStore.curProject?.setting.enable_entry_doc == true && (
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
                                        orgStore.setCurOrgId("");
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_DOC_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                                orgStore.setCurOrgId("");
                            }}><CaretRightFilled /><HotkeyWrap title="项目文档" hotkey="alt+2" /></div>
                    )}

                    {projectStore.curProject?.setting.enable_entry_board == true && (
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
                                        orgStore.setCurOrgId("");
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_BOARD_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                                orgStore.setCurOrgId("");
                            }}><CaretRightFilled /><HotkeyWrap title="信息面板" hotkey="alt+3" /></div>
                    )}

                    {projectStore.curProject?.setting.enable_entry_pages == true && (
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
                                        orgStore.setCurOrgId("");
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_PAGES_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                    orgStore.setCurOrgId("");
                                });
                            }}><CaretRightFilled /><HotkeyWrap title="静态网页" hotkey="alt+4" /></div>
                    )}



                    {projectStore.curProject?.setting.enable_entry_file == true && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_FILE_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_FILE_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                        orgStore.setCurOrgId("");
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_FILE_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                                orgStore.setCurOrgId("");
                            }}><CaretRightFilled /><HotkeyWrap title="项目文件" hotkey="alt+5" /></div>
                    )}

                    {projectStore.curProject?.setting.enable_entry_api_coll == true && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_API_COLL_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_API_COLL_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                        orgStore.setCurOrgId("");
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_API_COLL_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                                orgStore.setCurOrgId("");
                            }}><CaretRightFilled /><HotkeyWrap title="接口集合" hotkey="alt+6" /></div>
                    )}

                    {projectStore.curProject?.setting.enable_entry_data_anno == true && (
                        <div className={`${cls.project_sub_menu} ${projectStore.projectHome.homeType == MAIN_CONTENT_DATA_ANNO_LIST ? cls.active_sub_menu : ""}`}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (appStore.inEdit) {
                                    appStore.showCheckLeave(() => {
                                        projectStore.setCurProjectId(item.project_id).then(() => {
                                            entryStore.reset();
                                            projectStore.projectHome.homeType = MAIN_CONTENT_DATA_ANNO_LIST;
                                            history.push(APP_PROJECT_HOME_PATH);
                                        });
                                        orgStore.setCurOrgId("");
                                    });
                                    return;
                                }
                                projectStore.setCurProjectId(item.project_id).then(() => {
                                    entryStore.reset();
                                    projectStore.projectHome.homeType = MAIN_CONTENT_DATA_ANNO_LIST;
                                    history.push(APP_PROJECT_HOME_PATH);
                                });
                                orgStore.setCurOrgId("");
                            }}><CaretRightFilled /><HotkeyWrap title="数据标注" hotkey="alt+7" /></div>
                    )}


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
                                    orgStore.setCurOrgId("");
                                });
                                return;
                            }
                            projectStore.setCurProjectId(item.project_id).then(() => {
                                entryStore.reset();
                                projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
                                history.push(APP_PROJECT_MY_WORK_PATH);
                            });
                            orgStore.setCurOrgId("");
                        }}><CaretRightFilled /><HotkeyWrap title="我的工作" hotkey="alt+9" /></div>

                </div>
            )}
        </div>
    );
};

export default observer(ProjectItem);