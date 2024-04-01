import React, { useEffect, useState } from 'react';
import s from './infoCount.module.less';
import memberIcon from '@/assets/allIcon/icon-member.png';
import { useStores } from '@/hooks';
import UserPhoto from '@/components/Portrait/UserPhoto';
import { observer } from 'mobx-react';
import { Button, Modal, Space, Switch, message } from 'antd';
import { request } from '@/utils/request';
import { get_my_todo_status } from "@/api/project_issue";
import MyTodoListModal from './MyTodoListModal';
import { useHistory } from 'react-router-dom';
import { APP_ORG_MANAGER_PATH, APP_PROJECT_MANAGER_PATH, PUB_RES_PATH, WORKBENCH_PATH } from '@/utils/constant';
import { list_ssh_key_name } from '@/api/local_repo';
import SshKeyListModal from './SshKeyListModal';
import { FeatureInfo, update_feature } from '@/api/user';


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

  useEffect(() => {
    loadMyTodoCount();
  }, [userStore.sessionId]);

  useEffect(() => {
    loadSshKeyCount();
  }, []);

  return (
    <div className={s.infoCount_wrap}>
      <div className={s.left_wrap}>
        <UserPhoto logoUri={userStore.userInfo.logoUri} />
        <div className={s.content}>
          <div className={s.name}>
            欢迎您！{userStore.userInfo.displayName}
            {userStore.sessionId !== "" && (
              <>
                (<a style={{ fontSize: "12px" }} onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (appStore.inEdit) {
                    message.info("请先保存修改内容");
                    return;
                  }
                  setShowExit(true);
                  userStore.accountsModal = false;
                }}>退出登录</a>)
              </>
            )}
          </div>
          <div
            className={s.account}
            onClick={() => {
              if (userStore.sessionId == "") {
                userStore.showUserLogin = () => { };
              } else {
                userStore.accountsModal = true;
              }

            }}
          >
            <img src={memberIcon} alt="" /> {userStore.sessionId == "" ? "请登录" : "账号管理"}
          </div>
        </div>
      </div>


      <div className={s.right_wrap}>

        <div className={s.item}>
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
        {userStore.sessionId != "" && (
          <div className={s.item}>
            <div>当前待办</div>
            <div>
              <Button type='link' style={{ minWidth: 0, padding: "0px 0px", fontSize: "20px", lineHeight: "28px" }}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowMyTodoModal(true);
                }} disabled={!userStore.userInfo.featureInfo.enable_project}>
                {myTodoCount}
              </Button>
            </div>
          </div>
        )}

        {userStore.sessionId != "" && (
          <div className={s.item}>
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
                  };
                  request(update_feature({
                    session_id: userStore.sessionId,
                    feature: feature,
                  })).then(() => userStore.updateFeature(feature));
                }} />
              </Space>
            </div>
          </div>
        )}

        {userStore.sessionId != "" && (
          <div className={s.item}>
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
                  };
                  request(update_feature({
                    session_id: userStore.sessionId,
                    feature: feature,
                  })).then(() => userStore.updateFeature(feature));
                }} />
              </Space>
            </div>
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
    </div>
  );
};

export default observer(InfoCount);
