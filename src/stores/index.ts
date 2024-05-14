//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import MemberStore from './member';
import AppStore from './app';
import ProjectStore from './project';
import UserStore from './user';
import NoticeStore from './notice';
import LinkAuxStore from './linkAux';
import DocStore from './doc';
import IdeaStore from './idea';
import PubResStore from './pubRes';
import EntryStore from './entry';
import BoardStore from './board';
import EditorStore from './editor';
import CloudStore from './cloud';
import OrgStore from "./org";
import SkillCenterStore from './skill_center';
import LocalRepoStore from './localrepo';

export class RootStore {
  userStore: UserStore;
  projectStore: ProjectStore;
  appStore: AppStore;
  memberStore: MemberStore;
  noticeStore: NoticeStore;
  linkAuxStore: LinkAuxStore;
  docStore: DocStore;
  ideaStore: IdeaStore;
  pubResStore: PubResStore;
  entryStore: EntryStore;
  boardStore: BoardStore;
  editorStore: EditorStore;
  cloudStore: CloudStore;
  orgStore: OrgStore;
  skillCenterStore: SkillCenterStore;
  localRepoStore: LocalRepoStore;

  constructor() {
    this.userStore = new UserStore(this);
    this.projectStore = new ProjectStore(this);
    this.appStore = new AppStore(this);
    this.memberStore = new MemberStore(this);
    this.noticeStore = new NoticeStore(this);
    this.linkAuxStore = new LinkAuxStore(this);
    this.docStore = new DocStore(this);
    this.ideaStore = new IdeaStore(this);
    this.pubResStore = new PubResStore();
    this.entryStore = new EntryStore(this);
    this.boardStore = new BoardStore(this);
    this.editorStore = new EditorStore();
    this.cloudStore = new CloudStore(this);
    this.orgStore = new OrgStore(this);
    this.skillCenterStore = new SkillCenterStore(this);
    this.localRepoStore = new LocalRepoStore();
  }
}

const rootStore = new RootStore();
const _store = {
  userStore: rootStore.userStore,
  projectStore: rootStore.projectStore,
  appStore: rootStore.appStore,
  memberStore: rootStore.memberStore,
  noticeStore: rootStore.noticeStore,
  linkAuxStore: rootStore.linkAuxStore,
  docStore: rootStore.docStore,
  ideaStore: rootStore.ideaStore,
  pubResStore: rootStore.pubResStore,
  entryStore: rootStore.entryStore,
  boardStore: rootStore.boardStore,
  editorStore: rootStore.editorStore,
  cloudStore: rootStore.cloudStore,
  orgStore: rootStore.orgStore,
  skillCenterStore: rootStore.skillCenterStore,
  localRepoStore: rootStore.localRepoStore,
};

export type StoreType = typeof _store;

export default _store;
