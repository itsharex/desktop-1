//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { useStores } from '@/hooks';
import { Button, Card, Checkbox, DatePicker, Form, Input, List, message, Modal, Select, Space, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { update as update_user, USER_TYPE_INTERNAL } from '@/api/user';
import { request } from '@/utils/request';
import type { BasicInfo, WorkExpItemWithId, EduExpItemWithId } from "@/api/user_resume";
import { GENDER_TYPE_FEMALE, GENDER_TYPE_MALE, GENDER_TYPE_UNKNOWN, get as get_resume, set as set_resume } from "@/api/user_resume";
import { uniqId } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

export interface UpdateResumeModalProps {
    onClose: () => void;
}

const DisplayNameTab = () => {
    const userStore = useStores('userStore');

    const [displayName, setDisplayName] = useState(userStore.userInfo.displayName);
    const [hasChange, setHasChange] = useState(false);

    const updateDisplayName = async () => {
        if (displayName.trim() == "") {
            return;
        }
        await request(update_user(userStore.sessionId, {
            display_name: displayName.trim(),
            logo_uri: userStore.userInfo.logoUri,
        }));
        userStore.updateDisplayName(displayName);
        message.info("修改成功");
        setHasChange(false);
    };

    return (
        <Form>
            <Form.Item label="昵称">
                <Input value={displayName} onChange={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setDisplayName(e.target.value);
                    setHasChange(true);
                }} />
            </Form.Item>
            <Form.Item style={{ display: "flex", flexDirection: "row-reverse" }}>
                <Button type="primary" disabled={!hasChange || displayName.trim() == ""}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        updateDisplayName();
                    }}>保存</Button>
            </Form.Item>
        </Form>
    );
};

