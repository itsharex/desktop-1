//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Checkbox, Form, Input, Modal } from "antd";
import React, { useState } from "react";
import { add_user } from "@/api/admin_auth_admin";
import { appStorePermOptionList, calcAppStorePerm, calcDevContainerPerm, calcDockerTemplatePerm, calcIdeaStorePerm, calcKeywordPerm, calcMenuPerm, calcOrgMemberPerm, calcOrgPerm, calcProjectMemberPerm, calcProjectPerm, calcSkillCenterPerm, calcSwStorePerm, calcUserPerm, calcWidgetStorePerm, devContainerPermOptionList, dockerTemplatePermOptionList, ideaStorePermOptionList, keywordPermOptionList, menuPermOptionList, orgMemberPermOptionList, orgPermOptionList, projectMemberPermOptionList, projectPermOptionList, skillCenterPermOptionList, swStorePermOptionList, userPermOptionList, widgetStorePermOptionList } from "./permUtil";
import { request } from "@/utils/request";
import { get_admin_session } from "@/api/admin_auth";

export interface AddAdminUserModalProps {
    onCancel: () => void;
    onOk: () => void;
}

const AddAdminUserModal = (props: AddAdminUserModalProps) => {
    const [userName, setUserName] = useState("");
    const [pubKey, setPubKey] = useState("");
    const [userDesc, setUserDesc] = useState("");

    const [userPermValues, setUserPermValues] = useState([] as string[]);
    const [projectPermValues, setProjectPermValues] = useState([] as string[]);
    const [projectMemberPermValues, setProjectMemberPermValues] = useState([] as string[]);
    const [menuPermValues, setMenuPermValues] = useState([] as string[]);
    const [appStorePermValues, setAppStorePermValues] = useState([] as string[]);
    const [dockerTemplatePermValues, setDockerTemplatePermValues] = useState([] as string[]);
    const [devContainerPermValues, setDevContainerPermValues] = useState([] as string[]);
    const [ideaStorePermValues, setIdeaStorePermValues] = useState([] as string[]);
    const [widgetStorePermValues, setWidgetStorePermValues] = useState([] as string[]);
    const [swStorePermValues, setSwStorePermValues] = useState([] as string[]);
    const [skillCenterPermValues, setSkillCenterPermValues] = useState([] as string[]);
    const [orgPermValues, setOrgPermValues] = useState([] as string[]);
    const [orgMemberPermValues, setOrgMemberPermValues] = useState([] as string[]);
    const [keywordPermValues, setKeywordPermValues] = useState([] as string[]);


    const createAdminUser = async () => {
        const sessionId = await get_admin_session();
        await request(add_user({
            admin_session_id: sessionId,
            user_name: userName,
            user_desc: userDesc,
            pub_key: pubKey,
            perm_info: {
                user_perm: calcUserPerm(userPermValues),
                project_perm: calcProjectPerm(projectPermValues),
                project_member_perm: calcProjectMemberPerm(projectMemberPermValues),
                menu_perm: calcMenuPerm(menuPermValues),
                app_store_perm: calcAppStorePerm(appStorePermValues),
                docker_template_perm: calcDockerTemplatePerm(dockerTemplatePermValues),
                dev_container_perm: calcDevContainerPerm(devContainerPermValues),
                idea_store_perm: calcIdeaStorePerm(ideaStorePermValues),
                widget_store_perm: calcWidgetStorePerm(widgetStorePermValues),
                sw_store_perm: calcSwStorePerm(swStorePermValues),
                skill_center_perm: calcSkillCenterPerm(skillCenterPermValues),
                org_perm: calcOrgPerm(orgPermValues),
                org_member_perm: calcOrgMemberPerm(orgMemberPermValues),
                keyword_perm: calcKeywordPerm(keywordPermValues),
                super_admin_user: false,
            },
        }));
        props.onOk();
    };

    return (
        <Modal open title="增加管理员"
            bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
            okText="增加" okButtonProps={{ disabled: userName == "" || pubKey == "" }}
            width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createAdminUser();
            }}>
            <Form labelCol={{ span: 4 }}>
                <Form.Item label="用户名">
                    <Input value={userName} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUserName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="公钥">
                    <Input.TextArea autoSize={{ minRows: 5, maxRows: 5 }} value={pubKey} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setPubKey(e.target.value);
                    }} />
                </Form.Item>
                <Form.Item label="备注">
                    <Input.TextArea autoSize={{ minRows: 5, maxRows: 5 }} value={userDesc} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUserDesc(e.target.value);
                    }} />
                </Form.Item>
                <Form.Item label="用户管理权限">
                    <Checkbox.Group options={userPermOptionList} value={userPermValues} onChange={values => setUserPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="项目管理权限">
                    <Checkbox.Group options={projectPermOptionList} value={projectPermValues} onChange={values => setProjectPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="项目成员权限">
                    <Checkbox.Group options={projectMemberPermOptionList} value={projectMemberPermValues} onChange={values => setProjectMemberPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="额外菜单权限">
                    <Checkbox.Group options={menuPermOptionList} value={menuPermValues} onChange={values => setMenuPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="应用管理权限">
                    <Checkbox.Group options={appStorePermOptionList} value={appStorePermValues} onChange={values => setAppStorePermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="Docker模板管理权限">
                    <Checkbox.Group options={dockerTemplatePermOptionList} value={dockerTemplatePermValues} onChange={values => setDockerTemplatePermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="开发容器管理权限">
                    <Checkbox.Group options={devContainerPermOptionList} value={devContainerPermValues} onChange={values => setDevContainerPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="知识库管理权限">
                    <Checkbox.Group options={ideaStorePermOptionList} value={ideaStorePermValues} onChange={values => setIdeaStorePermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="Git内容插件管理权限">
                    <Checkbox.Group options={widgetStorePermOptionList} value={widgetStorePermValues} onChange={values => setWidgetStorePermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="软件管理权限">
                    <Checkbox.Group options={swStorePermOptionList} value={swStorePermValues} onChange={values => setSwStorePermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="技能中心管理权限">
                    <Checkbox.Group options={skillCenterPermOptionList} value={skillCenterPermValues} onChange={values => setSkillCenterPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="团队管理权限">
                    <Checkbox.Group options={orgPermOptionList} value={orgPermValues} onChange={values => setOrgPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="团队成员权限">
                    <Checkbox.Group options={orgMemberPermOptionList} value={orgMemberPermValues} onChange={values => setOrgMemberPermValues(values as string[])} />
                </Form.Item>
                <Form.Item label="关键词管理权限">
                    <Checkbox.Group options={keywordPermOptionList} value={keywordPermValues} onChange={values => setKeywordPermValues(values as string[])} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddAdminUserModal;