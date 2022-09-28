import { makeAutoObservable, runInAction } from 'mobx';
import type * as NoticeType from '@/api/notice_type'
import { listen } from '@tauri-apps/api/event';
import type { UnlistenFn } from '@tauri-apps/api/event';
import type { RootStore } from '.';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
import { MSG_LINK_TASK, MSG_LINK_BUG, MSG_LINK_CHANNEL } from '@/api/project_channel';


class NoticeStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  private rootStore: RootStore;
  private unlistenFn: UnlistenFn | null = null;

  //成功登录后接收通知
  async initListen() {
    if (this.unlistenFn !== null) {
      this.unlistenFn();
      runInAction(() => {
        this.unlistenFn = null;
      });

    }
    const unlistenFn = await listen<NoticeType.AllNotice>('notice', (ev) => {
      console.log('notice', ev);
      const notice = ev.payload
      if (notice.ProjectNotice !== undefined) {
        this.processProjectNotice(notice.ProjectNotice);
      } else if (notice.ProjectDocNotice !== undefined) {
        this.processProjectDocNotice(notice.ProjectDocNotice);
      } else if (notice.IssueNotice !== undefined) {
        this.processIssueNotice(notice.IssueNotice);
      } else if (notice.AppraiseNotice !== undefined) {
        this.processAppraiseNotice(notice.AppraiseNotice)
      } else if (notice.ClientNotice !== undefined) {
        this.processClientNotice(notice.ClientNotice);
      }
    });
    runInAction(() => {
      this.unlistenFn = unlistenFn;
    });
  }

  private processProjectDocNotice(notice: NoticeType.project_doc.AllNotice) {
    if (notice.NewDocSpaceNotice !== undefined) {
      //skip
    } else if (notice.UpdateDocSpaceNotice !== undefined) {
      //skip
    } else if (notice.RemoveDocSpaceNotice !== undefined) {
      //skip
    } else if (notice.NewDocNotice !== undefined) {
      if (notice.NewDocNotice.project_id == this.rootStore.projectStore.curProjectId && notice.NewDocNotice.doc_space_id == this.rootStore.docStore.curDocSpaceId) {
        this.rootStore.docStore.addDocKey(notice.NewDocNotice.doc_id);
      }
    } else if (notice.UpdateDocNotice !== undefined) {
      if (notice.UpdateDocNotice.project_id == this.rootStore.projectStore.curProjectId && notice.UpdateDocNotice.doc_space_id == this.rootStore.docStore.curDocSpaceId) {
        this.rootStore.docStore.updateDocKey(notice.UpdateDocNotice.doc_id);
      }
    } else if (notice.RemoveDocNotice !== undefined) {
      if (notice.RemoveDocNotice.project_id == this.rootStore.projectStore.curProjectId && notice.RemoveDocNotice.doc_space_id == this.rootStore.docStore.curDocSpaceId) {
        this.rootStore.docStore.removeDocKey(notice.RemoveDocNotice.doc_id);
        this.rootStore.docStore.addToRecycle(notice.RemoveDocNotice.doc_id);
      }
    } else if (notice.RecoverDocInRecycleNotice !== undefined) {
      if (notice.RecoverDocInRecycleNotice.project_id == this.rootStore.projectStore.curProjectId && notice.RecoverDocInRecycleNotice.doc_space_id == this.rootStore.docStore.curDocSpaceId) {
        this.rootStore.docStore.removeFromRecycle(notice.RecoverDocInRecycleNotice.doc_id);
        this.rootStore.docStore.addDocKey(notice.RecoverDocInRecycleNotice.doc_id);
      }
    } else if (notice.RemoveDocInRecycleNotice !== undefined) {
      if (notice.RemoveDocInRecycleNotice.project_id == this.rootStore.projectStore.curProjectId && notice.RemoveDocInRecycleNotice.doc_space_id == this.rootStore.docStore.curDocSpaceId) {
        this.rootStore.docStore.removeFromRecycle(notice.RemoveDocInRecycleNotice.doc_id);
      }
    }
  }

  private processAppraiseNotice(notice: NoticeType.appraise.AllNotice) {
    if (notice.NewAppraiseNotice !== undefined) {
      if (this.rootStore.projectStore.curProjectId === notice.NewAppraiseNotice.project_id) {
        this.rootStore.appraiseStore.loadAllRecord(this.rootStore.appraiseStore.allCurPage);
        this.rootStore.appraiseStore.loadMyRecord(this.rootStore.appraiseStore.myCurPage);
        this.rootStore.projectStore.updateProjectAppraiseCount(notice.NewAppraiseNotice.project_id);
      }
    } else if (notice.NewVoteNotice !== undefined) {
      if (this.rootStore.projectStore.curProjectId === notice.NewVoteNotice.project_id) {
        this.rootStore.appraiseStore.loadAllRecord(this.rootStore.appraiseStore.allCurPage);
        this.rootStore.appraiseStore.loadMyRecord(this.rootStore.appraiseStore.myCurPage);
        this.rootStore.appraiseStore.loadUserScore();
        this.rootStore.projectStore.updateProjectAppraiseCount(notice.NewVoteNotice.project_id);
      }
    }
  }

  private processClientNotice(notice: NoticeType.client.AllNotice) {
    if (notice.UploadSnapShotNotice !== undefined) {
      //TODO
    } else if (notice.WrongSessionNotice !== undefined) {
      if (notice.WrongSessionNotice.name.indexOf("snap") == -1) { //忽略快照相关接口报错
        this.rootStore.userStore.logout();
      }
    }
  }

  private async processProjectNotice(notice: NoticeType.project.AllNotice) {
    if (notice.UpdateProjectNotice !== undefined) {
      await this.rootStore.projectStore.updateProject(notice.UpdateProjectNotice.project_id);
    } else if (notice.AddMemberNotice !== undefined) {
      if (notice.AddMemberNotice.project_id == this.rootStore.projectStore.curProjectId) {
        //TODO 更新成员信息
      }
    } else if (notice.UpdateMemberNotice !== undefined) {
      if (notice.UpdateMemberNotice.project_id == this.rootStore.projectStore.curProjectId) {
        await this.rootStore.memberStore.updateMemberInfo(notice.UpdateMemberNotice.project_id, notice.UpdateMemberNotice.member_user_id);
      }
    } else if (notice.RemoveMemberNotice !== undefined) {
      if (notice.RemoveMemberNotice.project_id == this.rootStore.projectStore.curProjectId) {
        //TODO 删除成员信息
      }
    } else if (notice.AddChannelNotice !== undefined) {
      if (notice.AddChannelNotice.project_id == this.rootStore.projectStore.curProjectId) {
        await this.rootStore.channelStore.updateChannel(notice.AddChannelNotice.channel_id);
      }
    } else if (notice.UpdateChannelNotice !== undefined) {
      if (notice.UpdateChannelNotice.project_id == this.rootStore.projectStore.curProjectId) {
        await this.rootStore.channelStore.updateChannel(notice.UpdateChannelNotice.channel_id);
      }
    } else if (notice.AddChannelMemberNotice !== undefined) {
      if (notice.AddChannelMemberNotice.project_id == this.rootStore.projectStore.curProjectId &&
        notice.AddChannelMemberNotice.member_user_id == this.rootStore.userStore.userInfo.userId) {
        await this.rootStore.channelStore.updateChannel(notice.AddChannelMemberNotice.channel_id);
      } else if (notice.AddChannelMemberNotice.project_id == this.rootStore.projectStore.curProjectId &&
        notice.AddChannelMemberNotice.channel_id == this.rootStore.channelStore.curChannelId) {
        await this.rootStore.channelMemberStore.loadChannelMemberList(notice.AddChannelMemberNotice.project_id, notice.AddChannelMemberNotice.channel_id);
      }
    } else if (notice.RemoveChannelMemberNotice !== undefined) {
      if (notice.RemoveChannelMemberNotice.project_id == this.rootStore.projectStore.curProjectId &&
        notice.RemoveChannelMemberNotice.member_user_id == this.rootStore.userStore.userInfo.userId) {
        //重新加载频道列表
        await this.rootStore.channelStore.loadChannelList(this.rootStore.projectStore.curProjectId);
      } else if (notice.RemoveChannelMemberNotice.project_id == this.rootStore.projectStore.curProjectId &&
        notice.RemoveChannelMemberNotice.channel_id == this.rootStore.channelStore.curChannelId) {
        await this.rootStore.channelMemberStore.loadChannelMemberList(notice.RemoveChannelMemberNotice.project_id,
          notice.RemoveChannelMemberNotice.channel_id);
      }
    } else if (notice.NewMsgNotice !== undefined) {
      if (this.rootStore.projectStore.curProjectId == notice.NewMsgNotice.project_id) {
        //更新频道消息数量
        await this.rootStore.channelStore.updateUnReadMsgCount(notice.NewMsgNotice.channel_id);
      }
      //更新当前频道消息
      if (this.rootStore.projectStore.curProjectId == notice.NewMsgNotice.project_id && this.rootStore.channelStore.curChannelId == notice.NewMsgNotice.channel_id) {
        await this.rootStore.chatMsgStore.onNewMsg(notice.NewMsgNotice.project_id, notice.NewMsgNotice.channel_id);
      }
      //更新未读消息数量
      this.rootStore.projectStore.updateProjectUnreadMsgCount(notice.NewMsgNotice.project_id);
    } else if (notice.SetWorkSnapShotNotice !== undefined) {
      if (notice.SetWorkSnapShotNotice.project_id == this.rootStore.projectStore.curProjectId) {
        await this.rootStore.memberStore.updateSnapShot(notice.SetWorkSnapShotNotice.member_user_id, notice.SetWorkSnapShotNotice.enable);
      }
      if (notice.SetWorkSnapShotNotice.member_user_id == this.rootStore.userStore.userInfo.userId) {
        await this.rootStore.projectStore.updateSnapShot(notice.SetWorkSnapShotNotice.project_id, notice.SetWorkSnapShotNotice.enable);
      }
    } else if (notice.UserOnlineNotice !== undefined) {
      await this.rootStore.memberStore.updateOnline(notice.UserOnlineNotice.user_id, true);
    } else if (notice.UserOfflineNotice !== undefined) {
      await this.rootStore.memberStore.updateOnline(notice.UserOfflineNotice.user_id, false);
    } else if (notice.NewEventNotice !== undefined) {
      if (notice.NewEventNotice.project_id == this.rootStore.projectStore.curProjectId) {
        await this.rootStore.memberStore.updateLastEvent(notice.NewEventNotice.project_id, notice.NewEventNotice.member_user_id, notice.NewEventNotice.event_id);
      }
      this.rootStore.projectStore.addNewEventCount(notice.NewEventNotice.project_id);
    } else if (notice.SetMemberRoleNotice !== undefined) {
      if (notice.SetMemberRoleNotice.project_id == this.rootStore.projectStore.curProjectId) {
        //TODO 更新成员信息
      }
    } else if (notice.ReminderNotice !== undefined) {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }
      if (permissionGranted) {
        let linkType = "";
        if (notice.ReminderNotice.link_type == MSG_LINK_TASK) {
          linkType = "任务";
        } else if (notice.ReminderNotice.link_type == MSG_LINK_BUG) {
          linkType = "缺陷";
        } else if (notice.ReminderNotice.link_type == MSG_LINK_CHANNEL) {
          linkType = "频道";
        }
        const body = `在项目 ${notice.ReminderNotice.project_name} ${linkType} ${notice.ReminderNotice.link_title} 提到了你`;
        sendNotification({ title: "凌鲨", body: body });
      }
    }
  }

  private processIssueNotice(notice: NoticeType.issue.AllNotice) {
    if (notice.NewIssueNotice !== undefined) {
      this.rootStore.projectStore.updateProjectIssueCount(notice.NewIssueNotice.project_id);
    }
    else if (notice.SetExecUserNotice !== undefined) {
      this.rootStore.projectStore.updateProjectIssueCount(notice.SetExecUserNotice.project_id);
    }
    else if (notice.SetCheckUserNotice != undefined) {
      this.rootStore.projectStore.updateProjectIssueCount(notice.SetCheckUserNotice.project_id);
    }
    else if (notice.UpdateIssueNotice != undefined) {
      this.rootStore.projectStore.updateProjectIssueCount(notice.UpdateIssueNotice.project_id);
    }
    else if (notice.UpdateIssueStateNotice != undefined) {
      this.rootStore.projectStore.updateProjectIssueCount(notice.UpdateIssueStateNotice.project_id);
    }
  }

}

export default NoticeStore;
