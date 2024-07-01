//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import s from './index.module.less';
import { useHistory, useLocation } from 'react-router-dom';
import { PUB_RES_PATH, WORKBENCH_PATH } from '@/utils/constant';
import { useStores } from '@/hooks';
import Card from './components/Card';
import InfoCount from './components/InfoCount';
import { Modal, Popover, Space, Tabs } from 'antd';
import { observer } from 'mobx-react';
import { AppstoreOutlined, DoubleRightOutlined, ExportOutlined, FolderOutlined, MoreOutlined, WarningOutlined } from '@ant-design/icons';
import Button from '@/components/Button';
import UserAppList from './UserAppList';
import LocalRepoList from './LocalRepoList';
import AddRepoModal from './components/AddRepoModal';
import { USER_TYPE_ATOM_GIT, USER_TYPE_GITEE, USER_TYPE_JIHU_LAB } from '@/api/user';
import iconAtomgit from '@/assets/allIcon/icon-atomgit.png';
import iconGitee from '@/assets/allIcon/icon-gitee.png';
import iconGitlab from '@/assets/allIcon/icon-gitlab.png';
import AtomGitPanel from './AtomGitPanel';
import { open as shell_open } from '@tauri-apps/api/shell';
import GitConfigModal from './components/GitConfigModal';
import DevContextList from './DevContextList';
import type { CommandResult } from "@/pages/Devc/components/types";
import { Command } from "@tauri-apps/api/shell";
import { InstallDockerHelp } from './components/LaunchRepoModal';
import { install_lfs } from "@/api/git_wrap";
import GiteePanel from './GiteePanel';
import JihulabPanel from './JihulabPanel';

