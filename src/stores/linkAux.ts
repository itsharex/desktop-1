import type { RootStore } from '.';
import { makeAutoObservable, runInAction } from 'mobx';
import * as linkAuxApi from '@/api/link_aux';
import { request } from '@/utils/request';
import { message } from 'antd';
import type { History } from 'history';
import { CHANNEL_STATE } from './channel';
import type { ISSUE_STATE } from '@/api/project_issue';
import {
  APP_PROJECT_CHAT_PATH,
  APP_PROJECT_KB_DOC_PATH,
  APP_PROJECT_MY_WORK_PATH,
  APP_PROJECT_OVERVIEW_PATH,
  APP_PROJECT_PATH,
  APP_PROJECT_WORK_PLAN_PATH,
  BUG_CREATE_SUFFIX,
  BUG_DETAIL_SUFFIX,
  REQUIRE_MENT_CREATE_SUFFIX,
  REQUIRE_MENT_DETAIL_SUFFIX,
  TASK_CREATE_SUFFIX,
  TASK_DETAIL_SUFFIX,
} from '@/utils/constant';
import { open } from '@tauri-apps/api/shell';
import { uniqId } from '@/utils/utils';
import type { API_COLL_TYPE } from '@/api/api_collection';
import { API_COLL_CUSTOM, API_COLL_GRPC, API_COLL_OPENAPI } from '@/api/api_collection';
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';

/*
 * 用于统一管理链接跳转以及链接直接传递数据
 */

export enum LINK_TARGET_TYPE {
  LINK_TARGET_PROJECT = 0,
  LINK_TARGET_CHANNEL = 1,
  LINK_TARGET_EVENT = 2,
  LINK_TARGET_DOC = 3,
  LINK_TARGET_APP = 4,
  LINK_TARGET_SPRIT = 5,
  LINK_TARGET_TASK = 6,
  LINK_TARGET_BUG = 7,
  LINK_TARGET_APPRAISE = 8,
  LINK_TARGET_USER_KB = 9,
  // LINK_TARGET_ROBOT_METRIC = 10,
  // LINK_TARGET_EARTHLY_ACTION = 11,
  // LINK_TARGET_EARTHLY_EXEC = 12,
  // LINK_TARGET_BOOK_MARK = 13,
  // LINK_TARGET_TEST_CASE_ENTRY = 14,
  // LINK_TARGET_SCRIPT_SUITE = 15,
  // LINK_TARGET_SCRIPT_EXEC = 16,
  LINK_TARGET_REQUIRE_MENT = 17,
  LINK_TARGET_CODE_COMMENT = 18,
  // LINK_TARGET_BOOK_MARK_CATE = 19,
  LINK_TARGET_IDEA_PAGE = 20,

  LINK_TARGET_NONE = 100,
  LINK_TARGET_IMAGE = 101,
  LINK_TARGET_EXTERNE = 102,
}

export interface LinkInfo {
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
}

export class LinkProjectInfo {
  constructor(content: string, projectId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_PROJECT;
    this.linkContent = content;
    this.projectId = projectId;
  }

  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
}

