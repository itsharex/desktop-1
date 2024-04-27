//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Checkbox, Form, Input, Modal, Space, Tabs } from "antd";
import React, { useState } from "react";
import { useCommonEditor } from '@/components/Editor';
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { create_org } from "@/api/org";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import { joinOrgOrProject } from "./join";
import { useHistory } from "react-router-dom";
import { APP_ORG_PATH } from "@/utils/constant";

type CreatedOrJoinOrgProps = {
    visible: boolean;
    onChange: (boo: boolean) => void;
};

const CreatedOrJoinOrg = (props: CreatedOrJoinOrgProps) => {
    const { visible, onChange } = props;

    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');

    const [orgName, setOrgName] = useState("");
    const [activeKey, setActiveKey] = useState("create");
    const [linkText, setLinkText] = useState('');

    const [enableDayReport, setEnableDayReport] = useState(true);
    const [enableWeekReport, setEnableWeekReport] = useState(true);
    const [enableOkr, setEnableOkr] = useState(true);

    const { editor, editorRef } = useCommonEditor({
        placeholder: "请输入团队介绍",
        content: "",
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: false,
        widgetInToolbar: false,
        showReminder: false,
    });

    const checkValid = () => {
        if (activeKey == "create") {
            return orgName != "";
        } else if (activeKey == "join") {
            return linkText.trim().length != 0;
        }
        return false;
    };

    const createOrg = async () => {
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        const res = await request(create_org({
            session_id: userStore.sessionId,
            basic_info: {
                org_name: orgName,
                org_desc: JSON.stringify(content),
            },
            setting: {
                enable_day_report: enableDayReport,
                enble_week_report: enableWeekReport,
                enable_okr: enableOkr,
            },
        }));
        await orgStore.onJoin(res.org_id, userStore.userInfo.userId);
        projectStore.setCurProjectId("");
        //跳转到团队详情页面
        orgStore.setCurOrgId(res.org_id);
        history.push(APP_ORG_PATH);
        onChange(false);
    };

    return (
        <Modal open={visible} title="创建/加入团队" width={800}
            bodyStyle={{ padding: "2px 10px" }}
            okText={activeKey == "create" ? "创建" : "加入"} okButtonProps={{ disabled: !checkValid() }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                onChange(false);
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (activeKey == "create") {
                    createOrg();
                } else if (activeKey == "join") {
                    joinOrgOrProject(linkText, userStore, projectStore, orgStore, history).then(() => onChange(false));
                }
            }}>
            <Tabs type="card" activeKey={activeKey} onChange={value => setActiveKey(value)}
                items={[
                    {
                        key: "create",
                        label: "创建团队",
                        children: (
                            <Form labelCol={{ span: 3 }} style={{ paddingRight: "20px" }}>
                                <Form.Item label="团队名称">
                                    <Input allowClear placeholder={`请输入团队名称`} style={{ borderRadius: '6px' }} value={orgName} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setOrgName(e.target.value.trim());
                                    }} />
                                </Form.Item>
                                <Form.Item label="团队功能">
                                    <Space>
                                        <Checkbox checked={enableDayReport} style={{ backgroundColor: "#eee", padding: "2px 4px" }}
                                            onChange={e => {
                                                e.stopPropagation();
                                                setEnableDayReport(e.target.checked);
                                            }}>日报</Checkbox>
                                        <Checkbox checked={enableWeekReport} style={{ backgroundColor: "#eee", padding: "2px 4px" }}
                                            onChange={e => {
                                                e.stopPropagation();
                                                setEnableWeekReport(e.target.checked);
                                            }}>周报</Checkbox>
                                        <Checkbox checked={enableOkr} style={{ backgroundColor: "#eee", padding: "2px 4px" }}
                                            onChange={e => {
                                                e.stopPropagation();
                                                setEnableOkr(e.target.checked);
                                            }}>个人目标</Checkbox>
                                    </Space>
                                </Form.Item>
                                <Form.Item label="团队介绍">
                                    <div className="_projectEditContext" style={{ marginTop: '-12px' }}>
                                        {editor}
                                    </div>
                                </Form.Item>
                            </Form>
                        ),
                    },
                    {
                        key: "join",
                        label: "加入项目/团队",
                        children: (
                            <Form labelCol={{ span: 2 }} style={{ paddingRight: "20px" }}>
                                <Form.Item label="邀请码">
                                    <Input
                                        placeholder="请输入邀请码"
                                        allowClear
                                        onChange={(e) => setLinkText(e.target.value.trim())}
                                    />
                                </Form.Item>
                            </Form>
                        ),
                    }
                ]} />
        </Modal>
    );
};

export default CreatedOrJoinOrg;
