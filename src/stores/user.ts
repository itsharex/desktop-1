import { makeAutoObservable, runInAction } from 'mobx';
import { type FeatureInfo, type USER_TYPE, USER_TYPE_ATOM_GIT, USER_TYPE_INTERNAL, get_session, login, logout as user_logout } from '@/api/user';
import { request } from '@/utils/request';
import type { RootStore } from './index';
import { showMyShortNote } from '@/utils/short_note';
import { WebviewWindow } from '@tauri-apps/api/window';
import { sleep } from '@/utils/time';
import { get_status } from "@/api/user_notice";

type UserInfo = {
  userId: string;
  userType: USER_TYPE;
  userName: string;
  displayName: string;
  logoUri: string;
  userFsId: string;
  extraToken: string;
  testAccount: boolean;
  unReadNotice: number;
  totalNotice: number;
  featureInfo: FeatureInfo;
};

class UserStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this._sessionId = sessionStorage.getItem('sessionId') || '';
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) this.userInfo = JSON.parse(userInfo);
    makeAutoObservable(this);
  }

  connectServerSuccess = false;
  rootStore: RootStore;
  _sessionId: string;
  adminSessionId = "";
  userInfo: UserInfo = {
    userId: '',
    userType: USER_TYPE_INTERNAL,
    userName: '',
    displayName: '',
    logoUri: '',
    userFsId: '',
    extraToken: '',
    testAccount: false,
    unReadNotice: 0,
    totalNotice: 0,
    featureInfo: {
      enable_project: false,
      enable_org: false,
    },
  };

  // 帐号管理弹窗
  private _accountsModal = false;

  // 用户登录弹窗
  private _showUserLogin: null | (() => void) = null;

  // 重置密码
  private _isResetPassword = false;

  private async closeAtomLogoutWindow(label: string) {
    const win = WebviewWindow.getByLabel(label);
    if (win == null) {
      return;
    }
    await win.minimize();
    setTimeout(() => {
      win.close();
    }, 3000);
  }

  get sessionId() {
    get_session().then(sessInRust => {
      if (this._sessionId != "" && sessInRust == "") {
        this.logout();
      }
    });
    return this._sessionId;
  }

  async logout() {
    this.rootStore.projectStore.reset();
    const tmpSessionId = this._sessionId;
    const tmpUserType = this.userInfo.userType;
    runInAction(() => {
      this._sessionId = '';
      this.userInfo = {
        userId: '',
        userType: USER_TYPE_INTERNAL,
        userName: '',
        displayName: '',
        logoUri: '',
        userFsId: '',
        extraToken: '',
        testAccount: false,
        unReadNotice: 0,
        totalNotice: 0,
        featureInfo: {
          enable_project: false,
          enable_org: false,
        },
      };
    });
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('userInfo');
    if (tmpUserType == USER_TYPE_ATOM_GIT) {
      const label = "atomGitLogout";
      try {
        const oldWin = WebviewWindow.getByLabel(label);
        if (oldWin != null) {
          await oldWin.close();
          await sleep(1000);
        }
      } catch (e) {
        console.log(e);
      }
      const win = new WebviewWindow(label, {
        url: 'https://passport.atomgit.com/login/profile/logout',
        title: "退出AtomGit登录",
        width: 200,
        height: 100,
      });
      win.once('tauri://created', () => {
        this.closeAtomLogoutWindow(label);
      });

    }
    await request(user_logout(tmpSessionId));
  }

  async callLogin(username: string, password: string, userType: USER_TYPE) {
    const res = await request(login(username, password, userType));

    if (res) {
      runInAction(() => {
        this._sessionId = res.session_id;
        sessionStorage.setItem('sessionId', res.session_id);
        this.userInfo = {
          userId: res.user_info.user_id,
          userType: userType,
          userName: res.user_info.user_name,
          displayName: res.user_info.basic_info.display_name,
          logoUri: res.user_info.basic_info.logo_uri,
          userFsId: res.user_info.user_fs_id,
          extraToken: res.extra_token,
          testAccount: res.user_info.test_account,
          unReadNotice: 0,
          totalNotice: 0,
          featureInfo: res.user_info.feature ?? {
            enable_project: false,
            enable_org: false,
          },
        };
        this.rootStore.projectStore.initLoadProjectList();
        this.rootStore.orgStore.initLoadOrgList();
      });
      await showMyShortNote(res.session_id);
      await this.updateNoticeStatus(res.session_id);
      sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    }
    if (this._showUserLogin != null) {
      this._showUserLogin();
      runInAction(() => {
        this._showUserLogin = null;
      });
    }
  }

  async updateNoticeStatus(sessionId: string) {
    const res = await request(get_status({ session_id: sessionId }));
    runInAction(() => {
      this.userInfo.unReadNotice = res.un_read_count;
      this.userInfo.totalNotice = res.total_count;
    });
  }

  get accountsModal() {
    return this._accountsModal;
  }

  set accountsModal(val: boolean) {
    runInAction(() => {
      this._accountsModal = val;
    });
  }

  get showUserLogin() {
    return this._showUserLogin;
  }

  set showUserLogin(val: (() => void) | null) {
    runInAction(() => {
      this._showUserLogin = val;
    });
  }

  get isResetPassword() {
    return this._isResetPassword;
  }

  set isResetPassword(val: boolean) {
    runInAction(() => {
      this._isResetPassword = val;
    });
  }

  updateDisplayName(val: string) {
    if (this._sessionId != "" && this.userInfo) {
      runInAction(() => {
        this.userInfo.displayName = val;
      });
    }
  }

  updateLogoUri(val: string) {
    if (this._sessionId != "" && this.userInfo) {
      runInAction(() => {
        this.userInfo.logoUri = val;
      });
    }
  }

  updateExtraToken(val: string) {
    if (this._sessionId != "" && this.userInfo) {
      runInAction(() => {
        this.userInfo.extraToken = val;
      });
    }
  }

  updateFeature(val: FeatureInfo) {
    if (this._sessionId != "" && this.userInfo) {
      runInAction(() => {
        this.userInfo.featureInfo = val;
      });
    }
  }
}

export default UserStore;

