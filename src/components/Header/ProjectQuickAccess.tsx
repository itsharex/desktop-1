import { MenuOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { MenuProps } from 'antd';
import { useStores } from "@/hooks";
import type { MenuInfo } from 'rc-menu/lib/interface';
import { useHistory } from "react-router-dom";
import { LinkIdeaPageInfo } from "@/stores/linkAux";
import type { ItemType } from "antd/lib/menu/hooks/useItems";
import { APP_PROJECT_HOME_PATH, APP_PROJECT_MY_WORK_PATH, PROJECT_HOME_TYPE } from "@/utils/constant";
import { ENTRY_TYPE_API_COLL, ENTRY_TYPE_BOARD, ENTRY_TYPE_DATA_ANNO, ENTRY_TYPE_DOC, ENTRY_TYPE_FILE, ENTRY_TYPE_PAGES, ENTRY_TYPE_SPRIT } from "@/api/project_entry";

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

const MENU_KEY_SHOW_TOOL_BAR_OVERVIEW = "toolbar.overview.show";


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
const MENU_KEY_HOME_MYWORK = MENU_KEY_HOME_PREFIX + "mywork";

const ProjectQuickAccess = () => {
    const memberStore = useStores('memberStore');
    const linkAuxStore = useStores('linkAuxStore');
    const projectStore = useStores('projectStore');
    const appStore = useStores('appStore');
    const entryStore = useStores('entryStore');

    const history = useHistory();

    const [items, setItems] = useState<MenuProps['items']>([]);

    const calcItems = () => {
        const tmpItems: MenuProps['items'] = [
            {
                key: "home",
                label: "项目主页",
                children: [
                    {
                        key: MENU_KEY_HOME_CONTENT,
                        label: "内容面板",
                    },
                    {
                        key: MENU_KEY_HOME_WORK_PLAN,
                        label: "工作计划",
                    },
                    {
                        key: MENU_KEY_HOME_DOC,
                        label: "项目文档",
                    },
                    {
                        key: MENU_KEY_HOME_BOARD,
                        label: "信息面板",
                    },
                    {
                        key: MENU_KEY_HOME_PAGES,
                        label: "静态网页",
                    },
                    {
                        key: MENU_KEY_HOME_MYWORK,
                        label: "我的工作",
                    },
                ],
            },
        ];
        const memberItem: ItemType = {
            key: "member",
            label: "成员",
            children: [
                {
                    key: MENU_KEY_SHOW_INVITE_MEMBER,
                    label: "邀请成员",
                    disabled: projectStore.curProject?.closed || appStore.clientCfg?.can_invite == false || projectStore.isAdmin == false,
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
                    label: "创建工作计划",
                },
                {
                    key: MENU_KEY_ENTRY_CREATE_DOC,
                    label: "创建文档",
                },
                {
                    key: MENU_KEY_ENTRY_CREATE_PAGES,
                    label: "创建静态网页",
                },
                {
                    key: MENU_KEY_ENTRY_CREATE_BOARD,
                    label: "创建信息面板",
                },
                {
                    key: MENU_KEY_ENTRY_CREATE_FILE,
                    label: "创建文件",
                },
                {
                    key: MENU_KEY_ENTRY_CREATE_API_COLL,
                    label: "创建接口集合"
                },
                {
                    key: MENU_KEY_ENTRY_CREATE_DATA_ANNO,
                    label: "创建数据标注"
                },
            ],
        });

        tmpItems.push({
            key: MENU_KEY_SHOW_TOOL_BAR_IDEA,
            label: "项目知识点",
        });

        tmpItems.push({
            key: "requirement",
            label: "项目需求",
            children: [
                {
                    key: MENU_KEY_SHOW_TOOL_BAR_REQUIRE_MENT,
                    label: "查看项目需求",
                },
                {
                    key: MENU_KEY_CREATE_REQUIRE_MENT,
                    label: "创建项目需求",
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
                    label: "查看所有任务",
                },
                {
                    key: MENU_KEY_CREATE_TASK,
                    label: "创建任务",
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
                    label: "查看所有缺陷",
                },
                {
                    key: MENU_KEY_CREATE_BUG,
                    label: "创建缺陷",
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
                    label: "查看研发行为",
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
            key: MENU_KEY_SHOW_TOOL_BAR_OVERVIEW,
            label: "查看项目信息",
        });
        setItems(tmpItems);
    };

    const gotoHomePage = async (key: string) => {
        let homeType = PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT;
        if (key == MENU_KEY_HOME_WORK_PLAN) {
            homeType = PROJECT_HOME_TYPE.PROJECT_HOME_WORK_PLAN_LIST;
        } else if (key == MENU_KEY_HOME_DOC) {
            homeType = PROJECT_HOME_TYPE.PROJECT_HOME_DOC_LIST;
        } else if (key == MENU_KEY_HOME_BOARD) {
            homeType = PROJECT_HOME_TYPE.PROJECT_HOME_BOARD_LIST;
        } else if (key == MENU_KEY_HOME_PAGES) {
            homeType = PROJECT_HOME_TYPE.PROJECT_HOME_PAGES_LIST;
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

    const onMenuClick = async (info: MenuInfo) => {
        switch (info.key) {
            case MENU_KEY_SHOW_INVITE_MEMBER:
                projectStore.setShowChatAndComment(true, "member");
                memberStore.showInviteMember = true;
                break;
            case MENU_KEY_SHOW_TOOL_BAR_IDEA:
                linkAuxStore.goToLink(new LinkIdeaPageInfo("", projectStore.curProjectId, "", []), history);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_REQUIRE_MENT:
                linkAuxStore.goToRequirementList(history);
                break;
            case MENU_KEY_CREATE_REQUIRE_MENT:
                projectStore.projectModal.createRequirement = true;
                break;
            case MENU_KEY_SHOW_TOOL_BAR_TASK_MY:
                linkAuxStore.goToTaskList(undefined, history);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_TASK_ALL:
                linkAuxStore.goToTaskList({
                    stateList: [],
                    execUserIdList: [],
                    checkUserIdList: [],
                }, history);
                break;
            case MENU_KEY_CREATE_TASK:
                linkAuxStore.goToCreateTask("", projectStore.curProjectId, history);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_BUG_MY:
                linkAuxStore.goToBugList(undefined, history);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_BUG_ALL:
                linkAuxStore.goToBugList({
                    stateList: [],
                    execUserIdList: [],
                    checkUserIdList: [],
                }, history);
                break;
            case MENU_KEY_CREATE_BUG:
                linkAuxStore.goToCreateBug("", projectStore.curProjectId, history);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_TEST_CASE:
                linkAuxStore.goToTestCaseList(history);
                break;
            case MENU_KEY_CREATE_TEST_CASE:
                projectStore.projectModal.setCreateTestCase(true, "", false);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_EVENTS:
                linkAuxStore.goToEventList(history);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_EVENTS_SUBSCRIBE:
                linkAuxStore.goToEventSubscribeList(history);
                break;
            case MENU_KEY_SHOW_TOOL_BAR_EXT_EVENTS:
                linkAuxStore.goToExtEventList(history);
                break;
            case MENU_KEY_ENTRY_CREATE_SPRIT:
                entryStore.createEntryType = ENTRY_TYPE_SPRIT;
                break;
            case MENU_KEY_ENTRY_CREATE_DOC:
                entryStore.createEntryType = ENTRY_TYPE_DOC;
                break;
            case MENU_KEY_ENTRY_CREATE_PAGES:
                entryStore.createEntryType = ENTRY_TYPE_PAGES;
                break;
            case MENU_KEY_ENTRY_CREATE_BOARD:
                entryStore.createEntryType = ENTRY_TYPE_BOARD;
                break;
            case MENU_KEY_ENTRY_CREATE_FILE:
                entryStore.createEntryType = ENTRY_TYPE_FILE;
                break;
            case MENU_KEY_ENTRY_CREATE_API_COLL:
                entryStore.createEntryType = ENTRY_TYPE_API_COLL;
                break;
            case MENU_KEY_ENTRY_CREATE_DATA_ANNO:
                entryStore.createEntryType = ENTRY_TYPE_DATA_ANNO;
                break;
            case MENU_KEY_SHOW_TOOL_BAR_OVERVIEW:
                linkAuxStore.gotoOverview(history);
                break;
            default:
                if (info.key.startsWith(MENU_KEY_HOME_PREFIX)) {
                    gotoHomePage(info.key);
                }
        }
        if (info.key.startsWith(MENU_KEY_MEMBER_PREFIX)) {
            const memberUserId = info.key.substring(MENU_KEY_MEMBER_PREFIX.length);
            memberStore.showDetailMemberId = memberUserId;
            projectStore.setShowChatAndComment(true, "member");
        }
    }

    useEffect(() => {
        calcItems();
    }, [projectStore.curProject?.setting, projectStore.curProjectId, memberStore.memberList]);

    return (
        <Dropdown overlayStyle={{ minWidth: "100px" }} menu={{ items, subMenuCloseDelay: 0.05, onClick: (info: MenuInfo) => onMenuClick(info) }} trigger={["click"]} >
            <a onClick={(e) => e.preventDefault()} style={{ margin: "0px 10px", color: "orange", fontSize: "18px" }} title="项目快捷菜单">
                <MenuOutlined />
            </a>
        </Dropdown >
    );
};

export default observer(ProjectQuickAccess);