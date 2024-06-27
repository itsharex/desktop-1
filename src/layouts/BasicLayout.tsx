//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import BottomNav from '@/components/BottomNav';
import { useStores } from '@/hooks';
import type { IRouteConfig } from '@/routes';
import { PUB_RES_PATH, WORKBENCH_PATH } from '@/utils/constant';
import { Layout, Modal } from 'antd';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { renderRoutes } from 'react-router-config';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import LeftMenu from '../components/LeftMenu';
import Toolbar from '../components/Toolbar';
import style from './style.module.less';
import LoginModal from '@/pages/User/LoginModal';
import GlobalServerModal from '@/components/GlobalSetting/GlobalServerModal';
import StartMinApp from '@/components/MinApp/StartMinApp';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { get_session } from '@/api/user';
import { remove_info_file } from '@/api/local_api';
import { exit } from '@tauri-apps/api/process';
import PasswordModal from '@/components/PasswordModal';
import UpdateDisplayNameModal from '@/pages/User/UpdateDisplayNameModal';
import Profile from '@/components/Profile';
import { request } from '@/utils/request';
import * as fsApi from '@/api/fs';
import { update as update_user } from '@/api/user';
import { AdminLoginModal } from '@/pages/User/AdminLoginModal';

const { Content } = Layout;

const BasicLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
  const history = useHistory();
  const { pathname } = useLocation();

  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const orgStore = useStores('orgStore');
  const noticeStore = useStores('noticeStore');
  const appStore = useStores('appStore');

  noticeStore.setHistory(history);

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const type = urlParams.get('type');


  const uploadUserLogo = async (data: string | null) => {
    if (data === null) {
      return;
    }
    //上传文件
    const uploadRes = await request(fsApi.write_file_base64(userStore.sessionId, userStore.userInfo.userFsId, "portrait.png", data, ""));
    console.log(uploadRes);
    if (!uploadRes) {
      return;
    }
    //设置文件owner
    const ownerRes = await request(fsApi.set_file_owner({
      session_id: userStore.sessionId,
      fs_id: userStore.userInfo.userFsId,
      file_id: uploadRes.file_id,
      owner_type: fsApi.FILE_OWNER_TYPE_USER_PHOTO,
      owner_id: userStore.userInfo.userId,
    }));
    if (!ownerRes) {
      return;
    }
    //设置头像url
    const logoUri = `fs://localhost/${userStore.userInfo.userFsId}/${uploadRes.file_id}/portrait.png`;
    const updateRes = await request(update_user(userStore.sessionId, {
      display_name: userStore.userInfo.displayName,
      logo_uri: logoUri,
    }));
    if (updateRes) {
      userStore.showChangeLogo = false;
    }
    userStore.updateLogoUri(logoUri);
  };

  useEffect(() => {
    userStore.isResetPassword = (type === 'resetPassword');
  });

  useEffect(() => {
    if (userStore.sessionId == "") {
      return;
    }
    const t = setInterval(() => {
      get_session().then(sessInRust => {
        if (sessInRust == "") {
          userStore.logout();
        }
      });
    }, 2000);

    return () => clearInterval(t);
  }, [userStore.sessionId]);

  return (
    <HotkeysProvider>
      <Layout className={style.basicLayout}>
        <LeftMenu />
        <Layout>
          <Header />
          <ErrorBoundary>
            <Content
              className={classNames(
                style.basicContent,
                pathname !== WORKBENCH_PATH && style.showbottomnav,
              )}
            >
              {renderRoutes(route.routes, { sessionId: userStore.sessionId, projectId: projectStore.curProjectId })}
            </Content>
          </ErrorBoundary>
          {projectStore.curProjectId != "" && <Toolbar />}
          {projectStore.curProjectId != "" && <BottomNav />}
        </Layout>
        {userStore.showUserLogin && <LoginModal />}
        {appStore.showGlobalServerModal && <GlobalServerModal />}
        {appStore.openMinAppId != "" && <StartMinApp />}
        {userStore.showLogout == true && (
          <Modal
            open
            title="退出"
            onCancel={() => userStore.showLogout = false}
            onOk={() => {
              userStore.logout();
              userStore.showLogout = false;
              projectStore.setCurProjectId("");
              orgStore.setCurOrgId("");
              if (location.pathname.startsWith(WORKBENCH_PATH) || location.pathname.startsWith(PUB_RES_PATH)) {
                //do nothing
              } else {
                history.push(WORKBENCH_PATH);
              }
            }}
          >
            <p style={{ textAlign: 'center' }}>是否确认退出?</p>
          </Modal>
        )}
        {appStore.showExit == true && (
          <Modal open title="关闭应用"
            okText="关闭" okButtonProps={{ danger: true }}
            onCancel={e => {
              e.stopPropagation();
              e.preventDefault();
              appStore.showExit = false;
            }}
            onOk={e => {
              e.stopPropagation();
              e.preventDefault();
              remove_info_file().then(() => exit(0));
            }}>
            是否关闭应用?
          </Modal>
        )}
        {userStore.showChangePasswd && (
          <PasswordModal visible={userStore.showChangePasswd} onCancel={() => userStore.showChangePasswd = false} />
        )}
        {userStore.showChangeNickName && (
          <UpdateDisplayNameModal onClose={() => userStore.showChangeNickName = false} />
        )}
        {userStore.showChangeLogo == true && (
          <Profile
            visible={userStore.showChangeLogo}
            defaultSrc={userStore.userInfo.logoUri ?? ""}
            onCancel={() => userStore.showChangeLogo = false}
            onOK={(data: string | null) => uploadUserLogo(data)}
          />
        )}
        {userStore.showAdminLogin == true && (
                <AdminLoginModal onClose={() => userStore.showAdminLogin = false} />
            )}
      </Layout>
    </HotkeysProvider>
  );
};

export default observer(BasicLayout);
