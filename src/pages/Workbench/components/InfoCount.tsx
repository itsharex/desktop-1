//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from 'react';
import s from './infoCount.module.less';
import memberIcon from '@/assets/allIcon/icon-member.png';
import { useStores } from '@/hooks';
import UserPhoto from '@/components/Portrait/UserPhoto';
import { observer } from 'mobx-react';
import { Button, Form, Input, Modal, Popover, Space, Switch, message } from 'antd';
import { request } from '@/utils/request';
import { get_my_todo_status } from "@/api/project_issue";
import MyTodoListModal from './MyTodoListModal';
import { useHistory } from 'react-router-dom';
import { APP_ORG_MANAGER_PATH, APP_PROJECT_MANAGER_PATH, PUB_RES_PATH, SKILL_CENTER_PATH, WORKBENCH_PATH } from '@/utils/constant';
import { list_ssh_key_name } from '@/api/local_repo';
import SshKeyListModal from './SshKeyListModal';
import { FeatureInfo, update_feature, USER_TYPE_INTERNAL, update as update_user } from '@/api/user';
import { PlusSquareTwoTone } from '@ant-design/icons';
import { joinOrgOrProject } from '@/components/LeftMenu/join';
import Profile from '@/components/Profile';
import * as fsApi from '@/api/fs';
import PasswordModal from '@/components/PasswordModal';
import UpdateDisplayNameModal from '@/pages/User/UpdateDisplayNameModal';

interface JoinModalProps {
  onClose: () => void;
}