export class LinkChannelInfo {
  constructor(content: string, projectId: string, channelId: string, msgId: string = '') {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_CHANNEL;
    this.linkContent = content;
    this.projectId = projectId;
    this.channelId = channelId;
    this.msgId = msgId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  channelId: string;
  msgId: string;
}

export class LinkEventlInfo {
  constructor(
    content: string,
    projectId: string,
    eventId: string,
    userId: string,
    eventTime: number,
  ) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_EVENT;
    this.linkContent = content;
    this.projectId = projectId;
    this.eventId = eventId;
    this.userId = userId;
    this.eventTime = eventTime;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  eventId: string;
  userId: string;
  eventTime: number;
}

export class LinkDocInfo {
  constructor(content: string, projectId: string, docSpaceId: string, docId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_DOC;
    this.linkContent = content;
    this.projectId = projectId;
    this.docSpaceId = docSpaceId;
    this.docId = docId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  docSpaceId: string;
  docId: string;
}

export class LinkSpritInfo {
  constructor(content: string, projectId: string, spritId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_SPRIT;
    this.linkContent = content;
    this.projectId = projectId;
    this.spritId = spritId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  spritId: string;
}

export class LinkTaskInfo {
  constructor(content: string, projectId: string, issueId: string, contextIssueIdList: string[] = []) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_TASK;
    this.linkContent = content;
    this.projectId = projectId;
    this.issueId = issueId;
    this.contextIssueIdList = contextIssueIdList;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  issueId: string;
  contextIssueIdList: string[];
}

export class LinkBugInfo {
  constructor(content: string, projectId: string, issueId: string, contextIssueIdList: string[] = []) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_BUG;
    this.linkContent = content;
    this.projectId = projectId;
    this.issueId = issueId;
    this.contextIssueIdList = contextIssueIdList;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  issueId: string;
  contextIssueIdList: string[];
}

export class LinkAppraiseInfo {
  constructor(content: string, projectId: string, appraiseId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_APPRAISE;
    this.linkContent = content;
    this.projectId = projectId;
    this.appraiseId = appraiseId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  appraiseId: string;
}

export class LinkUserKbInfo {
  constructor(content: string, userId: string, spaceId: string, docId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_APPRAISE;
    this.linkContent = content;
    this.userId = userId;
    this.spaceId = spaceId;
    this.docId = docId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  userId: string;
  spaceId: string;
  docId: string;
}

export class LinkAppInfo {
  constructor(content: string, projectId: string, appId: string, appUrl: string, openType: number) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_APP;
    this.linkContent = content;
    this.projectId = projectId;
    this.appId = appId;
    this.appUrl = appUrl;
    this.openType = openType;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  appId: string;
  appUrl: string;
  openType: number;
}


export class LinkNoneInfo {
  constructor(content: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_NONE;
    this.linkContent = content;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
}

export class LinkRequirementInfo {
  constructor(content: string, projectId: string, requirementId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_REQUIRE_MENT;
    this.linkContent = content;
    this.projectId = projectId;
    this.requirementId = requirementId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  requirementId: string;
}

export class LinkCodeCommentInfo {
  constructor(content: string, projectId: string, threadId: string, commentId: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_CODE_COMMENT;
    this.linkContent = content;
    this.projectId = projectId;
    this.threadId = threadId;
    this.commentId = commentId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  threadId: string;
  commentId: string;
}

export class LinkIdeaPageInfo {
  constructor(content: string, projectId: string, tagId: string, keywordList: string[], ideaId: string = "") {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_IDEA_PAGE;
    this.linkContent = content;
    this.projectId = projectId;
    this.tagId = tagId;
    this.keywordList = keywordList;
    this.ideaId = ideaId;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  projectId: string;
  tagId: string;
  keywordList: string[];
  ideaId: string;
}

export class LinkImageInfo {
  constructor(content: string, imgUrl: string, thumbImgUrl: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_IMAGE;
    this.linkContent = content;
    this.imgUrl = imgUrl;
    this.thumbImgUrl = thumbImgUrl;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  imgUrl: string;
  thumbImgUrl: string;
}

export class LinkExterneInfo {
  constructor(content: string, destUrl: string) {
    this.linkTargeType = LINK_TARGET_TYPE.LINK_TARGET_EXTERNE;
    this.linkContent = content;
    this.destUrl = destUrl;
  }
  linkTargeType: LINK_TARGET_TYPE;
  linkContent: string;
  destUrl: string;
}

export type LinkEventState = {
  eventTime: number;
  memberUserId: string;
};

export type LinkIssueState = {
  issueId: string;
  content: string;
  contextIssueIdList?: string[];
  spritId?: string;
};

export enum ISSUE_TAB_LIST_TYPE {
  ISSUE_TAB_LIST_ALL, //全部
  ISSUE_TAB_LIST_ASSGIN_ME, //指派给我
  ISSUE_TAB_LIST_MY_CREATE, //由我创建
  ISSUE_TAB_LIST_MY_WATCH,  //我的关注
}

export type LinkIssueListState = {
  stateList: ISSUE_STATE[];
  execUserIdList: string[];
  checkUserIdList: string[];
  tabType?: ISSUE_TAB_LIST_TYPE;
  priorityList?: number[];
  softwareVersionList?: string[];
  levelList?: number[];
  tagId?: string;
  curPage?: number;
};

export type LinkDocState = {
  writeDoc: boolean;
  content: string;
  docSpaceId: string;
  docId: string;
};

export type LinkRequirementState = {
  requirementId: string;
  content: string;
}

export type LinkIdeaPageState = {
  keywordList: string[];
  tagId: string;
  ideaId: string;
}

class LinkAuxStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  rootStore: RootStore;

