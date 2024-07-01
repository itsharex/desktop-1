//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { MenuOutlined } from "@ant-design/icons";
import { Dropdown, message, Modal, Popover } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { MenuProps } from 'antd';
import { useStores } from "@/hooks";
import type { MenuInfo } from 'rc-menu/lib/interface';
import { useHistory } from "react-router-dom";
import { ISSUE_TAB_LIST_TYPE, LinkIdeaPageInfo } from "@/stores/linkAux";
import type { ItemType } from "antd/lib/menu/hooks/useItems";
import { APP_PROJECT_HOME_PATH, APP_PROJECT_MY_WORK_PATH } from "@/utils/constant";
import { ENTRY_TYPE_API_COLL, ENTRY_TYPE_BOARD, ENTRY_TYPE_DATA_ANNO, ENTRY_TYPE_DOC, ENTRY_TYPE_FILE, ENTRY_TYPE_NULL, ENTRY_TYPE_PAGES, ENTRY_TYPE_SPRIT } from "@/api/project_entry";
import { useHotkeys } from 'react-hotkeys-hook';
import HotkeyHelpInfo from "@/pages/Project/Overview/components/HotkeyHelpInfo";
import { MAIN_CONTENT_API_COLL_LIST, MAIN_CONTENT_BOARD_LIST, MAIN_CONTENT_CONTENT_LIST, MAIN_CONTENT_DATA_ANNO_LIST, MAIN_CONTENT_DOC_LIST, MAIN_CONTENT_FILE_LIST, MAIN_CONTENT_PAGES_LIST, MAIN_CONTENT_SPRIT_LIST } from "@/api/project";
import { type FeatureInfo, update_feature, USER_TYPE_INTERNAL } from "@/api/user";
import { get_port, get_token } from '@/api/local_api';
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';
import { request } from "@/utils/request";

const MENU_KEY_USER_LOGIN = "user.login";
const MENU_KEY_USER_LOGOUT = "user.logout";
const MENU_KEY_USER_CHANGE_PASSWORD = "user.changePasswd";
const MENU_KEY_USER_CHANGE_LOGO = "user.changeLogo";
const MENU_KEY_USER_CHANGE_RESUME = "user.changeResume";

const MENU_KEY_USER_SWITCH_ORG = "user.switchOrg";
const MENU_KEY_USER_SWITCH_PROJECT = "user.switchProject";
const MENU_KEY_USER_SWITCH_SKILL_CENTER = "user.switchSkillCenter";

const MENU_KEY_ADMIN_LOGIN = "admin.login";
const MENU_KEY_EXIST_APP = "app.exit";

const MENU_KEY_TEST_LOCALAPI = "localapi.test";

const MENU_KEY_JOIN_PROJECT_OR_ORG = "join.projectOrOrg";


const MENU_KEY_SHOW_INVITE_MEMBER = "invite.member.show";
const MENU_KEY_MEMBER_PREFIX = "member:";
const MENU_KEY_SHOW_TOOL_BAR_IDEA = "toolbar.idea.show"

const MENU_KEY_SHOW_TOOL_BAR_REQUIRE_MENT = "toolbar.requirement.show";
const MENU_KEY_CREATE_REQUIRE_MENT = "create.requirement";

const MENU_KEY_SHOW_TOOL_BAR_TASK_MY = "toolbar.task.my.show";
const MENU_KEY_SHOW_TOOL_BAR_TASK_ALL = "toolbar.task.all.show";
const MENU_KEY_CREATE_TASK = "create.task";

const MENU_KEY_SHOW_TOOL_BAR_BUG_MY = "toolbar.bug.my.show";
const MENU_KEY_SHOW_TOOL_BAR_BUG_ALL = "toolbar.bug.all.show";
const MENU_KEY_CREATE_BUG = "create.bug";

const MENU_KEY_SHOW_TOOL_BAR_TEST_CASE = "toolbar.testcase.show";
const MENU_KEY_CREATE_TEST_CASE = "create.testcase";

const MENU_KEY_SHOW_TOOL_BAR_EVENTS = "toolbar.events.show";
const MENU_KEY_SHOW_TOOL_BAR_EVENTS_SUBSCRIBE = "toolbar.eventsSubscribe.show";
const MENU_KEY_SHOW_TOOL_BAR_EXT_EVENTS = "toolbar.extEvents.show";

