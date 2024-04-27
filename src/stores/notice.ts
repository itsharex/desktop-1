//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { makeAutoObservable, runInAction } from 'mobx';
import type * as NoticeType from '@/api/notice_type';
import { listen } from '@tauri-apps/api/event';
import type { UnlistenFn } from '@tauri-apps/api/event';
import type { RootStore } from '.';
import type { ShortNoteEvent } from '@/utils/short_note';
import { showShortNote } from '@/utils/short_note';
import { SHORT_NOTE_TASK, SHORT_NOTE_BUG, SHORT_NOTE_MODE_DETAIL, SHORT_NOTE_MODE_SHOW } from '@/api/short_note';
import { LinkBugInfo, LinkEntryInfo, LinkTaskInfo } from './linkAux';
import { isString } from 'lodash';
import type { History } from 'history';
import { createBrowserHistory } from 'history';
import { appWindow, getAll as getAllWindow } from '@tauri-apps/api/window';
import { request } from '@/utils/request';
import { get as get_issue } from '@/api/project_issue';
import { APP_PROJECT_HOME_PATH } from '@/utils/constant';
import { message } from 'antd';
import type { COMMENT_TARGET_TYPE } from '@/api/project_comment';
import { get_session, USER_TYPE_ATOM_GIT } from '@/api/user';

class NoticeStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  private rootStore: RootStore;
  private unlistenFn: UnlistenFn | null = null;
  private unlistenShortNoteFn: UnlistenFn | null = null;

  private history: History = createBrowserHistory();

  setHistory(history: History) {
    runInAction(() => {
      this.history = history;
    });
  }

  //成功登录后接收通知
  async initListen() {
    if (this.unlistenFn !== null) {
      this.unlistenFn();
      runInAction(() => {
        this.unlistenFn = null;
      });
    }
    const unlistenFn = await listen<NoticeType.AllNotice>('notice', (ev) => {
      try {
        const notice = ev.payload
        console.log("notice", notice);
        if (notice.UserNotice !== undefined) {
          this.processUserNotice(notice.UserNotice);
        } else if (notice.ProjectNotice !== undefined) {
          this.processProjectNotice(notice.ProjectNotice);
        } else if (notice.IssueNotice !== undefined) {
          this.processIssueNotice(notice.IssueNotice);
        } else if (notice.EntryNotice !== undefined) {
          this.processEntryNotice(notice.EntryNotice);
        } else if (notice.ClientNotice !== undefined) {
          this.processClientNotice(notice.ClientNotice);
        } else if (notice.IdeaNotice !== undefined) {
          this.processIdeaNotice(notice.IdeaNotice);
        } else if (notice.CommentNotice !== undefined) {
          this.processCommentNotice(notice.CommentNotice);
        } else if (notice.BoardNotice !== undefined) {
          this.processBoardNotice(notice.BoardNotice);
        } else if (notice.ChatNotice !== undefined) {
          this.processChatNotice(notice.ChatNotice);
        } else if (notice.OrgNotice !== undefined) {
          this.processOrgNotice(notice.OrgNotice);
        }
      } catch (e) {
        console.log(e);
      }
    });
    runInAction(() => {
      this.unlistenFn = unlistenFn;
    });


    if (this.unlistenShortNoteFn !== null) {
      this.unlistenShortNoteFn();
      runInAction(() => {
        this.unlistenShortNoteFn = null;
      });
    }
    const unlistenShortNoteFn = await listen<ShortNoteEvent | string>("shortNote", (ev) => {
      try {
        if (isString(ev.payload)) {
          this.processShortNoteEvent(JSON.parse(ev.payload));
        } else {
          this.processShortNoteEvent(ev.payload);
        }
      } catch (e) {
        console.log(e);
      }

    });
    runInAction(() => {
      this.unlistenShortNoteFn = unlistenShortNoteFn;
    });

  }

  private async forwardCommentNotice(_targetType: COMMENT_TARGET_TYPE, targetId: string, notice: NoticeType.comment.AllNotice) {
    //只有独立窗口的需要转发
    const winList = await getAllWindow();
    for (const win of winList) {
      if (win.label.includes(targetId)) {
        win.emit("notice", { CommentNotice: notice });
      }
    }
  }

  private processCommentNotice(notice: NoticeType.comment.AllNotice) {
    if (notice.AddCommentNotice !== undefined) {
      this.forwardCommentNotice(notice.AddCommentNotice.target_type, notice.AddCommentNotice.target_id, notice);
      this.rootStore.projectStore.updateUnReadCommentStatus(notice.AddCommentNotice.project_id);
    } else if (notice.UpdateCommentNotice !== undefined) {
      this.forwardCommentNotice(notice.UpdateCommentNotice.target_type, notice.UpdateCommentNotice.target_id, notice);
    } else if (notice.RemoveCommentNotice !== undefined) {
      this.forwardCommentNotice(notice.RemoveCommentNotice.target_type, notice.RemoveCommentNotice.target_id, notice);
    } else if (notice.RemoveUnReadNotice !== undefined) {
      this.rootStore.projectStore.updateUnReadCommentStatus(notice.RemoveUnReadNotice.project_id);
    }
  }

  private processBoardNotice(notice: NoticeType.board.AllNotice) {
    if (notice.CreateNodeNotice !== undefined) {
      if (notice.CreateNodeNotice.board_id == this.rootStore.entryStore.curEntry?.entry_id) {
        this.rootStore.boardStore.updateNode(notice.CreateNodeNotice.node_id);
      }
    } else if (notice.UpdateNodeNotice !== undefined) {
      if (notice.UpdateNodeNotice.board_id == this.rootStore.entryStore.curEntry?.entry_id) {
        this.rootStore.boardStore.updateNode(notice.UpdateNodeNotice.node_id);
      }
    } else if (notice.RemoveNodeNotice !== undefined) {
      if (notice.RemoveNodeNotice.board_id == this.rootStore.entryStore.curEntry?.entry_id) {
        this.rootStore.boardStore.removeNode(notice.RemoveNodeNotice.node_id);
      }
    } else if (notice.CreateEdgeNotice !== undefined) {
      if (notice.CreateEdgeNotice.board_id == this.rootStore.entryStore.curEntry?.entry_id) {
        this.rootStore.boardStore.updateEdge({
          from_node_id: notice.CreateEdgeNotice.from_node_id,
          from_handle_id: notice.CreateEdgeNotice.from_handle_id,
          to_node_id: notice.CreateEdgeNotice.to_node_id,
          to_handle_id: notice.CreateEdgeNotice.to_handle_id,
        });
      }
    } else if (notice.UpdateEdgeNotice !== undefined) {
      if (notice.UpdateEdgeNotice.board_id == this.rootStore.entryStore.curEntry?.entry_id) {
        this.rootStore.boardStore.updateEdge({
          from_node_id: notice.UpdateEdgeNotice.from_node_id,
          from_handle_id: notice.UpdateEdgeNotice.from_handle_id,
          to_node_id: notice.UpdateEdgeNotice.to_node_id,
          to_handle_id: notice.UpdateEdgeNotice.to_handle_id,
        });
      }
    } else if (notice.RemoveEdgeNotice !== undefined) {
      if (notice.RemoveEdgeNotice.board_id == this.rootStore.entryStore.curEntry?.entry_id) {
        this.rootStore.boardStore.removeEdge({
          from_node_id: notice.RemoveEdgeNotice.from_node_id,
          from_handle_id: notice.RemoveEdgeNotice.from_handle_id,
          to_node_id: notice.RemoveEdgeNotice.to_node_id,
          to_handle_id: notice.RemoveEdgeNotice.to_handle_id,
        });
      }
    }
  }

  private async processChatNotice(notice: NoticeType.chat.AllNotice) {
    if (notice.UpdateGroupNotice !== undefined) {
      const curProject = this.rootStore.projectStore.getProject(notice.UpdateGroupNotice.project_id);
      if (curProject == undefined) {
        return;
      }
      await curProject.chat_store.onUpdateGroup(notice.UpdateGroupNotice.chat_group_id);
    } else if (notice.UpdateGroupMemberNotice !== undefined) {
      const curProject = this.rootStore.projectStore.getProject(notice.UpdateGroupMemberNotice.project_id);
      if (curProject == undefined) {
        return;
      }
      await curProject.chat_store.onUpdateMember(notice.UpdateGroupMemberNotice.chat_group_id);
    } else if (notice.LeaveGroupNotice !== undefined) {
      const curProject = this.rootStore.projectStore.getProject(notice.LeaveGroupNotice.project_id);
      if (curProject == undefined) {
        return;
      }
      await curProject.chat_store.onLeaveGroup(notice.LeaveGroupNotice.chat_group_id);
    } else if (notice.NewMsgNotice != undefined) {
      const curProject = this.rootStore.projectStore.getProject(notice.NewMsgNotice.project_id);
      if (curProject == undefined) {
        return;
      }
      await curProject.chat_store.onNewMsg(notice.NewMsgNotice.chat_group_id, notice.NewMsgNotice.chat_msg_id);
    } else if (notice.UpdateMsgNotice != undefined) {
      const curProject = this.rootStore.projectStore.getProject(notice.UpdateMsgNotice.project_id);
      if (curProject == undefined) {
        return;
      }
      await curProject.chat_store.onUpdateMsg(notice.UpdateMsgNotice.chat_group_id, notice.UpdateMsgNotice.chat_msg_id);
    }
  }

  private async processOrgNotice(notice: NoticeType.org.AllNotice) {
    if (notice.JoinOrgNotice !== undefined) {
      this.rootStore.orgStore.onJoin(notice.JoinOrgNotice.org_id, notice.JoinOrgNotice.member_user_id);
    } else if (notice.LeaveOrgNotice !== undefined) {
      this.rootStore.orgStore.onLeave(notice.LeaveOrgNotice.org_id, notice.LeaveOrgNotice.member_user_id, this.history);
    } else if (notice.UpdateOrgNotice !== undefined) {
      this.rootStore.orgStore.initLoadOrgList();
    } else if (notice.CreateDepartMentNotice !== undefined) {
      this.rootStore.orgStore.onUpdateDepartMent(notice.CreateDepartMentNotice.org_id, notice.CreateDepartMentNotice.depart_ment_id);
    } else if (notice.RemoveDepartMentNotice !== undefined) {
      this.rootStore.orgStore.onRemoveDepartMent(notice.RemoveDepartMentNotice.org_id, notice.RemoveDepartMentNotice.depart_ment_id);
    } else if (notice.UpdateDepartMentNotice !== undefined) {
      this.rootStore.orgStore.onUpdateDepartMent(notice.UpdateDepartMentNotice.org_id, notice.UpdateDepartMentNotice.depart_ment_id);
    } else if (notice.UpdateMemberNotice !== undefined) {
      this.rootStore.orgStore.onUpdateMember(notice.UpdateMemberNotice.org_id, notice.UpdateMemberNotice.member_user_id);
    }
  }

  private async processIdeaNotice(notice: NoticeType.idea.AllNotice) {
    if (notice.KeywordChangeNotice !== undefined) {
      if (this.rootStore.projectStore.curProjectId === notice.KeywordChangeNotice.project_id) {
        this.rootStore.ideaStore.updateKeyword(notice.KeywordChangeNotice.add_keyword_list, notice.KeywordChangeNotice.remove_keyword_list);
      }
    }
  }

  private async processClientNotice(notice: NoticeType.client.AllNotice) {
    if (this.rootStore.appStore.inEdit) { //编辑状态下忽略通知
      return;
    }
    if (notice.WrongSessionNotice !== undefined) {
      if (this.rootStore.userStore.adminSessionId != "") {
        runInAction(() => {
          this.rootStore.userStore.adminSessionId = "";
        });
        this.history.push("/");
      } else {
        const sessInRust = await get_session();
        if (sessInRust == "") {
          this.rootStore.userStore.logout();
        }
        message.warn("会话失效");
      }
    } else if (notice.GitPostHookNotice !== undefined) {
      await appWindow.show();
      await appWindow.unminimize();
      await appWindow.setAlwaysOnTop(true);
      setTimeout(() => {
        appWindow.setAlwaysOnTop(false);
      }, 200);
      if(this.rootStore.userStore.sessionId == ""){
        return;
      }
      const projectId = notice.GitPostHookNotice.project_id;
      if (projectId != this.rootStore.projectStore.curProjectId) {
        if (this.rootStore.appStore.inEdit) {
          this.rootStore.appStore.showCheckLeave(() => {
            this.rootStore.projectStore.setCurProjectId(projectId).then(() => {
              this.rootStore.projectStore.showPostHookModal = true;
              this.history.push(APP_PROJECT_HOME_PATH);
            });
            this.rootStore.orgStore.setCurOrgId("");
          });
        } else {
          await this.rootStore.projectStore.setCurProjectId(projectId);
          await this.rootStore.orgStore.setCurOrgId("");
          this.rootStore.projectStore.showPostHookModal = true;
          this.history.push(APP_PROJECT_HOME_PATH);
        }
      } else {
        this.rootStore.projectStore.showPostHookModal = true;
      }
    } else if (notice.LocalProxyStopNotice !== undefined) {
      await this.rootStore.appStore.loadLocalProxy();
    } else if (notice.StartMinAppNotice !== undefined) {
      await appWindow.show();
      await appWindow.unminimize();
      await appWindow.setAlwaysOnTop(true);
      setTimeout(() => {
        appWindow.setAlwaysOnTop(false);
      }, 200);
      this.rootStore.appStore.openMinAppId = notice.StartMinAppNotice.min_app_id;
    } else if (notice.OpenEntryNotice !== undefined) {
      await appWindow.show();
      await appWindow.unminimize();
      await appWindow.setAlwaysOnTop(true);
      setTimeout(() => {
        appWindow.setAlwaysOnTop(false);
      }, 200);
      this.rootStore.linkAuxStore.goToLink(new LinkEntryInfo("", notice.OpenEntryNotice.project_id, notice.OpenEntryNotice.entry_id), this.history);
    } else if (notice.NewExtraTokenNotice !== undefined) {
      this.rootStore.userStore.updateExtraToken(notice.NewExtraTokenNotice.extra_token);
    } else if (notice.AtomGitLoginNotice !== undefined) {
      this.rootStore.userStore.callLogin("", notice.AtomGitLoginNotice.code, USER_TYPE_ATOM_GIT);
    }
  }

  private async processUserNotice(notice: NoticeType.user.AllNotice) {
    if (notice.UserNewNoticeNotice !== undefined) {
      await this.rootStore.userStore.updateNoticeStatus(this.rootStore.userStore.sessionId);
    } else if (notice.UserOnlineNotice !== undefined) {
      await this.rootStore.memberStore.updateOnline(notice.UserOnlineNotice.user_id, true);
    } else if (notice.UserOfflineNotice !== undefined) {
      await this.rootStore.memberStore.updateOnline(notice.UserOfflineNotice.user_id, false);
    }
  }

  private async processProjectNotice(notice: NoticeType.project.AllNotice) {
    if (notice.UpdateProjectNotice !== undefined) {
      await this.rootStore.projectStore.updateProject(notice.UpdateProjectNotice.project_id);
    } else if (notice.RemoveProjectNotice !== undefined) {
      this.rootStore.projectStore.removeProject(notice.RemoveProjectNotice.project_id, this.history);
    } else if (notice.AddMemberNotice !== undefined) {
      if (notice.AddMemberNotice.project_id == this.rootStore.projectStore.curProjectId) {
        //更新成员信息
        await this.rootStore.memberStore.updateMemberInfo(notice.AddMemberNotice.project_id, notice.AddMemberNotice.member_user_id);
        const member = this.rootStore.memberStore.getMember(notice.AddMemberNotice.member_user_id);
        if (member != undefined) {
          await this.rootStore.memberStore.updateLastEvent(notice.AddMemberNotice.project_id, notice.AddMemberNotice.member_user_id, member.member.last_event_id);
        }
        await this.rootStore.memberStore.updateIssueState(notice.AddMemberNotice.project_id, notice.AddMemberNotice.member_user_id);
      } else {
        const projectId = notice.AddMemberNotice.project_id;
        const index = this.rootStore.projectStore.projectList.findIndex(item => item.project_id == projectId);
        if (index == -1) {
          await this.rootStore.projectStore.updateProject(projectId);
        }
      }
    } else if (notice.UpdateMemberNotice !== undefined) {
      if (notice.UpdateMemberNotice.project_id == this.rootStore.projectStore.curProjectId) {
        await this.rootStore.memberStore.updateMemberInfo(notice.UpdateMemberNotice.project_id, notice.UpdateMemberNotice.member_user_id);
      }
    } else if (notice.RemoveMemberNotice !== undefined) {
      if (notice.RemoveMemberNotice.member_user_id == this.rootStore.userStore.userInfo.userId) {
        this.rootStore.projectStore.removeProject(notice.RemoveMemberNotice.project_id, this.history);
      } else if (notice.RemoveMemberNotice.project_id == this.rootStore.projectStore.curProjectId) {
        this.rootStore.memberStore.loadMemberList(notice.RemoveMemberNotice.project_id);
      }
    } else if (notice.NewEventNotice !== undefined) {
      if (notice.NewEventNotice.project_id == this.rootStore.projectStore.curProjectId) {
        await this.rootStore.memberStore.updateLastEvent(notice.NewEventNotice.project_id, notice.NewEventNotice.member_user_id, notice.NewEventNotice.event_id);
      }
      const projectId = notice.NewEventNotice.project_id;
      setTimeout(() => {
        this.rootStore.projectStore.addNewEventCount(projectId);
      }, 500);
    } else if (notice.SetMemberRoleNotice !== undefined) {
      if (notice.SetMemberRoleNotice.project_id == this.rootStore.projectStore.curProjectId) {
        this.rootStore.memberStore.updateMemberRole(notice.SetMemberRoleNotice.member_user_id, notice.SetMemberRoleNotice.role_id);
      }
    } else if (notice.UpdateShortNoteNotice !== undefined) {
      if (notice.UpdateShortNoteNotice.project_id == this.rootStore.projectStore.curProjectId) {
        this.rootStore.memberStore.updateShortNote(notice.UpdateShortNoteNotice.project_id, notice.UpdateShortNoteNotice.member_user_id);
      }
    } else if (notice.UpdateAlarmStatNotice !== undefined) {
      this.rootStore.projectStore.updateAlarmStatus(notice.UpdateAlarmStatNotice.project_id);
    } else if (notice.CreateBulletinNotice !== undefined) {
      this.rootStore.projectStore.updateBulletinStatus(notice.CreateBulletinNotice.project_id);
    } else if (notice.UpdateBulletinNotice !== undefined) {
      this.rootStore.projectStore.updateBulletinStatus(notice.UpdateBulletinNotice.project_id);
    } else if (notice.RemoveBulletinNotice !== undefined) {
      this.rootStore.projectStore.updateBulletinStatus(notice.RemoveBulletinNotice.project_id);
    } else if (notice.AddTagNotice !== undefined) {
      this.rootStore.projectStore.updateTagList(notice.AddTagNotice.project_id);
    } else if (notice.UpdateTagNotice !== undefined) {
      this.rootStore.projectStore.updateTagList(notice.UpdateTagNotice.project_id);
    } else if (notice.RemoveTagNotice !== undefined) {
      this.rootStore.projectStore.updateTagList(notice.RemoveTagNotice.project_id);
    }
  }

  //只处理项目状态计数
  private async processIssueNotice(notice: NoticeType.issue.AllNotice) {
    if (notice.NewIssueNotice !== undefined) {
      await this.rootStore.projectStore.updateProjectIssueCount(notice.NewIssueNotice.project_id);
    } else if (notice.UpdateIssueNotice !== undefined) {
      await this.rootStore.projectStore.updateProjectIssueCount(notice.UpdateIssueNotice.project_id);
    } else if (notice.RemoveIssueNotice !== undefined) {
      await this.rootStore.projectStore.updateProjectIssueCount(notice.RemoveIssueNotice.project_id);
    }
  }

  private async processEntryNotice(notice: NoticeType.entry.AllNotice) {
    if (notice.UpdateEntryNotice !== undefined && notice.UpdateEntryNotice.project_id == this.rootStore.projectStore.curProjectId) {
      await this.rootStore.entryStore.onUpdateEntry(notice.UpdateEntryNotice.entry_id);
    } else if (notice.UpdateFolderNotice !== undefined && notice.UpdateFolderNotice.project_id == this.rootStore.projectStore.curProjectId) {
      await this.rootStore.entryStore.onUpdateFolder(notice.UpdateFolderNotice.folder_id);
    } else if (notice.RemoveEntryNotice !== undefined && notice.RemoveEntryNotice.project_id == this.rootStore.projectStore.curProjectId) {
      await this.rootStore.entryStore.onRemoveEntry(notice.RemoveEntryNotice.entry_id);
    } else if (notice.RemoveFolderNotice !== undefined && notice.RemoveFolderNotice.project_id == this.rootStore.projectStore.curProjectId) {
      await this.rootStore.entryStore.onRemoveFolder(notice.RemoveFolderNotice.folder_id);
    }
  }

  private async processShortNoteEvent(ev: ShortNoteEvent) {
    if (ev.shortNoteType == SHORT_NOTE_TASK) {
      if (ev.shortNoteModeType == SHORT_NOTE_MODE_DETAIL) {
        this.rootStore.linkAuxStore.goToLink(new LinkTaskInfo("", ev.projectId, ev.targetId), this.history);
      } else if (ev.shortNoteModeType == SHORT_NOTE_MODE_SHOW) {
        const res = await request(get_issue(this.rootStore.userStore.sessionId, ev.projectId, ev.targetId));
        if (res) {
          await showShortNote(this.rootStore.userStore.sessionId, {
            shortNoteType: ev.shortNoteType,
            data: res.info,
          }, this.rootStore.projectStore.getProject(ev.projectId)?.basic_info.project_name ?? "");
        }
      }
    } else if (ev.shortNoteType == SHORT_NOTE_BUG) {
      if (ev.shortNoteModeType == SHORT_NOTE_MODE_DETAIL) {
        this.rootStore.linkAuxStore.goToLink(new LinkBugInfo("", ev.projectId, ev.targetId), this.history);
      } else if (ev.shortNoteModeType == SHORT_NOTE_MODE_SHOW) {
        const res = await request(get_issue(this.rootStore.userStore.sessionId, ev.projectId, ev.targetId));
        if (res) {
          await showShortNote(this.rootStore.userStore.sessionId, {
            shortNoteType: ev.shortNoteType,
            data: res.info,
          }, this.rootStore.projectStore.getProject(ev.projectId)?.basic_info.project_name ?? "");
        }
      }
    }

    if (ev.shortNoteModeType != SHORT_NOTE_MODE_SHOW) {
      await appWindow.show();
      await appWindow.unminimize();
      await appWindow.setAlwaysOnTop(true);
      setTimeout(() => {
        appWindow.setAlwaysOnTop(false);
      }, 200);
    }
  }

}



export default NoticeStore;