const Workbench: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const urlParams = new URLSearchParams(location.search);

  const appStore = useStores('appStore');
  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const orgStore = useStores('orgStore');
  const localRepoStore = useStores("localRepoStore");

  const tab = urlParams.get('tab') ?? "localRepo";

  const [showAddRepoModal, setShowAddRepoModal] = useState(false);
  const [showGitConfigModal, setShowGitConfigModal] = useState(false);
  const [showGitLfsConfigModal, setShowGitLfsConfigModal] = useState(false);
  const [hasDocker, setHasDocker] = useState<boolean | null>(null);

  const checkDocker = async () => {
    const cmd = Command.sidecar("bin/devc", ["image", "exist", "ccr.ccs.tencentyun.com/linksaas/code-server:latest"]);
    const output = await cmd.execute();
    const result = JSON.parse(output.stdout) as CommandResult;
    if (result.success) {
      setHasDocker(true);
    } else {
      setHasDocker(false);
    }
  };


  useMemo(() => {
    projectStore.setCurProjectId('');
    orgStore.setCurOrgId("");
  }, []);

  useEffect(() => {
    if (userStore.sessionId == "" && ["atomGit", "gitee", "jihulab", "learnRecord"].includes(tab)) {
      history.push(`${WORKBENCH_PATH}?tab=localRepo`);
    }
  }, [userStore.sessionId]);

  useEffect(() => {
    if (["localRepo", "atomGit", "gitee", "jihulab"].includes(tab)) {
      localRepoStore.init();
    }
  }, [tab]);

  return (
    <div className={s.workbench_wrap}>
      <Card className={s.infoCount_wrap} childStyle={{ height: '100%' }}>
        {!userStore.isResetPassword && <InfoCount />}
      </Card>
      <Tabs activeKey={tab} className={s.my_wrap} type="card"
        onChange={key => {
          if (key == "devContext") {
            checkDocker();
          }
          history.push(`${WORKBENCH_PATH}?tab=${key}`);
        }}
        tabBarExtraContent={
          <div>
            {tab == "userApp" && (
              <Popover placement='bottom' overlayClassName="global_help"
                open={appStore.showHelp} title="前往应用市场" content="应用市场提供了研发常用的小工具">
                <Button
                  type="link"
                  style={{ marginRight: "20px" }} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    history.push(`${PUB_RES_PATH}?tab=appStore`);
                  }}>前往应用市场<DoubleRightOutlined /></Button>
              </Popover>
            )}
            {tab == "localRepo" && localRepoStore.checkResult != null && (
              <Space>
                {localRepoStore.checkResult.hasGit == false && (
                  <>
                    <Popover placement='bottom' overlayClassName="global_help"
                      open={appStore.showHelp}
                      content={<p style={{ fontWeight: 700 }}>需要本地安装Git工具后才能使用本地仓库功能</p>}>
                      <Button type="text" style={{ color: "red", fontWeight: 700, fontSize: "14px" }}
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          shell_open("https://git-scm.com/downloads");
                        }}><WarningOutlined />安装Git工具</Button>
                    </Popover>
                    <Button type="default" onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      localRepoStore.checkGitEnv();
                    }}>重新检测</Button>
                  </>
                )}
                {localRepoStore.checkResult.hasGit && localRepoStore.checkResult.hasConfigGit == false && (
                  <Button type="text" style={{ color: "red", fontWeight: 700, fontSize: "14px" }}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowGitConfigModal(true);
                    }}><WarningOutlined />未配置git用户</Button>
                )}
                {localRepoStore.checkResult.hasGit && localRepoStore.checkResult.hasConfigGit && localRepoStore.checkResult.hasGitLfs == false && (
                  <>
                    <Button type="text" style={{ color: "red", fontWeight: 700, fontSize: "14px" }}
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        shell_open("https://git-lfs.com/");
                      }}><WarningOutlined />安装GitLfs工具</Button>
                    <Button type="default" onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      localRepoStore.checkGitEnv();
                    }}>重新检测</Button>
                  </>
                )}
                {localRepoStore.checkResult.hasGit && localRepoStore.checkResult.hasConfigGit && localRepoStore.checkResult.hasGitLfs && localRepoStore.checkResult.hasConfigGitLfs == false && (
                  <Button type="text" style={{ color: "red", fontWeight: 700, fontSize: "14px" }}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowGitLfsConfigModal(true);
                    }}><WarningOutlined />未配置GitLfs</Button>
                )}
                {localRepoStore.checkResult.hasGit && (
                  <Popover placement='bottom' overlayClassName="global_help"
                    open={appStore.showHelp} content="添加本地仓库或clone远程仓库">
                    <Button style={{ marginRight: "20px" }}
                      onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddRepoModal(true);
                      }}>
                      添加代码仓库
                    </Button>
                  </Popover>
                )}
                <Popover trigger="click" placement="bottom" content={
                  <Space direction="vertical" style={{ padding: "10px 10px" }}>
                    <Button type="link" onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowGitConfigModal(true);
                    }}>配置git用户</Button>
                  </Space>
                }>
                  <MoreOutlined style={{ marginRight: "32px" }} />
                </Popover>
              </Space>
            )}
            {tab == "atomGit" && (
              <Space>
                <Button type="link" onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  shell_open("https://atomgit.com/project/new");
                }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>
                    创建项目&nbsp;<ExportOutlined />
                  </span>
                </Button>
                <Popover trigger="click" placement="bottom" content={
                  <div style={{ padding: "10px 10px" }}>
                    <Button type="link" onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      shell_open("https://docs.atomgit.com");
                    }}>查看帮助&nbsp;<ExportOutlined /></Button>
                  </div>
                }>
                  <MoreOutlined style={{ marginRight: "32px" }} />
                </Popover>
              </Space>
            )}
            {tab == "gitee" && (
              <Space>
                <Button type="link" onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  shell_open("https://gitee.com/projects/new");
                }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>
                    创建项目&nbsp;<ExportOutlined />
                  </span>
                </Button>
                <Popover trigger="click" placement="bottom" content={
                  <div style={{ padding: "10px 10px" }}>
                    <Button type="link" onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      shell_open("https://help.gitee.com/");
                    }}>查看帮助&nbsp;<ExportOutlined /></Button>
                  </div>
                }>
                  <MoreOutlined style={{ marginRight: "32px" }} />
                </Popover>
              </Space>
            )}
            {tab == "jihulab" && (
              <Space>
                <Button type="link" onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  shell_open("https://jihulab.com/projects/new");
                }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>
                    创建项目&nbsp;<ExportOutlined />
                  </span>
                </Button>
                <Popover trigger="click" placement="bottom" content={
                  <div style={{ padding: "10px 10px" }}>
                    <Button type="link" onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      shell_open("https://jihulab.com/help");
                    }}>查看帮助&nbsp;<ExportOutlined /></Button>
                  </div>
                }>
                  <MoreOutlined style={{ marginRight: "32px" }} />
                </Popover>
              </Space>
            )}
            {tab == "devContext" && (
              <Space>
                {hasDocker == false && (
                  <>
                    <span style={{ color: "red" }}>未安装/启动Docker引擎!&nbsp;&nbsp;</span>
                    <InstallDockerHelp />
                  </>
                )}
                <Button type="primary" onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  checkDocker();
                }}>重新检查docker</Button>
              </Space>
            )}
          </div>
        }>
        {userStore.sessionId != "" && userStore.userInfo.userType == USER_TYPE_ATOM_GIT && (
          <Tabs.TabPane tab={<h2><img src={iconAtomgit} style={{ width: "14px", marginRight: "10px", marginTop: "-4px" }} />AtomGit</h2>} key="atomGit">
            {tab == "atomGit" && (
              <div className={s.content_wrap}>
                <AtomGitPanel />
              </div>
            )}
          </Tabs.TabPane>
        )}
        {userStore.sessionId != "" && userStore.userInfo.userType == USER_TYPE_GITEE && (
          <Tabs.TabPane tab={<h2><img src={iconGitee} style={{ width: "14px", marginRight: "10px", marginTop: "-4px" }} />Gitee</h2>} key="gitee">
            {tab == "gitee" && (
              <div className={s.content_wrap}>
                <GiteePanel />
              </div>
            )}
          </Tabs.TabPane>
        )}
        {userStore.sessionId != "" && userStore.userInfo.userType == USER_TYPE_JIHU_LAB && (
          <Tabs.TabPane tab={<h2><img src={iconGitlab} style={{ width: "14px", marginRight: "10px", marginTop: "-4px" }} />极狐</h2>} key="jihulab">
            {tab == "jihulab" && (
              <div className={s.content_wrap}>
                <JihulabPanel />
              </div>
            )}
          </Tabs.TabPane>
        )}
        <Tabs.TabPane tab={<h2><FolderOutlined />本地仓库</h2>} key="localRepo">
          {tab == "localRepo" && (
            <div className={s.content_wrap}>
              <LocalRepoList />
            </div>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab={<h2><AppstoreOutlined />我的微应用</h2>} key="userApp">
          {tab == "userApp" && (
            <div className={s.content_wrap}>
              <UserAppList />
            </div>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab={<h2><AppstoreOutlined />开发环境</h2>} key="devContext">
          {tab == "devContext" && (
            <div className={s.content_wrap}>
              <DevContextList hasDocker={hasDocker} />
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
      {showAddRepoModal == true && (
        <AddRepoModal onCancel={() => setShowAddRepoModal(false)} onOk={() => {
          localRepoStore.loadRepoList();
          setShowAddRepoModal(false);
        }} />
      )}
      {showGitConfigModal == true && (
        <GitConfigModal onCancel={() => setShowGitConfigModal(false)} onOk={() => {
          setShowGitConfigModal(false);
          localRepoStore.checkGitEnv();
        }} />
      )}
      {showGitLfsConfigModal == true && (
        <Modal open title="配置GitLfs"
          okText="执行"
          onCancel={e => {
            e.stopPropagation();
            e.preventDefault();
            setShowGitLfsConfigModal(false);
          }}
          onOk={e => {
            e.stopPropagation();
            e.preventDefault();
            install_lfs().then(() => {
              setShowGitLfsConfigModal(false);
              localRepoStore.checkGitEnv();
            });
          }}>
          是否执行git lfs install?
        </Modal>
      )}
    </div>
  );
};

export default observer(Workbench);
