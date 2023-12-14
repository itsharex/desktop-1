import { Badge, Button, Popover, Tooltip } from 'antd';
import React from 'react';
import s from './index.module.less';
import {
  APP_PROJECT_OVERVIEW_PATH,
  PROJECT_SETTING_TAB
} from '@/utils/constant';
import { useStores } from '@/hooks';
import { HddTwoTone, MessageTwoTone, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import AlarmHeader from './AlarmHeader';
import ProjectTipList from '../Header/ProjectTipList';
import MemberList from './MemberList';
import { useLocation } from 'react-router-dom';
import CommentAndWatchPanel from './CommentAndWatchPanel';
import ProjectFsList from './ProjectFsList';

const RightFloat = observer(() => {
  const location = useLocation();
  const projectStore = useStores('projectStore');

  return (
    <div className={s.right_float}>
      <AlarmHeader />
      <div style={{ marginRight: "18px" }}>
        <Popover trigger="hover" placement="topLeft" destroyTooltipOnHide
          mouseLeaveDelay={1}
          content={<CommentAndWatchPanel />}>
          <Badge count={projectStore.curProject?.project_status.unread_comment_count} size='small'>
            <MessageTwoTone style={{ fontSize: "20px", cursor: "default" }} twoToneColor={["orange", "white"]} />
          </Badge>
        </Popover>
      </div>
      <div className={s.member_wrap}>
        {location.pathname.startsWith(APP_PROJECT_OVERVIEW_PATH) && (
          <UserOutlined />
        )}
        {location.pathname.startsWith(APP_PROJECT_OVERVIEW_PATH) == false && (
          <Popover
            trigger="hover" placement="topLeft" destroyTooltipOnHide
            mouseLeaveDelay={1}
            content={
              <MemberList />
            }>
            <UserOutlined />
          </Popover>
        )}
      </div>
      {projectStore.isAdmin && (
        <Popover trigger="hover" placement='topLeft' destroyTooltipOnHide mouseLeaveDelay={1} content={<ProjectFsList />}>
          <HddTwoTone style={{ fontSize: "20px", cursor: "default", marginRight: "20px"}} twoToneColor={["#777", "white"]} />
        </Popover>
      )}
      {projectStore.isAdmin && (
        <Tooltip title="项目设置" placement='left' color='orange' overlayInnerStyle={{ color: 'black', marginTop: "10px" }} open={projectStore.showProjectSetting == PROJECT_SETTING_TAB.PROJECT_SETTING_LAYOUT}>
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
