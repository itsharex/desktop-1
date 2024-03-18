import { makeAutoObservable, runInAction } from 'mobx';
import { USER_TYPE, USER_TYPE_ATOM_GIT, USER_TYPE_INTERNAL, login, logout as user_logout } from '@/api/user';
import { request } from '@/utils/request';
import type { RootStore } from './index';
import { showMyShortNote } from '@/utils/short_note';
import { WebviewWindow } from '@tauri-apps/api/window';

type UserInfo = {
  userId: string;
  userType: USER_TYPE;
  userName: string;
  displayName: string;
  logoUri: string;
  userFsId: string;
  extraToken: string;
  testAccount: boolean;
};

class UserStore {
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.sessionId = sessionStorage.getItem('sessionId') || '';
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) this.userInfo = JSON.parse(userInfo);
    makeAutoObservable(this);
  }

  connectServerSuccess = false;
  rootStore: RootStore;
  sessionId: string;
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
  };

  // 帐号管理弹窗
  private _accountsModal = false;

  // 用户登录弹窗
  private _showUserLogin: null | (() => void) = null;

  // 重置密码
  private _isResetPassword = false;

  async logout() {
    this.rootStore.projectStore.reset();
    const tmpSessionId = this.sessionId;
    const tmpUserType = this.userInfo.userType;
    runInAction(() => {
      this.sessionId = '';
      this.userInfo = {
        userId: '',
        userType: USER_TYPE_INTERNAL,
        userName: '',
        displayName: '',
        logoUri: '',
        userFsId: '',
        extraToken: '',
        testAccount: false,
      };
    });
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('userInfo');
    if (tmpUserType == USER_TYPE_ATOM_GIT) {
      const label = "atomGitLogout";
      const win = new WebviewWindow(label, {
        url: 'https://passport.atomgit.com/login/profile/logout',
        title: "退出AtomGit登录",
        width: 200,
        height: 100,
      });
      win.minimize();

      setTimeout(() => {
        const win = WebviewWindow.getByLabel(label);
        if (win != null) {
          win.close();
        }
      }, 3000);
    }
    await request(user_logout(tmpSessionId));
  }

  async callLogin(username: string, password: string, userType: USER_TYPE) {
    const res = await request(login(username, password, userType));

    if (res) {
      runInAction(() => {
        this.sessionId = res.session_id;
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
        };
        sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        this.rootStore.projectStore.initLoadProjectList();
      });
      await showMyShortNote(res.session_id);
    }
    if (this._showUserLogin != null) {
      this._showUserLogin();
      runInAction(() => {
        this._showUserLogin = null;
      });
    }
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
    if (this.sessionId && this.userInfo) {
      runInAction(() => {
        this.userInfo.displayName = val;
      });
    }
  }

  updateLogoUri(val: string) {
    if (this.sessionId && this.userInfo) {
      runInAction(() => {
        this.userInfo.logoUri = val;
      });
    }
  }

  updateExtraToken(val: string) {
    if (this.sessionId && this.userInfo) {
      runInAction(() => {
        this.userInfo.extraToken = val;
      });
    }
  }
}

export default UserStore;
