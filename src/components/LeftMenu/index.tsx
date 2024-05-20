//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import workbench_icon from '@/assets/allIcon/workbench_icon.png';
import { useStores } from '@/hooks';
import { Layout } from 'antd';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import cls from './index.module.less';
const { Sider } = Layout;
import ProjectList from './ProjectList';
import { GlobalOutlined, RocketOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { APP_EXTERN_PAGE_PATH, PUB_RES_PATH, SKILL_CENTER_PATH, WORKBENCH_PATH } from '@/utils/constant';
import OrgList from './OrgList';
import { getVersion } from '@tauri-apps/api/app';
import { open as shell_open } from '@tauri-apps/api/shell';


const LeftMenu: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  const userStore = useStores('userStore');
  const appStore = useStores('appStore');
  const projectStore = useStores('projectStore');
  const orgStore = useStores('orgStore');

  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(res => setVersion(res));
  }, []);

  return (
    <Sider className={cls.sider}>
      <div style={{ height: "10px" }} />
      <div>
        <div className={`${cls.workbench_menu} ${location.pathname.startsWith(WORKBENCH_PATH) ? cls.active_menu : ""}`}
          style={{ marginLeft: "10px", marginRight: "10px", paddingBottom: "4px", paddingLeft: "10px" }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (appStore.inEdit) {
              appStore.showCheckLeave(() => {
                history.push(WORKBENCH_PATH);
                projectStore.setCurProjectId("");
                orgStore.setCurOrgId("");
                appStore.curExtraMenu = null;
              });
            } else {
              history.push(WORKBENCH_PATH);
              projectStore.setCurProjectId("");
              orgStore.setCurOrgId("");
              appStore.curExtraMenu = null;
            }
          }}>
          <img src={workbench_icon} alt="" className={cls.workbench_icon} />
          工作台
        </div>
        {userStore.sessionId != "" && userStore.userInfo.featureInfo.enable_project && (
          <>
            <div style={{ borderBottom: "2px dotted #333", margin: "5px 24px", paddingTop: "5px" }} />
            <ProjectList />
          </>
        )}

        {userStore.sessionId != "" && userStore.userInfo.featureInfo.enable_org && (
          <>
            <div style={{ borderTop: "2px dotted #333", margin: "5px 24px", paddingTop: "5px" }} />
            <OrgList />
          </>
        )}

        <div style={{ borderTop: "2px dotted #333", margin: "5px 24px" }} />

        <div className={`${cls.workbench_menu} ${location.pathname.startsWith(PUB_RES_PATH) ? cls.active_menu : ""}`}
          style={{ marginLeft: "10px", marginRight: "10px", paddingBottom: "4px", paddingLeft: "10px" }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (appStore.inEdit) {
              appStore.showCheckLeave(() => {
                history.push(PUB_RES_PATH);
                projectStore.setCurProjectId("");
                orgStore.setCurOrgId("");
                appStore.curExtraMenu = null;
              });
              return;
            }
            history.push(PUB_RES_PATH);
            projectStore.setCurProjectId("");
            orgStore.setCurOrgId("");
            appStore.curExtraMenu = null;
          }}>
          <GlobalOutlined />&nbsp;公共资源
        </div>
        {userStore.sessionId != "" && userStore.userInfo.featureInfo.enable_skill_center && (
          <div className={`${cls.workbench_menu} ${location.pathname.startsWith(SKILL_CENTER_PATH) ? cls.active_menu : ""}`}
            style={{ marginLeft: "10px", marginRight: "10px", paddingBottom: "4px", paddingLeft: "10px" }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              if (appStore.inEdit) {
                appStore.showCheckLeave(() => {
                  projectStore.setCurProjectId("");
                  orgStore.setCurOrgId("");
                  appStore.curExtraMenu = null;
                  history.push(SKILL_CENTER_PATH);
                });
                return;
              }
              projectStore.setCurProjectId("");
              orgStore.setCurOrgId("");
              appStore.curExtraMenu = null;
              history.push(SKILL_CENTER_PATH);
            }}>
            <RocketOutlined />&nbsp;技能中心
          </div>
        )}
        {(appStore.clientCfg?.item_list.filter(item => item.main_menu) ?? []).length > 0 && (
          <div style={{ borderTop: "2px dotted #333", margin: "5px 24px" }} />
        )}
        {appStore.clientCfg?.item_list.filter(item => item.main_menu).map(item => (
          <div className={`${cls.workbench_menu} ${appStore.curExtraMenu?.menu_id == item.menu_id ? cls.active_menu : ""}`}
            key={item.menu_id}
            style={{ marginLeft: "10px", marginRight: "10px", paddingBottom: "4px", paddingLeft: "10px" }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              if (item.open_in_browser) {
                shell_open(item.url);
              } else {
                projectStore.setCurProjectId("");
                orgStore.setCurOrgId("");
                appStore.curExtraMenu = item;
                history.push(APP_EXTERN_PAGE_PATH);
              }
            }}
          >
            <GlobalOutlined />&nbsp;{item.name}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: "2px", right: "10px", cursor: "pointer" }} onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        shell_open("https://atomgit.com/openlinksaas/desktop/tags?tab=release");
      }}>
        软件版本:{version}
      </div>
    </Sider>
  );
};
export default observer(LeftMenu);
