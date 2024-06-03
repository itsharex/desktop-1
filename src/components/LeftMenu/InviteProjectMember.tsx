//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Button, Checkbox, Form, Input, message, Modal, Select, Space, Table, Tabs, Tag } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import React from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { gen_invite, add_from_org } from '@/api/project_member';
import { request } from '@/utils/request';
import { observer } from 'mobx-react';
import { useStores } from '@/hooks';
import type { InviteInfo } from "@/api/project_member";
import { list_invite, remove_invite } from "@/api/project_member";
import type { ColumnsType } from 'antd/es/table';
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from 'moment';
import s from "./InviteProjectMember.module.less";
import type { ProjectMemberInfo } from "@/api/org_mebmer";
import { list_for_project, MEMBER_IN_PROJECT, MEMBER_TO_ACK_JOIN, MEMBER_UNJOIN } from "@/api/org_mebmer";


const { TextArea } = Input;

const PAGE_SIZE = 10;

const InviteList = observer(() => {
  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');

  const [inviteList, setInviteList] = useState<InviteInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [curPage, setCurPage] = useState(0);

  const loadInviteList = async () => {
    const res = await request(list_invite({
      session_id: userStore.sessionId,
      project_id: projectStore.curProjectId,
      offset: PAGE_SIZE * curPage,
      limit: PAGE_SIZE,
    }));
    setTotalCount(res.total_count);
    setInviteList(res.invite_info_list);
  };

  const removeInvite = async (inviteCode: string) => {
    await request(remove_invite({
      session_id: userStore.sessionId,
      project_id: projectStore.curProjectId,
      invite_code: inviteCode,
    }));
    if (curPage != 0) {
      setCurPage(0);
    } else {
      await loadInviteList();
    }
    message.info("删除成功");
  };

  const columns: ColumnsType<InviteInfo> = [
    {
      title: "发起用户",
      width: 150,
      render: (_, row: InviteInfo) => (
        <Space style={{ overflow: "hidden" }} title={row.create_display_name}>
          <UserPhoto logoUri={row.create_logo_uri} style={{ width: "24px", height: "24px", borderRadius: "24px" }} />
          <span>{row.create_display_name}</span>
        </Space>
      ),
    },
    {
      title: "发起时间",
      width: 120,
      render: (_, row: InviteInfo) => moment(row.create_time).format("YYYY-MM-DD HH点"),
    },
    {
      title: "到期时间",
      width: 120,
      render: (_, row: InviteInfo) => moment(row.expire_time).format("YYYY-MM-DD HH点"),
    },
    {
      title: "邀请码",
      width: 100,
      render: (_, row: InviteInfo) => <div style={{ textWrap: "wrap", width: "100px" }}>{row.invite_code}</div>
    },
    {
      title: "操作",
      render: (_, row: InviteInfo) => (
        <Space>
          <Button type="link"
            style={{ minWidth: 0, padding: "0px 0px" }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              writeText(row.invite_code);
              message.info("复制成功");
            }}>复制</Button>
          <Button type="link" danger onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            removeInvite(row.invite_code);
          }}>删除邀请码</Button>
        </Space>
      ),
    }
  ];

  useEffect(() => {
    loadInviteList();
  }, [projectStore.curProjectId, curPage]);

  return (
    <Table rowKey="invite_code" dataSource={inviteList} columns={columns} pagination={{
      current: curPage + 1,
      total: totalCount,
      pageSize: PAGE_SIZE,
      onChange: page => setCurPage(page - 1),
      hideOnSinglePage: true,
      showSizeChanger: false
    }} scroll={{ y: "calc(100vh - 400px)" }} />
  );
});


type InviteProjectMemberProps = {
  visible: boolean;
  onChange: (boo: boolean) => void;
};