const MENU_KEY_SHOW_TOOL_BAR_RECYCLE = "toolbar.recycle.show";
const MENU_KEY_SHOW_TOOL_BAR_OVERVIEW = "toolbar.overview.show";

const MENU_KEY_SHOW_TOOL_BAR_CHAT_AND_COMMENT = "toolbar.chatAndComment.show"


const MENU_KEY_ENTRY_CREATE_SPRIT = "project.entry.sprit.create";
const MENU_KEY_ENTRY_CREATE_DOC = "project.entry.doc.create";
const MENU_KEY_ENTRY_CREATE_PAGES = "project.entry.pages.create";
const MENU_KEY_ENTRY_CREATE_BOARD = "project.entry.board.create";
const MENU_KEY_ENTRY_CREATE_FILE = "project.entry.file.create";
const MENU_KEY_ENTRY_CREATE_API_COLL = "project.entry.apicoll.create";
const MENU_KEY_ENTRY_CREATE_DATA_ANNO = "project.entry.dataanno.create";

const MENU_KEY_HOME_PREFIX = "project.home."
const MENU_KEY_HOME_CONTENT = MENU_KEY_HOME_PREFIX + "content";
const MENU_KEY_HOME_WORK_PLAN = MENU_KEY_HOME_PREFIX + "workplan";
const MENU_KEY_HOME_DOC = MENU_KEY_HOME_PREFIX + "doc";
const MENU_KEY_HOME_BOARD = MENU_KEY_HOME_PREFIX + "board";
const MENU_KEY_HOME_PAGES = MENU_KEY_HOME_PREFIX + "pages";
const MENU_KEY_HOME_FILE = MENU_KEY_HOME_PREFIX + "file";
const MENU_KEY_HOME_APICOLL = MENU_KEY_HOME_PREFIX + "apicoll";
const MENU_KEY_HOME_DATAANNO = MENU_KEY_HOME_PREFIX + "dataanno";


const MENU_KEY_HOME_MYWORK = MENU_KEY_HOME_PREFIX + "mywork";

const MENU_KEY_SHOW_HELP = "help.show"

