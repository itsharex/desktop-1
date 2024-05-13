//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { PhysicalSize, PhysicalPosition } from '@tauri-apps/api/window';
import { appWindow } from '@tauri-apps/api/window';
import React, { useEffect, useState } from 'react';
import style from './index.module.less';
import { Badge, Button, Layout, Popover, Progress, Space, Table, message } from 'antd';
import { observer } from 'mobx-react';
import { useStores } from '@/hooks';
import { BugOutlined, CloseCircleFilled, EditOutlined, InfoCircleOutlined, MailTwoTone, MoreOutlined, PartitionOutlined } from '@ant-design/icons';
import { checkUpdate } from '@tauri-apps/api/updater';
import { check_update } from '@/api/main';
import { listen } from '@tauri-apps/api/event';
import { APP_PROJECT_HOME_PATH, APP_PROJECT_MY_WORK_PATH } from '@/utils/constant';
import { useHistory, useLocation } from 'react-router-dom';
import ProjectQuickAccess from './ProjectQuickAccess';
import { ENTRY_TYPE_SPRIT } from '@/api/project_entry';
import { watch, unwatch, WATCH_TARGET_ENTRY } from "@/api/project_watch";
import moment from 'moment';
import { request } from '@/utils/request';
import type { ColumnsType } from 'antd/lib/table';
import type { ProxyInfo } from '@/api/net_proxy';
import { stop_listen } from '@/api/net_proxy';
import { remove_info_file } from '@/api/local_api';
import { exit } from '@tauri-apps/api/process';
import EntryPopover from '@/pages/Project/Home/components/EntryPopover';
import RemoveEntryModal from '@/pages/Project/Home/components/RemoveEntryModal';
import ServerConnInfo from './ServerConnInfo';
import UserNoticeList from './UserNoticeList';

const { Header } = Layout;

let windowSize: PhysicalSize = new PhysicalSize(1400, 750);
let windowPostion: PhysicalPosition = new PhysicalPosition(0, 0);