const InviteProjectMember: FC<InviteProjectMemberProps> = (props) => {
  const { visible, onChange } = props;

  const userStore = useStores("userStore");
  const projectStore = useStores("projectStore");
  const orgStore = useStores('orgStore');

  const [linkText, setLinkText] = useState('');
  const [ttl, setTtl] = useState(1);

  const [activeKey, setActiveKey] = useState('invite');
  const [curOrgId, setCurOrgId] = useState("");

  const [inPrjMemberList, setInPrjMemberList] = useState<ProjectMemberInfo[]>([]);
  const [toAckMemberList, setToAckMemberList] = useState<ProjectMemberInfo[]>([]);
  const [unJoinMemberList, setUnJoinMemberList] = useState<ProjectMemberInfo[]>([]);
  const [selUserIdList, setSelUserIdList] = useState<string[]>([]);

  const getTtlStr = () => {
    if (ttl < 24) {
      return `${ttl}小时`;
    } else {
      return `${(ttl / 24).toFixed(0)}天`;
    }
  };

  const genInvite = async () => {
    const res = await request(gen_invite(userStore.sessionId, projectStore.curProjectId, ttl));
    if (res) {
        setLinkText(`${userStore.userInfo.displayName} 邀请您加入 ${projectStore.curProject?.basic_info.project_name ?? ""} 项目，您的邀请码 ${res.invite_code} (有效期${getTtlStr()}),请在软件内输入邀请码加入项目。`);
    }
  };

  const copyAndClose = async () => {
    await writeText(linkText);
    onChange(false);
    message.success('复制成功');
  };

  const loadOrgMemberList = async () => {
    const res = await request(list_for_project({
      session_id: userStore.sessionId,
      org_id: curOrgId,
      project_id: projectStore.curProjectId,
    }));
    setInPrjMemberList(res.member_list.filter(item => item.project_member_state == MEMBER_IN_PROJECT));
    setToAckMemberList(res.member_list.filter(item => item.project_member_state == MEMBER_TO_ACK_JOIN));
    setUnJoinMemberList(res.member_list.filter(item => item.project_member_state == MEMBER_UNJOIN));
    setSelUserIdList([]);
  };

  const getOkText = (): string => {
    if (activeKey == "inviteFromOrg") {
      return "邀请";
    } else if (activeKey == "invite") {
      return linkText == "" ? "生成邀请码" : "复制并关闭";
    }
    return "";
  }

  const addFromOrg = async () => {
    for (const memberUserId of selUserIdList) {
      await request(add_from_org({
        session_id: userStore.sessionId,
        project_id: projectStore.curProjectId,
        org_id: curOrgId,
        member_user_id: memberUserId,
      }));
    }
    message.info("已发送邀请");
    await loadOrgMemberList();
  };

  useEffect(() => {
    if (userStore.userInfo.featureInfo.enable_org == true && orgStore.orgList.length > 0) {
      setActiveKey("inviteFromOrg");
      setCurOrgId(orgStore.orgList[0].org_id);
    }
  }, []);

  useEffect(() => {
    if (curOrgId != "") {
      loadOrgMemberList();
    }
  }, [curOrgId]);

  return (
    <Modal
      open={visible}
      title="邀请项目成员"
      width={700}
      footer={activeKey == "history" ? null : undefined}
      okText={getOkText()}
      okButtonProps={{ disabled: activeKey == "inviteFromOrg" && selUserIdList.length == 0 }}
      bodyStyle={{ padding: "0px 10px" }}
      onCancel={e => {
        e.stopPropagation();
        e.preventDefault();
        onChange(false);
      }}
      onOk={e => {
        e.stopPropagation();
        e.preventDefault();
        if (activeKey == "inviteFromOrg") {
          addFromOrg();
        } else if (activeKey == "invite") {
          if (linkText == "") {
            genInvite();
          } else {
            copyAndClose();
          }
        }
      }}
    >
      <Tabs activeKey={activeKey} onChange={key => { setActiveKey(key); console.log(key) }}>
        {userStore.userInfo.featureInfo.enable_org == true && orgStore.orgList.length > 0 && (
          <Tabs.TabPane tab="从团队中邀请" key="inviteFromOrg">
            <Tabs items={orgStore.orgList.map(orgInfo => (
              {
                label: orgInfo.basic_info.org_name,
                key: orgInfo.org_id,
                children: (
                  <Form style={{ height: "calc(100vh - 440px)", overflowY: "scroll" }} labelCol={{ span: 4 }}>
                    {inPrjMemberList.length > 0 && (
                      <Form.Item label="已加入">
                        <Space>
                          {inPrjMemberList.map(member => (
                            <Tag style={{ padding: "0px 4px" }}>
                              <Space>
                                <UserPhoto logoUri={member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                {member.display_name}
                              </Space>
                            </Tag>
                          ))}
                        </Space>
                      </Form.Item>
                    )}
                    {toAckMemberList.length > 0 && (
                      <Form.Item label="待确认加入">
                        <Space>
                          {toAckMemberList.map(member => (
                            <Tag style={{ padding: "0px 4px" }}>
                              <Space>
                                <UserPhoto logoUri={member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                {member.display_name}
                              </Space>
                            </Tag>
                          ))}
                        </Space>
                      </Form.Item>
                    )}
                    {unJoinMemberList.length > 0 && (
                      <Form.Item label="待加入">
                        <Checkbox.Group options={unJoinMemberList.map(member => ({
                          label: member.display_name,
                          value: member.member_user_id,
                        }))} onChange={values => setSelUserIdList(values as string[])} />
                      </Form.Item>
                    )}
                  </Form>
                ),
              }
            ))} tabPosition='left' style={{ maxHeight: "calc(100vh - 400px)" }} popupClassName={s.tabList}
              tabBarStyle={{ width: "100px", overflow: "hidden" }}
              activeKey={curOrgId} onChange={key => setCurOrgId(key)} />
          </Tabs.TabPane>
        )}

        <Tabs.TabPane tab="邀请" key='invite'>
          {linkText == "" && (
            <Form>
              <Form.Item label="有效期">
                <Select value={ttl} onChange={value => setTtl(value)}>
                  <Select.Option value={1}>1小时</Select.Option>
                  <Select.Option value={3}>3小时</Select.Option>
                  <Select.Option value={24}>1天</Select.Option>
                  <Select.Option value={24 * 3}>3天</Select.Option>
                  <Select.Option value={24 * 7}>1周</Select.Option>
                  <Select.Option value={24 * 14}>2周</Select.Option>
                  <Select.Option value={24 * 30}>1月</Select.Option>
                </Select>
              </Form.Item>
            </Form>
          )}
          {linkText != "" && (
            <>
              <div
                style={{
                  textAlign: 'left',
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: ' #2C2D2E',
                }}
              >
                请发送邀请链接给需要邀请的成员
              </div>

              <div style={{ margin: '10px 0' }}>
                <TextArea placeholder="请输入" value={linkText} autoSize={{ minRows: 2, maxRows: 5 }} readOnly />
              </div>
            </>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="邀请记录" key='history'>
          {activeKey == "history" && <InviteList />}
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default observer(InviteProjectMember);