const ResumeTab = () => {
    const userStore = useStores('userStore');

    const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
    const [workExpList, setWorkExpList] = useState<WorkExpItemWithId[]>([]);
    const [eduExpList, setEduExpList] = useState<EduExpItemWithId[]>([]);
    const [allowProjectAccess, setAllowProjectAccess] = useState(false);
    const [allowOrgAccess, setAllowOrgAccess] = useState(false);
    const [hasChange, setHasChange] = useState(false);

    const loadResume = async () => {
        const res = await request(get_resume({
            session_id: userStore.sessionId,
        }));
        setBasicInfo(res.resume_info.basic_info);
        setWorkExpList(res.resume_info.work_exp_item_list.map(item => ({
            id: uniqId(),
            workExpItem: item,
        })));
        setEduExpList(res.resume_info.edu_exp_item_list.map(item => ({
            id: uniqId(),
            eduExpItem: item,
        })));
        setAllowProjectAccess(res.resume_info.allow_project_access);
        setAllowOrgAccess(res.resume_info.allow_org_access);
    };

    const setResume = async () => {
        if (basicInfo == null) {
            return;
        }
        await request(set_resume({
            session_id: userStore.sessionId,
            resume_info: {
                basic_info: basicInfo,
                work_exp_item_list: workExpList.map(item => item.workExpItem),
                edu_exp_item_list: eduExpList.map(item => item.eduExpItem),
                allow_project_access: allowProjectAccess,
                allow_org_access: allowOrgAccess,
            },
        }));
        message.info("保存成功");
        setHasChange(false);
    };

    useEffect(() => {
        loadResume();
    }, []);

    return (
        <>
            <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}>
                <Form labelCol={{ span: 4 }}>
                    <Form.Item label="访问权限">
                        <Space>
                            <Checkbox checked={allowProjectAccess} onChange={e => {
                                e.stopPropagation();
                                setAllowProjectAccess(e.target.checked);
                                setHasChange(true);
                            }}>项目成员可访问</Checkbox>
                            <Checkbox checked={allowOrgAccess} onChange={e => {
                                e.stopPropagation();
                                setAllowOrgAccess(e.target.checked);
                                setHasChange(true);
                            }}>团队成员可访问</Checkbox>
                        </Space>
                    </Form.Item>
                </Form>
                <h1 style={{ fontSize: "20px", fontWeight: 700 }}>基本信息</h1>
                {basicInfo != null && (
                    <Form labelCol={{ span: 4 }}>
                        <Form.Item label="姓名">
                            <Input value={basicInfo.true_name} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setBasicInfo({
                                    ...basicInfo,
                                    true_name: e.target.value,
                                });
                                setHasChange(true);
                            }} />
                        </Form.Item>
                        <Form.Item label="性别">
                            <Select style={{ width: "100" }} value={basicInfo.gender} onChange={value => {
                                setBasicInfo({ ...basicInfo, gender: value });
                                setHasChange(true);
                            }}>
                                <Select.Option value={GENDER_TYPE_UNKNOWN}>保密</Select.Option>
                                <Select.Option value={GENDER_TYPE_MALE}>男性</Select.Option>
                                <Select.Option value={GENDER_TYPE_FEMALE}>女性</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="出生日期">
                            <DatePicker value={basicInfo.has_birth_day ? moment(basicInfo.birthday) : null} popupStyle={{ zIndex: 9000 }} format="YYYY-MM-DD" placeholder='YYYY-MM-DD'
                                onChange={value => {
                                    if (value == null) {
                                        setBasicInfo({ ...basicInfo, has_birth_day: false, birthday: 0 });
                                    } else {
                                        setBasicInfo({ ...basicInfo, has_birth_day: true, birthday: value.valueOf() });
                                    }
                                    setHasChange(true);
                                }} allowClear />
                        </Form.Item>
                        <Form.Item label="手机">
                            <Input value={basicInfo.mobile_phone} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setBasicInfo({ ...basicInfo, mobile_phone: e.target.value.trim() });
                                setHasChange(true);
                            }} />
                        </Form.Item>
                        <Form.Item label="邮箱">
                            <Input value={basicInfo.email} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setBasicInfo({ ...basicInfo, email: e.target.value.trim() });
                                setHasChange(true);
                            }} />
                        </Form.Item>
                        <Form.Item style={{ marginLeft: "24px" }}>
                            <h2>个人简介</h2>
                            <Input.TextArea autoSize={{ minRows: 3, maxRows: 3 }} value={basicInfo.self_intro}
                                onChange={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setBasicInfo({ ...basicInfo, self_intro: e.target.value });
                                    setHasChange(true);
                                }} />
                        </Form.Item>
                    </Form>
                )}
                <Card title="工作经历" bordered={false} headStyle={{ fontSize: "20px", fontWeight: 700 }}
                    extra={
                        <Button type="default" icon={<PlusOutlined />}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                const tmpList = workExpList.slice();
                                tmpList.unshift({
                                    id: uniqId(),
                                    workExpItem: {
                                        from_time: 0,
                                        has_from_time: false,
                                        to_time: 0,
                                        has_to_time: false,
                                        company: "",
                                        positon: "",
                                        work_desc: "",
                                    },
                                });
                                setWorkExpList(tmpList);
                                setHasChange(true);
                            }}>增加</Button>
                    }>
                    <List rowKey="id" dataSource={workExpList} pagination={false}
                        renderItem={(item, itemIndex) => (
                            <List.Item>
                                <Form labelCol={{ span: 3 }} style={{ width: "100%" }}>
                                    <Form.Item label="工作时间">
                                        <div style={{ display: "flex" }}>
                                            <Space style={{ flex: 1 }}>
                                                <DatePicker picker="month" value={item.workExpItem.has_from_time ? moment(item.workExpItem.from_time) : null}
                                                    format="YYYY-MM" placeholder='YYYY-MM' popupStyle={{ zIndex: 9000 }}
                                                    onChange={value => {
                                                        const tmpList = workExpList.slice();
                                                        if (value == null) {
                                                            tmpList[itemIndex].workExpItem.has_from_time = false;
                                                            tmpList[itemIndex].workExpItem.from_time = 0;
                                                        } else {
                                                            tmpList[itemIndex].workExpItem.has_from_time = true;
                                                            tmpList[itemIndex].workExpItem.from_time = value.valueOf();
                                                        }
                                                        setWorkExpList(tmpList);
                                                        setHasChange(true);
                                                    }} allowClear />
                                                -
                                                <DatePicker picker="month" value={item.workExpItem.has_to_time ? moment(item.workExpItem.to_time) : null}
                                                    format="YYYY-MM" placeholder='YYYY-MM' popupStyle={{ zIndex: 9000 }}
                                                    onChange={value => {
                                                        const tmpList = workExpList.slice();
                                                        if (value == null) {
                                                            tmpList[itemIndex].workExpItem.has_to_time = false;
                                                            tmpList[itemIndex].workExpItem.to_time = 0;
                                                        } else {
                                                            tmpList[itemIndex].workExpItem.has_to_time = true;
                                                            tmpList[itemIndex].workExpItem.to_time = value.valueOf();
                                                        }
                                                        setWorkExpList(tmpList);
                                                        setHasChange(true);
                                                    }} allowClear />
                                            </Space>
                                            <Button type='link' danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const tmpList = workExpList.filter(item2 => item2.id != item.id);
                                                setWorkExpList(tmpList);
                                                setHasChange(true);
                                            }}>删除</Button>
                                        </div>
                                    </Form.Item>
                                    <Form.Item label="公司名称">
                                        <Input value={item.workExpItem.company} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = workExpList.slice();
                                            tmpList[itemIndex].workExpItem.company = e.target.value;
                                            setWorkExpList(tmpList);
                                            setHasChange(true);
                                        }} />
                                    </Form.Item>
                                    <Form.Item label="职位">
                                        <Input value={item.workExpItem.positon} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = workExpList.slice();
                                            tmpList[itemIndex].workExpItem.positon = e.target.value;
                                            setWorkExpList(tmpList);
                                            setHasChange(true);
                                        }} />
                                    </Form.Item>
                                    <Form.Item style={{ marginLeft: "0px" }}>
                                        <h2>工作描述</h2>
                                        <Input.TextArea autoSize={{ minRows: 3, maxRows: 3 }} value={item.workExpItem.work_desc}
                                            onChange={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const tmpList = workExpList.slice();
                                                tmpList[itemIndex].workExpItem.work_desc = e.target.value;
                                                setWorkExpList(tmpList);
                                                setHasChange(true);
                                            }} />
                                    </Form.Item>
                                </Form>
                            </List.Item>
                        )} />
                </Card>
                <Card title="教育经历" bordered={false} headStyle={{ fontSize: "20px", fontWeight: 700 }}
                    extra={
                        <Button type="default" icon={<PlusOutlined />}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                const tmpList = eduExpList.slice();
                                tmpList.unshift({
                                    id: uniqId(),
                                    eduExpItem: {
                                        from_time: 0,
                                        has_from_time: false,
                                        to_time: 0,
                                        has_to_time: false,
                                        school_name: "",
                                        major_name: "",
                                    },
                                });
                                setEduExpList(tmpList);
                            }}>增加</Button>
                    }>
                    <List rowKey="id" dataSource={eduExpList} pagination={false}
                        renderItem={(item, itemIndex) => (
                            <List.Item>
                                <Form labelCol={{ span: 3 }} style={{ width: "100%" }}>
                                    <Form.Item label="学习时间">
                                        <div style={{ display: "flex" }}>
                                            <Space style={{ flex: 1 }}>
                                                <DatePicker picker="month" value={item.eduExpItem.has_from_time ? moment(item.eduExpItem.from_time) : null}
                                                    format="YYYY-MM" placeholder='YYYY-MM' popupStyle={{ zIndex: 9000 }}
                                                    onChange={value => {
                                                        const tmpList = eduExpList.slice();
                                                        if (value == null) {
                                                            tmpList[itemIndex].eduExpItem.has_from_time = false;
                                                            tmpList[itemIndex].eduExpItem.from_time = 0;
                                                        } else {
                                                            tmpList[itemIndex].eduExpItem.has_from_time = true;
                                                            tmpList[itemIndex].eduExpItem.from_time = value.valueOf();
                                                        }
                                                        setEduExpList(tmpList);
                                                        setHasChange(true);
                                                    }} allowClear />
                                                -
                                                <DatePicker picker="month" value={item.eduExpItem.has_to_time ? moment(item.eduExpItem.to_time) : null}
                                                    format="YYYY-MM" placeholder='YYYY-MM' popupStyle={{ zIndex: 9000 }}
                                                    onChange={value => {
                                                        const tmpList = eduExpList.slice();
                                                        if (value == null) {
                                                            tmpList[itemIndex].eduExpItem.has_to_time = false;
                                                            tmpList[itemIndex].eduExpItem.to_time = 0;
                                                        } else {
                                                            tmpList[itemIndex].eduExpItem.has_to_time = true;
                                                            tmpList[itemIndex].eduExpItem.to_time = value.valueOf();
                                                        }
                                                        setEduExpList(tmpList);
                                                        setHasChange(true);
                                                    }} allowClear />
                                            </Space>
                                            <Button type='link' danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const tmpList = eduExpList.filter(item2 => item2.id != item.id);
                                                setEduExpList(tmpList);
                                                setHasChange(true);
                                            }}>删除</Button>
                                        </div>
                                    </Form.Item>
                                    <Form.Item label="学校">
                                        <Input value={item.eduExpItem.school_name} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = eduExpList.slice();
                                            tmpList[itemIndex].eduExpItem.school_name = e.target.value;
                                            setEduExpList(tmpList);
                                            setHasChange(true);
                                        }} />
                                    </Form.Item>
                                    <Form.Item label="专业">
                                        <Input value={item.eduExpItem.major_name} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = eduExpList.slice();
                                            tmpList[itemIndex].eduExpItem.major_name = e.target.value;
                                            setEduExpList(tmpList);
                                            setHasChange(true);
                                        }} />
                                    </Form.Item>
                                </Form>
                            </List.Item>
                        )} />
                </Card>
            </div>
            <div style={{ display: "flex", flexDirection: "row-reverse", margin: "10px 10px" }}>
                <Button type='primary' disabled={!hasChange}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setResume();
                    }}>保存</Button>
            </div>
        </>
    );
};

const UpdateResumeModal = (props: UpdateResumeModalProps) => {
    const userStore = useStores('userStore');

    const [activeKey, setActiveKey] = useState("");

    useEffect(() => {
        if (userStore.userInfo.testAccount) {
            return;
        }
        if (userStore.userInfo.userType == USER_TYPE_INTERNAL) {
            setActiveKey("nickName");
        } else {
            setActiveKey("resume");
        }
    }, []);

    return (
        <Modal open footer={null} bodyStyle={{ padding: "4px 10px" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}>
            <Tabs type='card' activeKey={activeKey} onChange={value => setActiveKey(value)}
                items={[
                    {
                        label: "昵称",
                        key: "nickName",
                        disabled: !(userStore.userInfo.userType == USER_TYPE_INTERNAL && userStore.userInfo.testAccount == false),
                        children: (
                            <>
                                {activeKey == "nickName" && <DisplayNameTab />}
                            </>
                        ),
                    },
                    {
                        label: "个人信息",
                        key: "resume",
                        disabled: userStore.userInfo.testAccount,
                        children: (
                            <>
                                {activeKey == "resume" && <ResumeTab />}
                            </>
                        ),
                    }
                ]} />
        </Modal>
    )
};

export default observer(UpdateResumeModal);