  async goToLink(link: LinkInfo, history: History, remoteCheck: boolean = true) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    const pathname = history.location.pathname;
    if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_CHANNEL) {
      const channelLink = link as LinkChannelInfo;
      if (this.rootStore.projectStore.getProject(channelLink.projectId)?.setting.disable_chat) {
        return;
      }
      if (remoteCheck) {
        const res = await request(
          linkAuxApi.check_access_channel(
            this.rootStore.userStore.sessionId,
            channelLink.projectId,
            channelLink.channelId,
          ),
        );
        if (!res) {
          return;
        }
        if (res.can_access == false) {
          message.warn('不是目标频道的成员');
          return;
        }
      }
      if (this.rootStore.projectStore.curProjectId != channelLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(channelLink.projectId);
      }
      runInAction(() => {
        this.rootStore.channelStore.filterChanelState = CHANNEL_STATE.CHANNEL_STATE_ALL;
      });
      if (channelLink.msgId != '') {
        this.rootStore.chatMsgStore.listRefMsgId = channelLink.msgId;
      }
      this.rootStore.channelStore.curChannelId = channelLink.channelId;
      history.push(APP_PROJECT_CHAT_PATH);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_EVENT) {
      const eventLink = link as LinkEventlInfo;
      if (remoteCheck) {
        const res = await request(
          linkAuxApi.check_access_event(
            this.rootStore.userStore.sessionId,
            eventLink.projectId,
            eventLink.eventId,
          ),
        );
        if (!res) {
          return;
        }
        if (res.can_access == false) {
          message.warn('没有权限查看对应工作记录');
          return;
        }
      }
      history.push(this.genUrl(eventLink.projectId, pathname, "/record"), {
        eventTime: eventLink.eventTime,
        memberUserId: eventLink.userId,
      } as LinkEventState);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TASK) {
      const taskLink = link as LinkTaskInfo;
      if (remoteCheck) {
        const res = await request(
          linkAuxApi.check_access_issue(
            this.rootStore.userStore.sessionId,
            taskLink.projectId,
            taskLink.issueId,
          ),
        );
        if (!res) {
          return;
        }
        if (res.can_access == false) {
          message.warn('没有权限查看对应任务');
          return;
        }
      }
      if (this.rootStore.projectStore.curProjectId != taskLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(taskLink.projectId);
      }
      history.push(this.genUrl(taskLink.projectId, pathname, TASK_DETAIL_SUFFIX), {
        issueId: taskLink.issueId,
        content: '',
        contextIssueIdList: taskLink.contextIssueIdList,
      } as LinkIssueState);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BUG) {
      const bugLink = link as LinkBugInfo;
      if (remoteCheck) {
        const res = await request(
          linkAuxApi.check_access_issue(
            this.rootStore.userStore.sessionId,
            bugLink.projectId,
            bugLink.issueId,
          ),
        );
        if (!res) {
          return;
        }
        if (res.can_access == false) {
          message.warn('没有权限查看对应缺陷');
          return;
        }
      }
      if (this.rootStore.projectStore.curProjectId != bugLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(bugLink.projectId);
      }
      history.push(this.genUrl(bugLink.projectId, pathname, BUG_DETAIL_SUFFIX), {
        issueId: bugLink.issueId,
        content: '',
        contextIssueIdList: bugLink.contextIssueIdList,
      } as LinkIssueState);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_DOC) {
      const docLink = link as LinkDocInfo;
      if (this.rootStore.projectStore.getProject(docLink.projectId)?.setting.disable_kb) {
        return;
      }
      if (remoteCheck) {
        const res = await request(
          linkAuxApi.check_access_doc(
            this.rootStore.userStore.sessionId,
            docLink.projectId,
            docLink.docId,
          ));
        if (!res) {
          return;
        }
        if (res.can_access == false) {
          message.warn('没有权限查看对应文档');
          return;
        }
      }
      if (this.rootStore.projectStore.curProjectId != docLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(docLink.projectId);
      }
      if (this.rootStore.docSpaceStore.curDocSpaceId != docLink.docSpaceId) {
        await this.rootStore.docSpaceStore.showDocList(docLink.docSpaceId, false);
      }
      this.rootStore.docSpaceStore.fromLink = true;
      await this.rootStore.docSpaceStore.showDoc(docLink.docId, false);
      history.push(APP_PROJECT_KB_DOC_PATH);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_SPRIT) {
      const spritLink = link as LinkSpritInfo;
      if (this.rootStore.projectStore.getProject(spritLink.projectId)?.setting.disable_work_plan == true) {
        return;
      }
      if (this.rootStore.projectStore.curProjectId != spritLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(spritLink.projectId);
      }
      await this.rootStore.spritStore.setCurSpritId(spritLink.spritId);
      history.push(APP_PROJECT_WORK_PLAN_PATH);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_REQUIRE_MENT) {
      const reqLink = link as LinkRequirementInfo;
      if (this.rootStore.projectStore.curProjectId != reqLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(reqLink.projectId);
      }
      const state: LinkRequirementState = {
        requirementId: reqLink.requirementId,
        content: "",
      };
      history.push(this.genUrl(reqLink.projectId, pathname, REQUIRE_MENT_DETAIL_SUFFIX), state);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_CODE_COMMENT) {
      const commentLink = link as LinkCodeCommentInfo;
      if (this.rootStore.projectStore.curProjectId != commentLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(commentLink.projectId);
      }
      this.rootStore.projectStore.setCodeCommentInfo(commentLink.threadId, commentLink.commentId);
      if (!history.location.pathname.startsWith(APP_PROJECT_PATH)) {
        //TODO work plan
        if (this.rootStore.projectStore.getProject(commentLink.projectId)?.setting.disable_kb == false) {
          history.push(APP_PROJECT_KB_DOC_PATH);
        } else if (this.rootStore.projectStore.getProject(commentLink.projectId)?.setting.disable_chat == false) {
          history.push(APP_PROJECT_CHAT_PATH);
        } else {
          history.push(APP_PROJECT_OVERVIEW_PATH);
        }
      }
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_IDEA_PAGE) {
      const ideaPageLink = link as LinkIdeaPageInfo;
      if (this.rootStore.projectStore.curProjectId != ideaPageLink.projectId) {
        await this.rootStore.projectStore.setCurProjectId(ideaPageLink.projectId);
      }
      const state: LinkIdeaPageState = {
        keywordList: ideaPageLink.keywordList,
        tagId: ideaPageLink.tagId,
        ideaId: ideaPageLink.ideaId,
      };
      history.push(this.genUrl(ideaPageLink.projectId, pathname, "/idea"), state);
    } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_EXTERNE) {
      const externLink = link as LinkExterneInfo;
      let destUrl = externLink.destUrl;
      if (!destUrl.includes("://")) {
        destUrl = "https://" + destUrl;
      }
      await open(destUrl);
    }
  }