const MyHeader: React.FC<{ style?: React.CSSProperties; className?: string }> = ({
  ...props
}) => {
  const history = useHistory();
  const location = useLocation();

  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const entryStore = useStores('entryStore');
  const appStore = useStores('appStore');

  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleClick = async function handleClick(type: string) {
    switch (type) {
      case 'hide':
        await appWindow.hide();
        break;
      case 'exit':
        await remove_info_file();
        await exit(0);
        break;
      case 'minimize':
        await appWindow.minimize();
        break;
      case 'maximize':
        const isMaximized = await appWindow.isMaximized();
        if (isMaximized) {
          await appWindow.setSize(windowSize);
          if (windowPostion.x == 0 && windowPostion.y == 0) {
            await appWindow.center();
          } else {
            await appWindow.setPosition(windowPostion);
          }
        } else {
          windowSize = await appWindow.outerSize();
          windowPostion = await appWindow.outerPosition();
          await appWindow.maximize();
        }
        break;
    }
  };

  const genEntryTitle = (): string => {
    if (entryStore.curEntry == null) {
      return "";
    }
    if (entryStore.curEntry.entry_type == ENTRY_TYPE_SPRIT) {
      return `${entryStore.curEntry.entry_title}(${moment(entryStore.curEntry.extra_info.ExtraSpritInfo?.start_time ?? 0).format("YYYY-MM-DD")}至${moment(entryStore.curEntry.extra_info.ExtraSpritInfo?.end_time ?? 0).format("YYYY-MM-DD")})`;
    }
    return entryStore.curEntry.entry_title;
  }

  const watchEntry = async () => {
    await request(watch({
      session_id: userStore.sessionId,
      project_id: projectStore.curProjectId,
      target_type: WATCH_TARGET_ENTRY,
      target_id: entryStore.curEntry?.entry_id ?? "",
    }));
  };

  const unwatchEntry = async () => {
    await request(unwatch({
      session_id: userStore.sessionId,
      project_id: projectStore.curProjectId,
      target_type: WATCH_TARGET_ENTRY,
      target_id: entryStore.curEntry?.entry_id ?? "",
    }));
  }

  const proxyColumns: ColumnsType<ProxyInfo> = [
    {
      title: "本地地址",
      width: 100,
      render: (_, row: ProxyInfo) => `127.0.0.1:${row.port}`,
    },
    {
      title: "端点名称",
      width: 80,
      dataIndex: "endpoint_name",
    },
    {
      title: "项目名称",
      width: 80,
      render: (_, row: ProxyInfo) => (
        <div style={{ width: "80px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={projectStore.getProject(row.project_id)?.basic_info.project_name ?? ""}>
          {projectStore.getProject(row.project_id)?.basic_info.project_name ?? ""}
        </div>
      ),
    },
    {
      title: "",
      render: (_, row: ProxyInfo) => (
        <Button type="link" danger icon={<CloseCircleFilled />}
          style={{ minWidth: 0, padding: "0px 0px" }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            stop_listen(row.port).then(() => appStore.loadLocalProxy());
          }} title='停止转发' />
      ),
    }
  ];

  useEffect(() => {
    checkUpdate().then(res => {
      setHasNewVersion(res.shouldUpdate);
    });
  }, []);

  useEffect(() => {
    const unlisten = listen<number>("updateProgress", ev => {
      if (ev.payload >= 0) {
        setUpdateProgress(ev.payload);
      } else {
        message.error("更新出错");
        setUpdateProgress(0);
      }
    })
    return () => {
      unlisten.then(f => f());
    }
  }, []);


  return (
    <div>
      <div style={{ height: "4px", backgroundColor: location.pathname.startsWith("/app") ? "#f6f6f8" : "white", borderTop: "1px solid #e8e9ee" }} />
      <Header className={style.layout_header} {...props}
        style={{ backgroundColor: location.pathname.startsWith("/app") ? "#f6f6f8" : "white", boxShadow: "none" }}
        onMouseDown={e => {
          if ((e.target as HTMLDivElement).hasAttribute("data-drag")) {
            e.preventDefault();
            e.stopPropagation();
            appWindow.startDragging();
          }
        }} onTouchStart={e => {
          if ((e.target as HTMLDivElement).hasAttribute("data-drag")) {
            e.preventDefault();
            e.stopPropagation();
            appWindow.startDragging();
          }
        }} data-drag>
        {projectStore.curProjectId != "" && (
          <div>
            <ProjectQuickAccess />
            <Button
              type="link"
              style={{ minWidth: 0, padding: "0px 0px", display: "inline" }}
              disabled={location.pathname.startsWith(APP_PROJECT_HOME_PATH) == true}
              size='small'
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                if (appStore.inEdit) {
                  appStore.showCheckLeave(() => {
                    entryStore.reset();
                    history.push(APP_PROJECT_HOME_PATH);
                  });
                } else {
                  entryStore.reset();
                  history.push(APP_PROJECT_HOME_PATH);
                }
              }}>
              <span style={{ fontSize: "20px", fontWeight: 600 }}>{projectStore.curProject?.basic_info.project_name ?? ""}</span>
            </Button>
            <Space size="small" style={{ fontSize: "16px", marginLeft: "10px", lineHeight: "26px", cursor: "default" }}>
              {location.pathname.startsWith(APP_PROJECT_MY_WORK_PATH) && (
                <>
                  <span>/</span>
                  <span>我的工作</span>
                </>
              )}
              {location.pathname.startsWith(APP_PROJECT_MY_WORK_PATH) == false
                && location.pathname.startsWith(APP_PROJECT_HOME_PATH) == false
                && entryStore.curEntry != null && (
                  <>
                    <span>/</span>
                    <Popover trigger={["hover", "click"]} placement='top' content={<EntryPopover entryInfo={entryStore.curEntry} />}>
                      <InfoCircleOutlined />
                    </Popover>
                    <span>
                      <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (entryStore.curEntry?.my_watch == true) {
                          unwatchEntry();
                        } else {
                          watchEntry();
                        }
                      }}>
                        <span className={(entryStore.curEntry?.my_watch ?? false) ? style.isCollect : style.noCollect} />
                      </a>
                    </span>
                    <div style={{ maxWidth: "300px", textOverflow: "clip", overflow: "hidden", whiteSpace: "nowrap" }} title={genEntryTitle()}>{genEntryTitle()}</div>
                    {entryStore.curEntry.can_update && (
                      <Button type="link" icon={<EditOutlined />} style={{ minWidth: 0, padding: "0px 0px" }} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        entryStore.editEntryId = entryStore.curEntry?.entry_id ?? "";
                      }} />
                    )}
                    <Popover trigger="click" placement="bottom" content={
                      <div style={{ padding: "10px 10px" }}>
                        <Button type="link" danger disabled={(!entryStore.curEntry.can_remove) || appStore.inEdit}
                          onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowRemoveModal(true);
                          }}>移至回收站</Button>
                      </div>
                    }>
                      <MoreOutlined />
                    </Popover>
                  </>
                )}
            </Space>
          </div>
        )}

        <div className={style.l} />
        <div className={style.r}>
          {hasNewVersion == true && (
            <Button type="link" style={{ marginRight: "20px" }} onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              check_update();
            }} disabled={updateProgress > 0}>
              <Space size="small">
                <InfoCircleOutlined />
                {updateProgress == 0 && "有新版本"}
                {updateProgress > 0 && (
                  <Progress type="line" percent={Math.ceil(updateProgress * 100)} showInfo={false} style={{ width: 50, paddingBottom: "16px" }} />
                )}
              </Space>
            </Button>
          )}

          {location.pathname.startsWith("/app/") && <ServerConnInfo />}

          {userStore.sessionId != "" && (
            <Popover trigger="click" placement='bottom' content={
              <Table rowKey="port" dataSource={appStore.localProxyList} columns={proxyColumns} pagination={false}
                style={{ height: "calc(100vh - 400px)", overflowY: "scroll", width: "320px" }} />
            } destroyTooltipOnHide>
              <Badge count={appStore.localProxyList.length} size='small' dot style={{ left: "16px", top: "2px", backgroundColor: "#777" }}>
                <PartitionOutlined style={{ marginRight: "20px", fontSize: "18px", color: "#777", cursor: "pointer" }} title='端口转发' />
              </Badge>
            </Popover>
          )}

          {userStore.sessionId != "" && (
            <Popover trigger="click" placement='bottom' content={
              <UserNoticeList />
            } destroyTooltipOnHide>
              <Badge count={userStore.userInfo.unReadNotice} size='small' style={{ left: "16px", top: "2px", backgroundColor: "orange" }} offset={[-20, 6]}>
                <MailTwoTone style={{ marginRight: "30px", fontSize: "18px", cursor: "pointer" }} twoToneColor={userStore.userInfo.unReadNotice > 0 ? ["orange", "white"] : ["#777", "white"]} />
              </Badge>
            </Popover>
          )}
          <a href="https://atomgit.com/openlinksaas/desktop/issues" target="_blank" rel="noreferrer" style={{ marginRight: "20px" }} title="报告缺陷"><BugOutlined /></a>
          <div className={style.btnMinimize} onClick={() => handleClick('minimize')} title="最小化" />
          <div className={style.btnMaximize} onClick={() => handleClick('maximize')} title="最大化/恢复" />
          <Popover trigger="hover" placement="bottom" content={
            <Space direction="vertical" style={{ padding: "10px 0px" }}>
              <Button type="link" onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                handleClick('hide');
              }}>隐藏应用</Button>
              <Button type="link" danger onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                handleClick('exit');
              }}>关闭应用</Button>
            </Space>
          }>
            <div className={style.btnClose} title="隐藏/关闭窗口" onClick={() => handleClick('hide')} />
          </Popover>
        </div>
      </Header >
      {showRemoveModal == true && entryStore.curEntry != null && (
        <RemoveEntryModal entryInfo={entryStore.curEntry} onCancel={() => setShowRemoveModal(false)}
          onRemove={() => {
            entryStore.reset();
            history.push(APP_PROJECT_HOME_PATH);
            setShowRemoveModal(false);
          }} />
      )}
    </div >
  );
};

export default observer(MyHeader);
