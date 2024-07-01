//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import type { UserResumeInfo } from "@/api/user_resume";
import { GENDER_TYPE_FEMALE, GENDER_TYPE_MALE, GENDER_TYPE_UNKNOWN, get_from_org } from "@/api/user_resume";
import { useStores } from "@/hooks";
import { observer } from 'mobx-react';
import { request } from "@/utils/request";
import { Descriptions, List } from "antd";
import moment from "moment";
import { uniqId } from "@/utils/utils";


export interface MemberResumeProps {
    memberUserId: string;
}


const MemberResume = (props: MemberResumeProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [resumeInfo, setResumeInfo] = useState<UserResumeInfo | null>(null);

    const loadResumeInfo = async () => {
        const res = await request(get_from_org({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: props.memberUserId,
        }));
        setResumeInfo(res.resume_info);
    };

    useEffect(() => {
        if (orgStore.curOrgId == "") {
            setResumeInfo(null);
        } else {
            loadResumeInfo();
        }
    }, [orgStore.curOrgId, props.memberUserId]);

    return (
        <>
            {resumeInfo != null && (
                <div>
                    <Descriptions title="基本信息" bordered labelStyle={{ width: "100px" }}>
                        <Descriptions.Item label="姓名">{resumeInfo.basic_info.true_name}</Descriptions.Item>
                        <Descriptions.Item label="性别">
                            {resumeInfo.basic_info.gender == GENDER_TYPE_UNKNOWN && "保密"}
                            {resumeInfo.basic_info.gender == GENDER_TYPE_MALE && "男性"}
                            {resumeInfo.basic_info.gender == GENDER_TYPE_FEMALE && "女性"}
                        </Descriptions.Item>
                        <Descriptions.Item label="出生年月">
                            {resumeInfo.basic_info.has_birth_day ? moment(resumeInfo.basic_info.birthday).format("YYYY-MM-DD") : ""}
                        </Descriptions.Item>
                        <Descriptions.Item label="手机号码">
                            {resumeInfo.basic_info.mobile_phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="邮箱" span={2}>
                            {resumeInfo.basic_info.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="个人简介" span={3}>
                            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                {resumeInfo.basic_info.self_intro}
                            </pre>
                        </Descriptions.Item>
                    </Descriptions>
                    <h1 style={{ fontSize: "14px", fontWeight: 700, marginTop: "10px" }}>工作经历</h1>
                    <List rowKey="id" dataSource={resumeInfo.work_exp_item_list.map(item => ({
                        id: uniqId(),
                        workExpItem: item,
                    }))} pagination={false} renderItem={item => (
                        <Descriptions bordered labelStyle={{ width: "100px" }}>
                            <Descriptions.Item label="工作时间">
                                {item.workExpItem.has_from_time ? moment(item.workExpItem.from_time).format("YYYY-MM") : "-"}
                                &nbsp;至&nbsp;
                                {item.workExpItem.has_to_time ? moment(item.workExpItem.to_time).format("YYYY-MM") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="公司">
                                {item.workExpItem.company}
                            </Descriptions.Item>
                            <Descriptions.Item label="职位">
                                {item.workExpItem.positon}
                            </Descriptions.Item>
                            <Descriptions.Item label="工作简介">
                                <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                    {item.workExpItem.work_desc}
                                </pre>
                            </Descriptions.Item>
                        </Descriptions>
                    )} />
                    <h1 style={{ fontSize: "14px", fontWeight: 700, marginTop: "10px" }}>教育经历</h1>
                    <List rowKey="id" dataSource={resumeInfo.edu_exp_item_list.map(item => ({
                        id: uniqId(),
                        eduExpItem: item,
                    }))} pagination={false} renderItem={item => (
                        <Descriptions bordered labelStyle={{ width: "100px" }}>
                            <Descriptions.Item label="学习时间">
                                {item.eduExpItem.has_from_time ? moment(item.eduExpItem.from_time).format("YYYY-MM") : "-"}
                                &nbsp;至&nbsp;
                                {item.eduExpItem.has_to_time ? moment(item.eduExpItem.to_time).format("YYYY-MM") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="学校">
                                {item.eduExpItem.school_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="专业">
                                {item.eduExpItem.major_name}
                            </Descriptions.Item>
                        </Descriptions>
                    )} />
                </div>
            )}
        </>
    );
};

export default observer(MemberResume);