  //跳转到创建文档
  async goToCreateDoc(content: string, projectId: string, docSpaceId: string, history: History) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    if (this.rootStore.projectStore.getProject(projectId)?.setting.disable_kb) {
      return;
    }
    if (projectId != this.rootStore.projectStore.curProjectId) {
      await this.rootStore.projectStore.setCurProjectId(projectId);
    }
    if (docSpaceId != "") {
      await this.rootStore.docSpaceStore.loadDocSpace();
      this.rootStore.docSpaceStore.showDocList(docSpaceId, false);
    }
    await this.rootStore.docSpaceStore.showDoc("", true);
    history.push(APP_PROJECT_KB_DOC_PATH, {
      writeDoc: true,
      content: content,
      docSpaceId: docSpaceId,
      docId: '',
    } as LinkDocState);
  }

  //跳转到创建任务
  async goToCreateTask(content: string, projectId: string, history: History, spritId: string | undefined = undefined) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    if (projectId != this.rootStore.projectStore.curProjectId) {
      await this.rootStore.projectStore.setCurProjectId(projectId);
    }
    history.push(this.genUrl(projectId, history.location.pathname, TASK_CREATE_SUFFIX), {
      issueId: '',
      content: content,
      contextIssueIdList: [],
      spritId: spritId,
    } as LinkIssueState);
  }

