import PasswordModal from '@/components/PasswordModal';
import { useEffect } from 'react';
import { useState, useMemo } from 'react';
import React from 'react';
import s from './index.module.less';
import { useHistory, useLocation } from 'react-router-dom';
import { USER_LOGIN_PATH, WORKBENCH_KB_DOC_SUFFIX, WORKBENCH_PATH, filterProjectItemList } from '@/utils/constant';
import { useStores } from '@/hooks';
import Card from './components/Card';
import InfoCount from './components/InfoCount';
import Backlog from './components/Backlog';
import { Select, Space, Tabs } from 'antd';
import { observer } from 'mobx-react';
import Record from './components/Record';
import { BookOutlined, FieldTimeOutlined, IssuesCloseOutlined, ProjectOutlined } from '@ant-design/icons';
import UserDocSpaceList from '../UserExtend/UserKb/UserDocSpaceList';
import Button from '@/components/Button';
import type { KbSpaceInfo } from '@/api/user_kb';
import type { UserDocState } from '../UserExtend/UserKb/UserDoc';
import { runInAction } from 'mobx';
import MyProjectList from './components/MyProjectList';
import UserAppList from './components/UserAppList';


const Workbench: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const urlParams = new URLSearchParams(location.search);
  const type = urlParams.get('type');
  const [passwordModal, setPasswordModal] = useState(type === 'resetPassword');
  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const appStore = useStores('appStore');

  let tab = urlParams.get('tab');
  if (tab == null) {
    tab = "myProject";
  }
  const spaceId = urlParams.get("spaceId");

  const [totalMyIssueCount, setTotalMyIssueCount] = useState(0);
  const [activeKey, setActiveKey] = useState(tab);
  const [curKbSpace, setCurKbSpace] = useState<KbSpaceInfo | null>(null);
  const [userChangeTab, setUserChangeTab] = useState(false);

  useMemo(() => {
    projectStore.setCurProjectId('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userChangeTab == false) {
      if (projectStore.projectList.length == 0) {
          setActiveKey("myProject");
      } else {
        setActiveKey("myIssue");
      }
    }
  }, [projectStore.projectList]);

  return (
    <div className={s.workbench_wrap}>
      <Card className={s.infoCount_wrap} childStyle={{ height: '100%' }}>
        {!userStore.isResetPassword && <InfoCount total={totalMyIssueCount} />}
      </Card>
      <Tabs activeKey={activeKey} className={s.my_wrap} type="card" onChange={key => {
        setUserChangeTab(true);
        setActiveKey(key);
        setCurKbSpace(null);
      }}
        tabBarExtraContent={
          <>
            {activeKey == "myProject" && (
              <Space size="large">
                <Button type="default" onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  appStore.showCreateProject = true;
                }}>创建项目</Button>
                <Button onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  appStore.showJoinProject = true;
                }}>加入项目</Button>
                <Select value={projectStore.filterProjectType} style={{ width: "100px", marginLeft: "40px", marginRight: "20px" }}
                  onSelect={value => {
                    runInAction(() => {
                      projectStore.filterProjectType = value;
                    });
                  }}>
                  {filterProjectItemList.map(item => (
                    <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                  ))}
                </Select>
              </Space>
            )}
            {activeKey == "userDoc" && (
              <Button style={{ marginRight: "20px" }}
                disabled={curKbSpace == null}
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (curKbSpace == null) {
                    return;
                  }
                  const state: UserDocState = {
                    spaceId: curKbSpace.space_id,
                    sshPubKey: curKbSpace.ssh_pub_key,
                    docId: "",
                    readMode: false,
                  };
                  history.push(WORKBENCH_KB_DOC_SUFFIX, state);
                }}>创建文档</Button>
            )}
          </>
        }>
        {projectStore.projectList.length > 0 && (
          <Tabs.TabPane tab={<h2><IssuesCloseOutlined />&nbsp;我的待办</h2>} key="myIssue">
            {activeKey == "myIssue" && (
              <div className={s.content_wrap}>
                {!userStore.isResetPassword && <Backlog onChange={count => setTotalMyIssueCount(count)} />}
              </div>
            )}
          </Tabs.TabPane>
        )}
        {projectStore.projectList.length > 0 && (
          <Tabs.TabPane tab={<h2><FieldTimeOutlined />&nbsp;我的工作记录</h2>} key="myEvent">
            {activeKey == "myEvent" && (
              <div className={s.content_wrap}>
                <Record />
              </div>
            )}
          </Tabs.TabPane>
        )}
        <Tabs.TabPane tab={<h2><BookOutlined />&nbsp;我的知识库</h2>} key="userDoc">
          {activeKey == "userDoc" && (
            <div className={s.content_wrap}>
              <UserDocSpaceList onChange={kbSpace => setCurKbSpace(kbSpace)} spaceId={spaceId ?? userStore.userInfo.defaultKbSpaceId} />
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={<h2><BookOutlined />&nbsp;我的微应用</h2>} key="userApp">
        {activeKey == "userApp" && (
          <div className={s.content_wrap}>
            <UserAppList/>
          </div>
        )}
        </Tabs.TabPane>
        <Tabs.TabPane tab={<h2><ProjectOutlined />&nbsp;我的项目</h2>} key="myProject">
          {activeKey == "myProject" && (
            <div className={s.content_wrap}>
              <MyProjectList />
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
      {/* <Card className={s.backlog_wrap} title="我的待办">
        
      </Card> */}
      {passwordModal && (
        <PasswordModal
          visible={passwordModal}
          type="resetPassword"
          onCancel={(bool) => {
            userStore.logout();
            if (userStore.isResetPassword) {
              history.push(USER_LOGIN_PATH);
            }
            setPasswordModal(bool);
          }}
          onSuccess={async () => {
            history.push(WORKBENCH_PATH);
            setPasswordModal(false);
          }}
        />
      )}
    </div>
  );
};

export default observer(Workbench);
