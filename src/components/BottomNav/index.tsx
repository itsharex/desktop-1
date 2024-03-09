import { Badge, Button, Space, Switch, Tooltip } from 'antd';
import React from 'react';
import s from './index.module.less';
import {
  PROJECT_SETTING_TAB
} from '@/utils/constant';
import { useStores } from '@/hooks';
import { MessageTwoTone, SettingOutlined, UserAddOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import AlarmHeader from './AlarmHeader';
import ProjectTipList from '../Header/ProjectTipList';
import { useHistory } from 'react-router-dom';

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
  const history = useHistory();

  const projectStore = useStores('projectStore');
  const linkAuxStore = useStores('linkAuxStore');

  return (
    <div className={s.topnav}>
      <div style={{ marginRight: "20px" }}>
        <Tooltip title={<span>项目沟通</span>}
          placement="top"
          color="orange"
          overlayInnerStyle={{ color: 'black' }}
        >
          <div style={{ textAlign: "center", padding: "10px 0px", cursor: "pointer" }} onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            if (!projectStore.showChatAndComment) {
              linkAuxStore.pickupToolbar(history);
            }
            projectStore.setShowChatAndComment(!projectStore.showChatAndComment, "chat");
          }}>
            <Space>
              <Switch size='small' checked={projectStore.showChatAndComment} />
              <Badge count={(projectStore.curProject?.project_status.unread_comment_count ?? 0) + (projectStore.curProject?.chat_store.totalUnread ?? 0) + (projectStore.curProject?.project_status.bulletin_count ?? 0)}
                style={{ padding: '0 0px', height: '16px', lineHeight: '16px' }} offset={[8,28]}>
                <MessageTwoTone style={{ fontSize: "24px", marginTop: "16px" }} twoToneColor={projectStore.showChatAndComment ? ["white", "orange"] : ["white", "#929CB0"]} />
              </Badge>

            </Space>
          </div>
        </Tooltip>
      </div>
      <div className={s.left}>
        <ProjectTipList />
      </div>
      <div className={s.right}>
        <RightFloat />
      </div>
    </div>
  );
};

export default observer(BottomNav);