const JoinModal = observer((props: JoinModalProps) => {
  const history = useHistory();

  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const orgStore = useStores('orgStore');

  const [linkText, setLinkText] = useState('');

  const runJoin = async () => {
    await joinOrgOrProject(linkText, userStore, projectStore, orgStore, history);
    props.onClose();
  };

  return (
    <Modal open title="加入项目/团队"
      okText="加入" okButtonProps={{ disabled: linkText == "" }}
      onCancel={e => {
        e.stopPropagation();
        e.preventDefault();
        props.onClose();
      }}
      onOk={e => {
        e.stopPropagation();
        e.preventDefault();
        runJoin();
      }}>
      <Form labelCol={{ span: 3 }} style={{ paddingRight: "20px" }}>
        <Form.Item label="邀请码">
          <Input
            placeholder="请输入邀请码"
            allowClear
            onChange={(e) => setLinkText(e.target.value.trim())}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
});

const InfoCount = () => {
  const history = useHistory();

  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const orgStore = useStores('orgStore');
  const appStore = useStores('appStore');

  const [myTodoCount, setMyTodoCount] = useState(0);
  const [sshKeyCount, setSshKeyCount] = useState(0);
  const [showMyTodoModal, setShowMyTodoModal] = useState(false);
  const [showSshKeyModal, setShowSshKeyModal] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUpdateDisplayNameModal, setShowUpdateDisplayNameModal] = useState(false);

  const [pictrueListVisible, setPictrueListVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const loadMyTodoCount = async () => {
    if (userStore.sessionId == "") {
      return;
    }
    const res = await request(get_my_todo_status({
      session_id: userStore.sessionId,
    }));
    setMyTodoCount(res.total_count);
  };

  const loadSshKeyCount = async () => {
    const sshKeyNameList = await list_ssh_key_name();
    setSshKeyCount(sshKeyNameList.length);
  };


  const uploadFile = async (data: string | null) => {
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
      setPictrueListVisible(false);
    }
    userStore.updateLogoUri(logoUri);
  };

  useEffect(() => {
    loadMyTodoCount();
  }, [userStore.sessionId]);

  useEffect(() => {
    loadSshKeyCount();
  }, []);



  return (
    <div className={s.infoCount_wrap}>
      {(appStore.clientCfg?.disable_login ?? false) == true && (<div className={s.left_wrap} />)}
      {(appStore.clientCfg?.disable_login ?? false) == false && (
        <div className={s.left_wrap}>
          <Popover placement='bottom' overlayClassName="global_help"
            open={appStore.showHelp && userStore.sessionId != "" && userStore.userInfo.userType == USER_TYPE_INTERNAL && !userStore.userInfo.testAccount}
            title="更改用户头像" content="可以修改用户头像">
            <div style={{ cursor: (userStore.userInfo.testAccount || userStore.userInfo.userType != USER_TYPE_INTERNAL || userStore.sessionId == "") ? "default" : "pointer" }}
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                if (userStore.sessionId == "") {
                  return;
                }
                if (userStore.userInfo.testAccount) {
                  return;
                }
                if (userStore.userInfo.userType != USER_TYPE_INTERNAL) {
                  return;
                }
                setPictrueListVisible(true);
                userStore.accountsModal = false;
              }}>
              <UserPhoto logoUri={userStore.userInfo.logoUri} width='60px' style={{ border: "1px solid white", borderRadius: "30px", marginRight: "14px" }} />
            </div>
          </Popover>
          <div className={s.content}>
            {userStore.sessionId != "" && (
              <div className={s.name}>
                欢迎您！
                <Popover placement='right' overlayClassName="global_help"
                  open={appStore.showHelp && userStore.userInfo.userType == USER_TYPE_INTERNAL} content="可修改昵称">
                  <span style={{ cursor: userStore.userInfo.userType == USER_TYPE_INTERNAL ? "pointer" : undefined }}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (userStore.userInfo.userType == USER_TYPE_INTERNAL) {
                        setShowUpdateDisplayNameModal(true);
                      }
                    }}>{userStore.userInfo.displayName}</span>
                </Popover>
              </div>
            )}
            <div
              className={s.account}
            >
              {userStore.sessionId != "" && (
                <img src={memberIcon} alt="" />
              )}
              {userStore.sessionId == "" ? (
                <Popover placement='right' overlayClassName="global_help"
                  open={appStore.showHelp} destroyTooltipOnHide
                  title="登录凌鲨" content={
                    <div>
                      <p>登录后可使用项目，团队和技能中心功能</p>
                      {((appStore.clientCfg?.atom_git_client_id ?? "") != "" || (appStore.clientCfg?.gitee_client_id ?? "") != "") && (
                        <p>同时支持外部账号{`${(appStore.clientCfg?.atom_git_client_id ?? "") != "" ? " AtomGit" : ""} ${(appStore.clientCfg?.gitee_client_id ?? "") != "" ? " Gitee" : ""} ${(appStore.clientCfg?.jihulab_client_id ?? "") != "" ? " Jihulab" : ""}`}</p>
                      )}

                    </div>
                  } >
                  <Button type="primary"
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      userStore.showUserLogin = () => { };
                    }}>登录</Button>
                </Popover>
              ) : (
                <Space style={{ paddingLeft: "2px" }}>
                  {userStore.userInfo.testAccount == false && userStore.userInfo.userType == USER_TYPE_INTERNAL && (
                    <a onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      setPasswordVisible(true);
                      userStore.accountsModal = false;
                    }}>修改密码</a>
                  )}
                  <a style={{ fontSize: "12px" }} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (appStore.inEdit) {
                      message.info("请先保存修改内容");
                      return;
                    }
                    setShowExit(true);
                    userStore.accountsModal = false;
                  }}>退出登录</a>
                </Space>
              )}
            </div>
          </div>
        </div>
      )}



      <div className={s.right_wrap}>
        <Popover placement='left' overlayClassName="global_help"
          title="管理SSH密钥"
          content="SSH密钥用于clone,push,pull代码仓库"
          open={appStore.showHelp}>
          <div className={s.item} style={{ backgroundColor: appStore.showHelp ? "mintcream" : undefined }}>
            <div>SSH密钥</div>
            <div>
              <Button type='link' style={{ minWidth: 0, padding: "0px 0px", fontSize: "20px", lineHeight: "28px" }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowSshKeyModal(true);
                }}>
                {sshKeyCount}
              </Button>
            </div>
          </div>
        </Popover>

        {userStore.sessionId != "" && userStore.userInfo.featureInfo.enable_project && (
          <Popover placement='bottom' overlayClassName="global_help"
            open={appStore.showHelp}
            title="当前待办"
            content="查看所有项目的待办任务/缺陷">
            <div className={s.item} style={{ backgroundColor: appStore.showHelp ? "mintcream" : undefined }}>
              <div>当前待办</div>
              <div>
                <Button type='link' style={{ minWidth: 0, padding: "0px 0px", fontSize: "20px", lineHeight: "28px" }}
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowMyTodoModal(true);
                  }} disabled={myTodoCount == 0}>
                  {myTodoCount}
                </Button>
              </div>
            </div>
          </Popover>
        )}

        {userStore.sessionId != "" && (
          <Popover placement='bottom' overlayClassName="global_help"
            open={appStore.showHelp}
            title="我掌握的技能" content="显示在技能中心点亮的技能数量">
            <div className={s.item} style={{ backgroundColor: appStore.showHelp ? "mintcream" : undefined }}>
              <div>我的技能点</div>
              <div>
                <Space>
                  <Button type='link' style={{ minWidth: 0, padding: "0px 0px", fontSize: "20px", lineHeight: "28px" }}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      history.push(SKILL_CENTER_PATH);
                      projectStore.setCurProjectId("");
                      orgStore.setCurOrgId("");
                    }} disabled={!userStore.userInfo.featureInfo.enable_skill_center}>
                    {userStore.userInfo.learnStateInfo.learn_point_count}
                  </Button>
                  <Switch size='small' checked={userStore.userInfo.featureInfo.enable_skill_center} onChange={value => {
                    const feature: FeatureInfo = {
                      enable_project: userStore.userInfo.featureInfo.enable_project,
                      enable_org: userStore.userInfo.featureInfo.enable_org,
                      enable_skill_center: value,
                    };
                    request(update_feature({
                      session_id: userStore.sessionId,
                      feature: feature,
                    })).then(() => userStore.updateFeature(feature));
                  }} />
                </Space>
              </div>
            </div>
          </Popover>
        )}

        {userStore.sessionId != "" && (
          <Popover placement='bottom' overlayClassName="global_help"
            open={appStore.showHelp} title="我的项目" content="打开后可使用项目功能">
            <div className={s.item} style={{ backgroundColor: appStore.showHelp ? "mintcream" : undefined }}>
              <div>当前项目数</div>
              <div>
                <Space>
                  <Button type='link' style={{ minWidth: 0, padding: "0px 0px", fontSize: "20px", lineHeight: "28px" }}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      history.push(APP_PROJECT_MANAGER_PATH);
                    }} disabled={!userStore.userInfo.featureInfo.enable_project}>
                    {projectStore.projectList.filter((item) => !item.closed).length}
                  </Button>
                  <Switch size='small' checked={userStore.userInfo.featureInfo.enable_project} onChange={value => {
                    const feature: FeatureInfo = {
                      enable_project: value,
                      enable_org: userStore.userInfo.featureInfo.enable_org,
                      enable_skill_center: userStore.userInfo.featureInfo.enable_skill_center,
                    };
                    request(update_feature({
                      session_id: userStore.sessionId,
                      feature: feature,
                    })).then(() => userStore.updateFeature(feature));
                  }} />
                </Space>
              </div>
            </div>
          </Popover>
        )}

        {userStore.sessionId != "" && (
          <Popover placement='right' overlayClassName="global_help"
            open={appStore.showHelp} title="我的团队" content="打开后可使用团队功能">
            <div className={s.item} style={{ backgroundColor: appStore.showHelp ? "mintcream" : undefined }}>
              <div>当前团队数</div>
              <div>
                <Space>
                  <Button type='link' style={{ minWidth: 0, padding: "0px 0px", fontSize: "20px", lineHeight: "28px" }}
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      history.push(APP_ORG_MANAGER_PATH);
                    }} disabled={!userStore.userInfo.featureInfo.enable_org}>
                    {orgStore.orgList.length}
                  </Button>
                  <Switch size='small' checked={userStore.userInfo.featureInfo.enable_org} onChange={value => {
                    const feature: FeatureInfo = {
                      enable_project: userStore.userInfo.featureInfo.enable_project,
                      enable_org: value,
                      enable_skill_center: userStore.userInfo.featureInfo.enable_skill_center,
                    };
                    request(update_feature({
                      session_id: userStore.sessionId,
                      feature: feature,
                    })).then(() => userStore.updateFeature(feature));
                  }} />
                </Space>
              </div>
            </div>
          </Popover>
        )}

        {userStore.sessionId != "" && (
          <div className={s.item}>
            <div>加入项目/团队</div>
            <Button type="link" style={{ minWidth: 0, padding: "0px 0px", fontSize: "20px", lineHeight: "28px" }}
              icon={<PlusSquareTwoTone style={{ fontSize: "20px", paddingTop: "4px" }} twoToneColor={["orange", "#eee"]} />}
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                setShowJoinModal(true);
              }} />
          </div>
        )}
      </div>


      {showMyTodoModal == true && (
        <MyTodoListModal onCount={value => setMyTodoCount(value)} onClose={() => setShowMyTodoModal(false)} />
      )}
      {showSshKeyModal == true && (
        <SshKeyListModal onCount={value => setSshKeyCount(value)} onClose={() => setShowSshKeyModal(false)} />
      )}
      {showExit == true && (
        <Modal
          open={showExit}
          title="退出"
          onCancel={() => setShowExit(false)}
          onOk={() => {
            userStore.logout();
            setShowExit(false);
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
      {showJoinModal == true && (
        <JoinModal onClose={() => setShowJoinModal(false)} />
      )}
      {pictrueListVisible == true && (
        <Profile
          visible={pictrueListVisible}
          defaultSrc={userStore.userInfo.logoUri ?? ""}
          onCancel={() => setPictrueListVisible(false)}
          onOK={(data: string | null) => uploadFile(data)}
        />
      )}
      {passwordVisible && (
        <PasswordModal visible={passwordVisible} onCancel={setPasswordVisible} />
      )}
      {showUpdateDisplayNameModal && (
        <UpdateDisplayNameModal onClose={() => setShowUpdateDisplayNameModal(false)} />
      )}
    </div>
  );
};

export default observer(InfoCount);
