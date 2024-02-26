import { Button, Tooltip } from 'antd';
import React from 'react';
import s from './index.module.less';
import {
  PROJECT_SETTING_TAB
} from '@/utils/constant';
import { useStores } from '@/hooks';
import { SettingOutlined, UserAddOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import AlarmHeader from './AlarmHeader';
import ProjectTipList from '../Header/ProjectTipList';

const RightFloat = observer(() => {
  const projectStore = useStores('projectStore');
  const appStore = useStores('appStore');
  const memberStore = useStores('memberStore');

  return (
    <div className={s.right_float}>
      <AlarmHeader />
      {!(projectStore.curProject?.closed) && projectStore.isAdmin && appStore.clientCfg?.can_invite && (
        <div className={s.member_wrap}>
          <Button type='primary' icon={<UserAddOutlined />} style={{ borderRadius: "6px" }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              projectStore.setShowChatAndComment(true, "member");
              memberStore.showInviteMember = true;
            }}>邀请</Button>
        </div>
      )}
      {projectStore.isAdmin && (
        <Tooltip title="项目设置" placement='left' color='orange' overlayInnerStyle={{ color: 'black', marginTop: "10px" }} open={projectStore.showProjectSetting == PROJECT_SETTING_TAB.PROJECT_SETTING_ALARM}>
          <Button type="link" className={s.setting_btn} onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_LAYOUT;
          }}><SettingOutlined /></Button>
        </Tooltip>
      )}
    </div>
  );
});

const BottomNav = () => {
  const appStore = useStores('appStore');

  return (
    <div className={s.topnav}>
      <div className={s.left}>
        {appStore.focusMode == false && <ProjectTipList />}
      </div>
      <div className={s.right}>
        <RightFloat />
      </div>
    </div>
  );
};

export default observer(BottomNav);
