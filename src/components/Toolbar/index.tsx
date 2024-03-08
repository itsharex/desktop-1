import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Badge, Divider, Switch, Tooltip } from 'antd';

import style from './index.module.less';
import { useStores } from '@/hooks';
import { observer } from 'mobx-react';
import { APP_PROJECT_HOME_PATH, APP_PROJECT_KB_BOARD_PATH, APP_PROJECT_KB_DOC_PATH, APP_PROJECT_MY_WORK_PATH, APP_PROJECT_WORK_PLAN_PATH } from '@/utils/constant';
import { MessageTwoTone } from '@ant-design/icons';


const Item: React.FC<{ id: string; pathname: string; title: string; badge?: number }> = observer((props) => {
  const history = useHistory();

  const projectStore = useStores('projectStore');

  const [showTip, setShowTip] = useState<boolean | undefined>(undefined);

  const current = props.pathname.includes(props.id);
  const gotoPage = (id: string) => {
    if (props.pathname.startsWith(APP_PROJECT_HOME_PATH)) {
      history.push(APP_PROJECT_HOME_PATH + "/" + id);
    } else if (props.pathname.startsWith(APP_PROJECT_WORK_PLAN_PATH)) {
      history.push(APP_PROJECT_WORK_PLAN_PATH + '/' + id);
    } else if (props.pathname.startsWith(APP_PROJECT_KB_DOC_PATH)) {
      history.push(APP_PROJECT_KB_DOC_PATH + '/' + id);
    } else if (props.pathname.startsWith(APP_PROJECT_KB_BOARD_PATH)) {
      history.push(APP_PROJECT_KB_BOARD_PATH + '/' + id);
    } else if (props.pathname.startsWith(APP_PROJECT_MY_WORK_PATH)) {
      history.push(APP_PROJECT_MY_WORK_PATH + "/" + id);
    }
  };

  useEffect(() => {
    if (projectStore.showProjectSetting == null) {
      setShowTip(false);
    } else {
      setShowTip(true);
    }
  }, [projectStore.showProjectSetting]);

  return (
    <Tooltip
      title={<span>{props.title}</span>}
      placement="left"
      color="orange"
      overlayInnerStyle={{ color: 'black' }}
      open={showTip}
    >
      <div
        data-menu-id={props.id}
        className={current ? style.menuCurrent : style.menu}
        onClick={() => gotoPage(props.id)}
      >
        <Badge
          count={props.badge ?? 0}
          offset={ [15, -18]}
          style={{ padding: ' 0   3px', height: '16px', lineHeight: '16px' }}
        />
      </div>
    </Tooltip>
  );
});

const Toolbar: React.FC = observer(() => {
  const history = useHistory();
  const location = useLocation();
  const pathname = location.pathname;
  const projectStore = useStores('projectStore');
  const linkAuxStore = useStores('linkAuxStore');

  return (
    <div className={style.toolbar}>
      <Tooltip title={<span>项目沟通</span>}
        placement="left"
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
          <Badge count={(projectStore.curProject?.project_status.unread_comment_count ?? 0) + (projectStore.curProject?.chat_store.totalUnread ?? 0) + (projectStore.curProject?.project_status.bulletin_count ?? 0)} style={{ padding: '0 3px', height: '16px', lineHeight: '16px' }}>
            <MessageTwoTone style={{ fontSize: "24px" }} twoToneColor={projectStore.showChatAndComment ? ["white", "orange"] : ["white", "#929CB0"]} />
          </Badge>
          <br />
          <Switch size='small' checked={projectStore.showChatAndComment} />
        </div>
      </Tooltip>

      <Divider />

      <Item
        id="idea"
        pathname={pathname}
        title="知识点仓库"
      />
      <Divider />

      <Item
        id="req"
        pathname={pathname}
        title="需求列表"
      />
      <Item
        id="task"
        pathname={pathname}
        title="任务列表"
        badge={projectStore.curProject?.project_status.undone_task_count || 0}
      />

      <Item
        id="bug"
        pathname={pathname}
        title="缺陷列表"
        badge={projectStore.curProject?.project_status.undone_bug_count || 0}
      />

      <Item
        id="testcase"
        pathname={pathname}
        title="测试用例"
      />

      <Divider />
      <Item
        id="record"
        pathname={pathname}
        title="工作记录"
        badge={projectStore.curProject?.project_status.new_event_count || 0}
      />

      {projectStore.curProject?.user_project_perm?.can_admin && (
        <>
          <Divider />
          <Item id="access" pathname={pathname} title="第三方接入" />
        </>
      )}

      {(projectStore.curProject?.setting.k8s_proxy_addr != "" || projectStore.curProject?.setting.swarm_proxy_addr != "" ||
        projectStore.curProject?.setting.trace_proxy_addr != "" || projectStore.curProject?.setting.net_proxy_addr != "") && (
          <>
            <Divider />
            <Item id="cloud" pathname={pathname} title="研发环境" />
          </>
        )}
      <Divider />
      <Item id="recycle" pathname={pathname} title="回收站" />
      <Divider />
      <Item id="overview" pathname={pathname} title="项目信息" />

    </div>
  );
});
export default Toolbar;
