//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Badge, Button, Segmented, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import s from './index.module.less';
import {
  PROJECT_SETTING_TAB
} from '@/utils/constant';
import { useStores } from '@/hooks';
import { MessageTwoTone, SettingOutlined, StopTwoTone, UserAddOutlined } from '@ant-design/icons';
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
            projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_ALARM;
          }}><SettingOutlined /></Button>
        </Tooltip>
      )}
    </div>
  );
});

const BottomNav = () => {
  const projectStore = useStores('projectStore');

  const [segValue, setSegValue] = useState<"close" | "member" | "comment">("close");

  useEffect(() => {
    if (projectStore.showChatAndComment) {
      if (projectStore.showChatAndCommentTab == "member") {
        setSegValue("member");
      } else {
        setSegValue("comment");
      }
    } else {
      setSegValue("close");
    }
  }, [projectStore.showChatAndComment, projectStore.showChatAndCommentTab])

  return (
    <div className={s.topnav}>
      <div style={{ marginRight: "20px" }}>
        <Segmented options={[
          {
            icon: <StopTwoTone style={{ fontSize: "16px" }} twoToneColor={segValue == "close" ? ["white", "orange"] : ["white", "grey"]} />,
            value: "close",
          },
          {
            icon: <Membersvg style={{ width: "16px", height: "16px", color: segValue == "member" ? "orange" : "grey" }} />,
            value: "member",
            title: "项目成员",
          },
          {
            icon: (
              <Badge count={(projectStore.curProject?.project_status.unread_comment_count ?? 0) + (projectStore.curProject?.chat_store.totalUnread ?? 0) + (projectStore.curProject?.project_status.bulletin_count ?? 0)}
                style={{ padding: '0 0px', height: '16px', lineHeight: '16px', fontSize: "10px" }} offset={[0, 6]}>
                <MessageTwoTone style={{ marginRight: "10px", fontSize: "16px" }} twoToneColor={segValue == "comment" ? ["white", "orange"] : ["white", "grey"]} />
              </Badge>
            ),
            value: "comment",
            title: "项目沟通"
          }
        ]} value={segValue} onChange={value => {
          if (value == "close") {
            projectStore.setShowChatAndComment(false, "chat");
          } else if (value == "member") {
            projectStore.setShowChatAndComment(true, "member");
          } else if (value == "comment") {
            projectStore.setShowChatAndComment(true, "chat");
          }
        }} size='large' style={{ backgroundColor: "#eee" }} />
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
