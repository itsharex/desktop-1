//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { gen_invite, list_invite, remove_invite, type InviteInfo } from "@/api/org_mebmer";
import { request } from "@/utils/request";
import { Button, Form, Input, message, Modal, Select, Space, Table, Tabs } from "antd";
import type { ColumnsType } from 'antd/es/table';
import UserPhoto from "../Portrait/UserPhoto";
import moment from "moment";
import { writeText } from '@tauri-apps/api/clipboard';

const { TextArea } = Input;

const PAGE_SIZE = 10;

const InviteList = observer(() => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [inviteList, setInviteList] = useState<InviteInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);


    const loadInviteList = async () => {
        const res = await request(list_invite({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setInviteList(res.invite_info_list);
    };

    const removeInvite = async (inviteCode: string) => {
        await request(remove_invite({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId ?? "",
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
    }, [orgStore.curOrgId, curPage]);

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

type InviteOrgMemberProps = {
    visible: boolean;
    onChange: (boo: boolean) => void;
};

const InviteOrgMember = (props: InviteOrgMemberProps) => {
    const { visible, onChange } = props;

    const appStore = useStores('appStore');
    const userStore = useStores("userStore");
    const orgStore = useStores("orgStore");

    const [linkText, setLinkText] = useState('');
    const [ttl, setTtl] = useState(1);

    const [activeKey, setActiveKey] = useState('invite');

    const getTtlStr = () => {
        if (ttl < 24) {
            return `${ttl}小时`;
        } else {
            return `${(ttl / 24).toFixed(0)}天`;
        }
    };

    const genInvite = async () => {
        const res = await request(gen_invite({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            ttl: ttl,
        }));
        if (res) {
            if (appStore.clientCfg?.can_register == true) {
                setLinkText(`${userStore.userInfo.displayName} 邀请您加入 ${orgStore.curOrg?.basic_info.org_name ?? ""} 团队，您的邀请码 ${res.invite_code} (有效期${getTtlStr()}),请在软件内输入邀请码加入团队。如您尚未安装【凌鲨】，可直接点击链接下载 https://www.linksaas.pro`);
            } else {
                setLinkText(`${userStore.userInfo.displayName} 邀请您加入 ${orgStore.curOrg?.basic_info.org_name ?? ""} 团队，您的邀请码 ${res.invite_code} (有效期${getTtlStr()}),请在软件内输入邀请码加入团队。`);
            }
        }
    };

    const copyAndClose = async () => {
        await writeText(linkText);
        onChange(false);
        message.success('复制成功');
    };

    return (
        <Modal
            open={visible}
            title="邀请团队成员"
            width={700}
            footer={activeKey == "history" ? null : undefined}
            okText={linkText == "" ? "生成邀请码" : "复制并关闭"}
            bodyStyle={{ padding: "0px 10px" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                onChange(false);
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (linkText == "") {
                    genInvite();
                } else {
                    copyAndClose();
                }
            }}
        >
            <Tabs activeKey={activeKey} onChange={key => { setActiveKey(key); console.log(key) }}>
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

export default observer(InviteOrgMember);