  //跳转到创建缺陷
  async goToCreateBug(content: string, projectId: string, history: History, spritId: string | undefined = undefined) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    if (projectId != this.rootStore.projectStore.curProjectId) {
      await this.rootStore.projectStore.setCurProjectId(projectId);
    }
    history.push(this.genUrl(projectId, history.location.pathname, BUG_CREATE_SUFFIX), {
      issueId: '',
      content: content,
      contextIssueIdList: [],
      spritId: spritId,
    } as LinkIssueState);
  }

  //跳转到创建需求
  async goToCreateRequirement(content: string, projectId: string, history: History) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    if (projectId != this.rootStore.projectStore.curProjectId) {
      await this.rootStore.projectStore.setCurProjectId(projectId);
    }
    const state: LinkRequirementState = {
      content: content,
      requirementId: '',
    };
    history.push(this.genUrl(projectId, history.location.pathname, REQUIRE_MENT_CREATE_SUFFIX), state);
  }

  //跳转到任务列表
  goToTaskList(state: LinkIssueListState | undefined, history: History) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    if (state != undefined && state?.tabType == undefined) {
      state.tabType = ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME;
    }
    if (state != undefined && state.priorityList == undefined) {
      state.priorityList = [];
    }
    if (state != undefined && state.curPage == undefined) {
      state.curPage = 0;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/task"), state);
  }

  //跳转到缺陷列表
  goToBugList(state: LinkIssueListState | undefined, history: History) {
    console.log("22222222222222222", state);
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    if (state != undefined && state?.tabType == undefined) {
      state.tabType = ISSUE_TAB_LIST_TYPE.ISSUE_TAB_LIST_ASSGIN_ME;
    }
    if (state != undefined && state.priorityList == undefined) {
      state.priorityList = [];
    }
    if (state != undefined && state.softwareVersionList == undefined) {
      state.softwareVersionList = [];
    }
    if (state != undefined && state.levelList == undefined) {
      state.levelList = [];
    }
    if (state != undefined && state.curPage == undefined) {
      state.curPage = 0;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/bug"), state);
  }

  //跳转到研发行为列表页
  goToEventList(history: History) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/record"));
  }

  //跳转到研发行为订阅页面
  goToEventSubscribeList(history: History) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/record/subscribe"));
  }

  //跳转到成员互评页面
  goToAppriaseList(history: History) {
    if (this.rootStore.projectStore.curProject?.setting.disable_member_appraise == true) {
      return;
    }
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/appraise"));
  }

  //跳转到第三方接入列表
  goToExtEventList(history: History) {
    if (this.rootStore.projectStore.curProject?.setting.disable_ext_event == true) {
      return;
    }
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/access"));
  }

  //调整到代码评论会话列表
  goToCodeThreadList(history: History) {
    if (this.rootStore.projectStore.curProject?.setting.disable_code_comment == true) {
      return;
    }
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/code"));
  }

  //跳转到项目应用
  goToAppList(history: History) {
    if (this.rootStore.projectStore.curProject?.setting.disable_app_store == true) {
      return;
    }
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/appstore"));
  }

  //跳转到数据标注
  goToDataAnnoList(history: History) {
    if (this.rootStore.projectStore.curProject?.setting.disable_data_anno == true) {
      return;
    }
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/dataanno"));
  }

  //跳转到接口集合
  goToApiCollectionList(history: History) {
    if (this.rootStore.projectStore.curProject?.setting.disable_api_collection == true) {
      return;
    }
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/apicoll"));
  }

