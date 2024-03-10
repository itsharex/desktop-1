import { Badge, Button, Space, Tooltip } from 'antd';
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
import Membersvg from '@/assets/svg/member.svg?react';


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
  const projectStore = useStores('projectStore');

  return (
    <div className={s.topnav}>
      <div style={{ marginRight: "20px" }}>
        <Space size="middle">
          <Tooltip title={<span>项目成员</span>} placement="top"
            color="orange"
            overlayInnerStyle={{ color: 'black' }}>
            <div style={{ cursor: "pointer" }} onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              const curShow = projectStore.showChatAndComment && projectStore.showChatAndCommentTab == "member";
              projectStore.setShowChatAndComment(!curShow, "member");
            }}>
              <Membersvg style={{ width: "26px", height: "26px", marginTop: "16px", color: (projectStore.showChatAndComment && projectStore.showChatAndCommentTab == "member") ? "orange" : "#929CB0" }} />
            </div>
          </Tooltip>
          <Tooltip title={<span>项目沟通</span>}
            placement="top"
            color="orange"
            overlayInnerStyle={{ color: 'black' }}
          >
            <div style={{ textAlign: "center", padding: "10px 0px", cursor: "pointer" }} onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              const curShow = projectStore.showChatAndComment && projectStore.showChatAndCommentTab != "member";
              projectStore.setShowChatAndComment(!curShow, "chat");
            }}>
              <Badge count={(projectStore.curProject?.project_status.unread_comment_count ?? 0) + (projectStore.curProject?.chat_store.totalUnread ?? 0) + (projectStore.curProject?.project_status.bulletin_count ?? 0)}
                style={{ padding: '0 0px', height: '16px', lineHeight: '16px' }} offset={[8, 28]}>
                <MessageTwoTone style={{ fontSize: "28px", marginTop: "16px" }} twoToneColor={(projectStore.showChatAndComment && projectStore.showChatAndCommentTab != "member") ? ["white", "orange"] : ["white", "#929CB0"]} />
              </Badge>
            </div>
          </Tooltip>
        </Space>
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