const ProjectQuickAccess = () => {
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');
    const appStore = useStores('appStore');
    const entryStore = useStores('entryStore');
    const userStore = useStores('userStore');

    const history = useHistory();

    const [items, setItems] = useState<MenuProps['items']>([]);
    const [_, setCreateFlag] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const calcItems = () => {
        const tmpItems: MenuProps['items'] = [];
        if (projectStore.curProjectId != "") {
            tmpItems.push({
                key: "home",
                label: "项目主页",
                children: [
                    {
                        key: MENU_KEY_HOME_CONTENT,
                        label: "内容面板(alt+0)",
                    },
                    {
                        key: MENU_KEY_HOME_WORK_PLAN,
                        label: "工作计划(alt+1)",
                    },
                    {
                        key: MENU_KEY_HOME_DOC,
                        label: "项目文档(alt+2)",
                    },
                    {
                        key: MENU_KEY_HOME_BOARD,
                        label: "信息面板(alt+3)",
                    },
                    {
                        key: MENU_KEY_HOME_PAGES,
                        label: "静态网页(alt+4)",
                    },
                    {
                        key: MENU_KEY_HOME_FILE,
                        label: "项目文件(alt+5)",
                    },
                    {
                        key: MENU_KEY_HOME_APICOLL,
                        label: "接口集合(alt+6)",
                    },
                    {
                        key: MENU_KEY_HOME_MYWORK,
                        label: "我的工作(alt+9)",
                    },
                ],
            });
            const memberItem: ItemType = {
                key: "member",
                label: "成员",
                children: [
                    {
                        key: MENU_KEY_SHOW_INVITE_MEMBER,
                        label: "邀请成员",
                        disabled: projectStore.curProject?.closed || projectStore.isAdmin == false,
                    },
                    {
                        key: "members",
                        label: "成员列表",
                        children: memberStore.memberList.map(item => ({
                            key: `${MENU_KEY_MEMBER_PREFIX}${item.member.member_user_id}`,
                            label: item.member.display_name,
                        })),
                    }
                ]
            };
            tmpItems.push(memberItem);
            tmpItems.push({
                key: "contentEntry",
                label: "内容入口",
                children: [
                    {
                        key: MENU_KEY_ENTRY_CREATE_SPRIT,
                        label: "创建工作计划(ctrl+n w)",
                        disabled: projectStore.isAdmin == false,
                    },
                    {
                        key: MENU_KEY_ENTRY_CREATE_DOC,
                        label: "创建文档(ctrl+n d)",
                    },
                    {
                        key: MENU_KEY_ENTRY_CREATE_PAGES,
                        label: "创建静态网页(ctrl+n p)",
                    },
                    {
                        key: MENU_KEY_ENTRY_CREATE_BOARD,
                        label: "创建信息面板(ctrl+n o)",
                    },
                    {
                        key: MENU_KEY_ENTRY_CREATE_FILE,
                        label: "创建文件(ctrl+n f)",
                    },
                    {
                        key: MENU_KEY_ENTRY_CREATE_API_COLL,
                        label: "创建接口集合(ctrl+n a)"
                    },
                    {
                        key: MENU_KEY_ENTRY_CREATE_DATA_ANNO,
                        label: "创建数据标注(ctrl+n n)"
                    }
                ],
            });
            tmpItems.push({
                key: MENU_KEY_SHOW_TOOL_BAR_CHAT_AND_COMMENT,
                label: "项目沟通(alt+c)",
            });

            tmpItems.push({
                key: MENU_KEY_SHOW_TOOL_BAR_IDEA,
                label: "项目知识点(alt+i)",
            });

            tmpItems.push({
                key: "requirement",
                label: "项目需求",
                children: [
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_REQUIRE_MENT,
                        label: "查看项目需求(alt+r)",
                    },
                    {
                        key: MENU_KEY_CREATE_REQUIRE_MENT,
                        label: "创建项目需求(ctrl+n r)",
                    },
                ],
            });
            tmpItems.push({
                key: "task",
                label: "任务",
                children: [
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_TASK_MY,
                        label: "查看我的任务",
                    },
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_TASK_ALL,
                        label: "查看所有任务(alt+t)",
                    },
                    {
                        key: MENU_KEY_CREATE_TASK,
                        label: "创建任务(ctrl+n t)",
                    }
                ],
            });
            tmpItems.push({
                key: "bug",
                label: "缺陷",
                children: [
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_BUG_MY,
                        label: "查看我的缺陷",
                    },
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_BUG_ALL,
                        label: "查看所有缺陷(alt+b)",
                    },
                    {
                        key: MENU_KEY_CREATE_BUG,
                        label: "创建缺陷(ctrl+n b)",
                    }
                ],
            });
            tmpItems.push({
                key: "testcase",
                label: "测试用例",
                children: [
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_TEST_CASE,
                        label: "查看测试用例",
                    },
                    {
                        key: MENU_KEY_CREATE_TEST_CASE,
                        label: "创建测试用例",
                    },
                ],
            });
            tmpItems.push({
                key: "event",
                label: "研发行为",
                children: [
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_EVENTS,
                        label: "查看工作记录(alt+e)",
                    },
                    {
                        key: MENU_KEY_SHOW_TOOL_BAR_EVENTS_SUBSCRIBE,
                        label: "订阅研发行为",
                        disabled: projectStore.isAdmin == false,
                    },
                ],
            });
            tmpItems.push({
                key: MENU_KEY_SHOW_TOOL_BAR_EXT_EVENTS,
                label: "查看第三方接入",
            });
            tmpItems.push({
                key: MENU_KEY_SHOW_TOOL_BAR_RECYCLE,
                label: "查看回收站"
            });
            tmpItems.push({
                key: MENU_KEY_SHOW_TOOL_BAR_OVERVIEW,
                label: "查看项目信息",
            });
            tmpItems.push({
                key: MENU_KEY_SHOW_HELP,
                label: "快捷键帮助(alt+h)",
            });
        }

        //全局菜单
        if ((appStore.clientCfg?.disable_login ?? false) == false) {
            const userItem: ItemType = {
                key: "user",
                label: "用户",
                children: [],
            };
            if (userStore.sessionId == "") {
                userItem.children.push({
                    key: MENU_KEY_USER_LOGIN,
                    label: "登录",
                });
            } else {
                if (userStore.userInfo.userType == USER_TYPE_INTERNAL && userStore.userInfo.testAccount == false) {
                    userItem.children.push({
                        key: MENU_KEY_USER_CHANGE_PASSWORD,
                        label: "修改密码",
                    });

                    userItem.children.push({
                        key: MENU_KEY_USER_CHANGE_LOGO,
                        label: "修改头像",
                    });
                }
                if (!(userStore.userInfo.userType == USER_TYPE_INTERNAL && userStore.userInfo.testAccount)) {
                    userItem.children.push({
                        key: MENU_KEY_USER_CHANGE_RESUME,
                        label: "修改个人信息",
                    });
                }
                userItem.children.push({
                    key: MENU_KEY_USER_SWITCH_SKILL_CENTER,
                    label: `${userStore.userInfo.featureInfo.enable_skill_center ? "关闭" : "打开"}技能中心`,
                });
                userItem.children.push({
                    key: MENU_KEY_USER_SWITCH_PROJECT,
                    label: `${userStore.userInfo.featureInfo.enable_project ? "关闭" : "打开"}项目特性`,
                });
                userItem.children.push({
                    key: MENU_KEY_USER_SWITCH_ORG,
                    label: `${userStore.userInfo.featureInfo.enable_org ? "关闭" : "打开"}团队特性`,
                });

                userItem.children.push({
                    key: MENU_KEY_USER_LOGOUT,
                    label: "退出登录",
                });
            }
            tmpItems.push(userItem);
        }
        if (userStore.sessionId != "") {
            tmpItems.push({
                key: MENU_KEY_JOIN_PROJECT_OR_ORG,
                label: "加入项目/团队",
            });
        }
        tmpItems.push({
            key: MENU_KEY_TEST_LOCALAPI,
            label: "调试本地接口",
        });
        if (appStore.clientCfg?.enable_admin == true && userStore.sessionId == "") {
            tmpItems.push({
                key: MENU_KEY_ADMIN_LOGIN,
                label: "登录管理后台",
            });
        }
        tmpItems.push({
            key: MENU_KEY_EXIST_APP,
            label: <span style={{ color: "red" }}>关闭应用</span>,
        });

        setItems(tmpItems);
    };

    const openLocalApi = async () => {
        const port = await get_port();
        const token = await get_token();

        const label = "localapi";
        const view = WebviewWindow.getByLabel(label);
        if (view != null) {
            await view.close();
        }
        const pos = await appWindow.innerPosition();

        new WebviewWindow(label, {
            url: `local_api.html?port=${port}&token=${token}`,
            width: 800,
            minWidth: 800,
            height: 600,
            minHeight: 600,
            center: true,
            title: "本地接口调试",
            resizable: true,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
    };

    const gotoHomePage = async (key: string) => {
        if (key != MENU_KEY_HOME_MYWORK) {
            projectStore.projectHome.contentActiveKey = (key == MENU_KEY_HOME_CONTENT ? "folder" : "list");
        }

        let homeType = MAIN_CONTENT_CONTENT_LIST;
        projectStore.projectHome.contentEntryType = ENTRY_TYPE_NULL;
        if (key == MENU_KEY_HOME_WORK_PLAN) {
            homeType = MAIN_CONTENT_SPRIT_LIST;
            projectStore.projectHome.contentEntryType = ENTRY_TYPE_SPRIT;
        } else if (key == MENU_KEY_HOME_DOC) {
            homeType = MAIN_CONTENT_DOC_LIST;
            projectStore.projectHome.contentEntryType = ENTRY_TYPE_DOC;
        } else if (key == MENU_KEY_HOME_BOARD) {
            homeType = MAIN_CONTENT_BOARD_LIST;
            projectStore.projectHome.contentEntryType = ENTRY_TYPE_BOARD;
        } else if (key == MENU_KEY_HOME_PAGES) {
            homeType = MAIN_CONTENT_PAGES_LIST;
            projectStore.projectHome.contentEntryType = ENTRY_TYPE_PAGES;
        } else if (key == MENU_KEY_HOME_FILE) {
            homeType = MAIN_CONTENT_FILE_LIST;
            projectStore.projectHome.contentEntryType = ENTRY_TYPE_FILE;
        } else if (key == MENU_KEY_HOME_APICOLL) {
            homeType = MAIN_CONTENT_API_COLL_LIST;
            projectStore.projectHome.contentEntryType = ENTRY_TYPE_API_COLL;
        } else if (key == MENU_KEY_HOME_DATAANNO) {
            homeType = MAIN_CONTENT_DATA_ANNO_LIST;
            projectStore.projectHome.contentEntryType = ENTRY_TYPE_DATA_ANNO;
        }

        if (appStore.inEdit) {
            appStore.showCheckLeave(() => {
                entryStore.reset();
                projectStore.projectHome.homeType = homeType;
                if (key == MENU_KEY_HOME_MYWORK) {
                    history.push(APP_PROJECT_MY_WORK_PATH);
                } else {
                    history.push(APP_PROJECT_HOME_PATH);
                }
            });
            return;
        }
        entryStore.reset();
        projectStore.projectHome.homeType = homeType;
        if (key == MENU_KEY_HOME_MYWORK) {
            history.push(APP_PROJECT_MY_WORK_PATH);
        } else {
            history.push(APP_PROJECT_HOME_PATH);
        }
    }

    const processMenuKey = async (key: string) => {
        switch (key) {
            case MENU_KEY_USER_LOGIN:
                userStore.showUserLogin = true;
                break;
            case MENU_KEY_USER_LOGOUT:
                if (appStore.inEdit) {
                    message.info("请先保存修改内容");
                    return;
                }
                userStore.showLogout = true;
                userStore.accountsModal = false;
                break;
            case MENU_KEY_USER_CHANGE_PASSWORD:
                userStore.showChangePasswd = true;
                userStore.accountsModal = false;
                break;
            case MENU_KEY_USER_CHANGE_LOGO:
                if (userStore.userInfo.testAccount) {
                    return;
                }
                if (userStore.userInfo.userType != USER_TYPE_INTERNAL) {
                    return;
                }
                userStore.showChangeLogo = true;
                userStore.accountsModal = false;
                break;
            case MENU_KEY_USER_CHANGE_RESUME:
                userStore.showChangeResume = true;
                break;
            case MENU_KEY_ADMIN_LOGIN:
                userStore.showAdminLogin = true;
                break;
            case MENU_KEY_EXIST_APP:
                appStore.showExit = true;
                break;
            case MENU_KEY_TEST_LOCALAPI:
                openLocalApi();
                break;
            case MENU_KEY_JOIN_PROJECT_OR_ORG:
                appStore.showJoinModal = true;
                break;
            case MENU_KEY_USER_SWITCH_ORG:
                {
                    const feature: FeatureInfo = {
                        enable_project: userStore.userInfo.featureInfo.enable_project,
                        enable_org: !userStore.userInfo.featureInfo.enable_org,
                        enable_skill_center: userStore.userInfo.featureInfo.enable_skill_center,
                    };
                    request(update_feature({
                        session_id: userStore.sessionId,
                        feature: feature,
                    })).then(() => userStore.updateFeature(feature));
                }
                break;
            case MENU_KEY_USER_SWITCH_PROJECT:
                {
                    const feature: FeatureInfo = {
                        enable_project: !userStore.userInfo.featureInfo.enable_project,
                        enable_org: userStore.userInfo.featureInfo.enable_org,
                        enable_skill_center: userStore.userInfo.featureInfo.enable_skill_center,
                    };
                    request(update_feature({
                        session_id: userStore.sessionId,
                        feature: feature,
                    })).then(() => userStore.updateFeature(feature));
                }
                break;
            case MENU_KEY_USER_SWITCH_SKILL_CENTER:
                {
                    const feature: FeatureInfo = {
                        enable_project: userStore.userInfo.featureInfo.enable_project,
                        enable_org: userStore.userInfo.featureInfo.enable_org,
                        enable_skill_center: !userStore.userInfo.featureInfo.enable_skill_center,
                    };
                    request(update_feature({
                        session_id: userStore.sessionId,
                        feature: feature,
                    })).then(() => userStore.updateFeature(feature));
                }
                break;

            case MENU_KEY_SHOW_INVITE_MEMBER:
                if (projectStore.curProjectId != "") {
                    projectStore.setShowChatAndComment(true, "member");
                    memberStore.showInviteMember = true;
                    linkAuxStore.pickupToolbar(history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_IDEA:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToLink(new LinkIdeaPageInfo("", projectStore.curProjectId, "", []), history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_REQUIRE_MENT:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToRequirementList(history);
                }
                break;
            case MENU_KEY_CREATE_REQUIRE_MENT:
                if (projectStore.curProjectId != "") {
                    projectStore.projectModal.createRequirement = true;
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_TASK_MY:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToTaskList({
                        stateList: [],
                        execUserIdList: [],
                        checkUserIdList: [],
                        tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME,
                    }, history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_TASK_ALL:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToTaskList({
                        stateList: [],
                        execUserIdList: [],
                        checkUserIdList: [],
                        tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL,
                    }, history);
                }
                break;
            case MENU_KEY_CREATE_TASK:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToCreateTask("", projectStore.curProjectId, history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_BUG_MY:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToBugList({
                        stateList: [],
                        execUserIdList: [],
                        checkUserIdList: [],
                        tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME,
                    }, history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_BUG_ALL:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToBugList({
                        stateList: [],
                        execUserIdList: [],
                        checkUserIdList: [],
                        tabType: ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ALL,
                    }, history);
                }
                break;
            case MENU_KEY_CREATE_BUG:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToCreateBug("", projectStore.curProjectId, history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_TEST_CASE:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToTestCaseList(history);
                }
                break;
            case MENU_KEY_CREATE_TEST_CASE:
                if (projectStore.curProjectId != "") {
                    projectStore.projectModal.setCreateTestCase(true, "", false);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_EVENTS:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToEventList(history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_EVENTS_SUBSCRIBE:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToEventSubscribeList(history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_EXT_EVENTS:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.goToExtEventList(history);
                }
                break;
            case MENU_KEY_ENTRY_CREATE_SPRIT:
                if (projectStore.curProjectId != "" && projectStore.isAdmin) {
                    entryStore.createEntryType = ENTRY_TYPE_SPRIT;
                }
                break;
            case MENU_KEY_ENTRY_CREATE_DOC:
                if (projectStore.curProjectId != "") {
                    entryStore.createEntryType = ENTRY_TYPE_DOC;
                }
                break;
            case MENU_KEY_ENTRY_CREATE_PAGES:
                if (projectStore.curProjectId != "") {
                    entryStore.createEntryType = ENTRY_TYPE_PAGES;
                }
                break;
            case MENU_KEY_ENTRY_CREATE_BOARD:
                if (projectStore.curProjectId != "") {
                    entryStore.createEntryType = ENTRY_TYPE_BOARD;
                }
                break;
            case MENU_KEY_ENTRY_CREATE_FILE:
                if (projectStore.curProjectId != "") {
                    entryStore.createEntryType = ENTRY_TYPE_FILE;
                }
                break;
            case MENU_KEY_ENTRY_CREATE_API_COLL:
                if (projectStore.curProjectId != "") {
                    entryStore.createEntryType = ENTRY_TYPE_API_COLL;
                }
                break;
            case MENU_KEY_ENTRY_CREATE_DATA_ANNO:
                if (projectStore.curProjectId != "") {
                    entryStore.createEntryType = ENTRY_TYPE_DATA_ANNO;
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_OVERVIEW:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.gotoOverview(history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_RECYCLE:
                if (projectStore.curProjectId != "") {
                    linkAuxStore.gotoRecycle(history);
                }
                break;
            case MENU_KEY_SHOW_TOOL_BAR_CHAT_AND_COMMENT:
                if (projectStore.curProjectId != "") {
                    if (!projectStore.showChatAndComment) {
                        linkAuxStore.pickupToolbar(history);
                    }
                    projectStore.setShowChatAndComment(!projectStore.showChatAndComment, "chat");
                }
                break;
            case MENU_KEY_SHOW_HELP:
                if (projectStore.curProjectId != "") {
                    setShowHelp(oldValue => !oldValue);
                }
                break;
            default:
                if (projectStore.curProjectId != "" && key.startsWith(MENU_KEY_HOME_PREFIX)) {
                    gotoHomePage(key);
                }
        }
        if (projectStore.curProjectId != "" && key.startsWith(MENU_KEY_MEMBER_PREFIX)) {
            const memberUserId = key.substring(MENU_KEY_MEMBER_PREFIX.length);
            memberStore.showDetailMemberId = memberUserId;
            projectStore.setShowChatAndComment(true, "member");
            linkAuxStore.pickupToolbar(history);
        }
    }

    const onMenuClick = async (info: MenuInfo) => {
        processMenuKey(info.key);
    }

    useHotkeys("alt+0", () => processMenuKey(MENU_KEY_HOME_CONTENT));
    useHotkeys("alt+1", () => processMenuKey(MENU_KEY_HOME_WORK_PLAN));
    useHotkeys("alt+2", () => processMenuKey(MENU_KEY_HOME_DOC));
    useHotkeys("alt+3", () => processMenuKey(MENU_KEY_HOME_BOARD));
    useHotkeys("alt+4", () => processMenuKey(MENU_KEY_HOME_PAGES));
    useHotkeys("alt+5", () => processMenuKey(MENU_KEY_HOME_FILE));
    useHotkeys("alt+6", () => processMenuKey(MENU_KEY_HOME_APICOLL));
    useHotkeys("alt+7", () => processMenuKey(MENU_KEY_HOME_DATAANNO));
    useHotkeys("alt+9", () => processMenuKey(MENU_KEY_HOME_MYWORK));
    useHotkeys("alt+c", () => processMenuKey(MENU_KEY_SHOW_TOOL_BAR_CHAT_AND_COMMENT));
    useHotkeys("alt+i", () => processMenuKey(MENU_KEY_SHOW_TOOL_BAR_IDEA));
    useHotkeys("alt+r", () => processMenuKey(MENU_KEY_SHOW_TOOL_BAR_REQUIRE_MENT));
    useHotkeys("alt+t", () => processMenuKey(MENU_KEY_SHOW_TOOL_BAR_TASK_ALL));
    useHotkeys("alt+b", () => processMenuKey(MENU_KEY_SHOW_TOOL_BAR_BUG_ALL));
    useHotkeys("alt+e", () => processMenuKey(MENU_KEY_SHOW_TOOL_BAR_EVENTS));
    useHotkeys("alt+h", () => processMenuKey(MENU_KEY_SHOW_HELP));

    useHotkeys("ctrl+n", () => {
        setCreateFlag(true);
        setTimeout(() => {
            setCreateFlag(oldValue => {
                if (oldValue) {
                    processMenuKey(MENU_KEY_ENTRY_CREATE_SPRIT);
                }
                return false;
            });
        }, 1000);
    });

    useHotkeys("w", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_ENTRY_CREATE_SPRIT);
            }
            return false;
        });
    });

    useHotkeys("d", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_ENTRY_CREATE_DOC);
            }
            return false;
        });
    });

    useHotkeys("o", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_ENTRY_CREATE_BOARD);
            }
            return false;
        });
    });

    useHotkeys("p", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_ENTRY_CREATE_PAGES);
            }
            return false;
        });
    });

    useHotkeys("f", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_ENTRY_CREATE_FILE);
            }
            return false;
        });
    });

    useHotkeys("r", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_CREATE_REQUIRE_MENT);
            }
            return false;
        });
    });

    useHotkeys("t", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_CREATE_TASK);
            }
            return false;
        });
    });

    useHotkeys("b", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_CREATE_BUG);
            }
            return false;
        });
    });

    useHotkeys("a", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_ENTRY_CREATE_API_COLL);
            }
            return false;
        });
    });

    useHotkeys("n", () => {
        setCreateFlag(oldValue => {
            if (oldValue) {
                processMenuKey(MENU_KEY_ENTRY_CREATE_DATA_ANNO);
            }
            return false;
        });
    });

    useEffect(() => {
        if (appStore.clientCfg !== undefined) {
            calcItems();
        }
    }, [projectStore.curProject?.setting, projectStore.curProjectId, memberStore.memberList, orgStore.curOrgId, appStore.clientCfg, userStore.sessionId,
    userStore.userInfo.featureInfo.enable_org, userStore.userInfo.featureInfo.enable_project, userStore.userInfo.featureInfo.enable_skill_center]);

    return (
        <>
            <Popover placement='left' overlayClassName="global_help"
                open={appStore.showHelp} content="项目快捷菜单">
                <Dropdown overlayStyle={{ minWidth: "100px" }} menu={{ items, subMenuCloseDelay: 0.05, onClick: (info: MenuInfo) => onMenuClick(info) }} trigger={["click"]} >
                    <a onClick={(e) => e.preventDefault()} style={{ margin: "0px 10px", color: "orange", fontSize: "18px" }} title="项目快捷菜单">
                        <MenuOutlined />
                    </a>
                </Dropdown >
            </Popover>
            {showHelp == true && (
                <Modal open title="快捷键帮助" footer={null}
                    bodyStyle={{ height: "calc(100vh - 300px)", overflowY: "scroll", padding: "0px 0px" }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowHelp(false);
                    }}>
                    <HotkeyHelpInfo />
                </Modal>
            )}
        </>
    );
};

export default observer(ProjectQuickAccess);