  //跳转到知识点列表
  goToIdeaList(history: History) {
    if (this.rootStore.projectStore.curProject?.setting.disable_chat == true && this.rootStore.projectStore.curProject?.setting.disable_kb == true) {
      return;
    }
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/idea"));
  }

  //打开接口集合页面
  async openApiCollPage(apiCollId: string, name: string, apiCollType: API_COLL_TYPE, defaultAddr: string, canEdit: boolean) {
    const label = `apiColl:${apiCollId}`;
    const pos = await appWindow.innerPosition();
    if (apiCollType == API_COLL_GRPC) {
      new WebviewWindow(label, {
        title: `${name}(GRPC)`,
        url: `api_grpc.html?projectId=${this.rootStore.projectStore.curProjectId}&apiCollId=${apiCollId}&fsId=${this.rootStore.projectStore.curProject?.api_coll_fs_id ?? ""}&remoteAddr=${defaultAddr}&edit=${canEdit}`,
        x: pos.x + Math.floor(Math.random() * 200),
        y: pos.y + Math.floor(Math.random() * 200),
      });
    } else if (apiCollType == API_COLL_OPENAPI) {
      new WebviewWindow(label, {
        title: `${name}(OPENAPI/SWAGGER)`,
        url: `api_swagger.html?projectId=${this.rootStore.projectStore.curProjectId}&apiCollId=${apiCollId}&fsId=${this.rootStore.projectStore.curProject?.api_coll_fs_id ?? ""}&remoteAddr=${defaultAddr}&edit=${canEdit}`,
        x: pos.x + Math.floor(Math.random() * 200),
        y: pos.y + Math.floor(Math.random() * 200),
      });
    } else if (apiCollType == API_COLL_CUSTOM) {
      new WebviewWindow(label, {
        title: `${name}(自定义接口)`,
        url: `api_custom.html?projectId=${this.rootStore.projectStore.curProjectId}&apiCollId=${apiCollId}&remoteAddr=${defaultAddr}&edit=${canEdit}`,
        x: pos.x + Math.floor(Math.random() * 200),
        y: pos.y + Math.floor(Math.random() * 200),
      });
    }
  }

  //跳转到项目需求列表页面
  goToRequirementList(history: History) {
    if (this.rootStore.appStore.simpleMode) {
      this.rootStore.appStore.simpleMode = false;
    }
    history.push(this.genUrl(this.rootStore.projectStore.curProjectId, history.location.pathname, "/req"));
  }

  private genUrl(projectId: string, pathname: string, suffix: string): string {
    let newSuffix = suffix;
    if (suffix.indexOf("?") == -1) {
      newSuffix = `${suffix}?v=${uniqId()}`
    }
    if (pathname.startsWith(APP_PROJECT_WORK_PLAN_PATH)) {
      return APP_PROJECT_WORK_PLAN_PATH + newSuffix;
    } else if (pathname.startsWith(APP_PROJECT_CHAT_PATH)) {
      return APP_PROJECT_CHAT_PATH + newSuffix;
    } else if (pathname.startsWith(APP_PROJECT_KB_DOC_PATH)) {
      return APP_PROJECT_KB_DOC_PATH + newSuffix;
    }else if(pathname.startsWith(APP_PROJECT_MY_WORK_PATH)){
      return APP_PROJECT_MY_WORK_PATH + newSuffix;
    } else if (pathname.startsWith(APP_PROJECT_OVERVIEW_PATH)) {
      return APP_PROJECT_OVERVIEW_PATH + newSuffix;
    }
    const projectInfo = this.rootStore.projectStore.getProject(projectId);
    if (projectInfo == undefined) {
      return APP_PROJECT_CHAT_PATH + newSuffix;
    }

    if (projectInfo.setting.disable_chat == false) {
      return APP_PROJECT_CHAT_PATH + newSuffix;
    } else if (projectInfo.setting.disable_work_plan == false) {
      return APP_PROJECT_WORK_PLAN_PATH + newSuffix;
    } else if (projectInfo.setting.disable_kb == false) {
      return APP_PROJECT_KB_DOC_PATH + newSuffix;
    } else {
      return APP_PROJECT_OVERVIEW_PATH + newSuffix;
    }
  }
}

export default LinkAuxStore;
