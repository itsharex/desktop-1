//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Form, List, Modal, Popover, Space } from "antd";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import type { AdminUserInfo } from "@/api/admin_auth_admin";
import { list_user, update_user_desc, update_user_pub_key, update_user_perm, remove_user, get_user } from "@/api/admin_auth_admin";
import { request } from "@/utils/request";
import { get_admin_session } from "@/api/admin_auth";
import AddAdminUserModal from "./components/AddAdminUserModal";
import { EditTextArea } from "@/components/EditCell/EditTextArea";
import { appStorePermOptionList, calcAppStorePerm, calcDevContainerPerm, calcDockerTemplatePerm, calcGitVpPerm, calcIdeaStorePerm, calcKeywordPerm, calcMenuPerm, calcOrgMemberPerm, calcOrgPerm, calcProjectMemberPerm, calcProjectPerm, calcSkillCenterPerm, calcSwStorePerm, calcUserPerm, calcWidgetStorePerm, devContainerPermOptionList, dockerTemplatePermOptionList, genAppStorePermValues, genDevContainerPermValues, genDockerTemplatePermValues, genGitVpPermValues, genIdeaStorePermValues, genKeywordPermValues, genMenuPermValues, genOrgMemberPermValues, genOrgPermValues, genProjectMemberPermValues, genProjectPermValues, genSkillCenterPermValues, genSwStorePermValues, genUserPermValues, genWidgetStorePermValues, gitVpPermOptionList, ideaStorePermOptionList, keywordPermOptionList, menuPermOptionList, orgMemberPermOptionList, orgPermOptionList, projectMemberPermOptionList, projectPermOptionList, skillCenterPermOptionList, swStorePermOptionList, userPermOptionList, widgetStorePermOptionList } from "./components/permUtil";

const PAGE_SIZE = 10;

interface AdminUserPanelProps {
    adminUserInfo: AdminUserInfo;
    onChange: () => void;
    onRemove: () => void;
}

const AdminUserPanel = (props: AdminUserPanelProps) => {
    const [inEdit, setInEdit] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

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
    const [gitVpPermValues, setGitVpPermValues] = useState([] as string[]);

    const resetPerm = () => {
        setUserPermValues(genUserPermValues(props.adminUserInfo.perm_info.user_perm));
        setProjectPermValues(genProjectPermValues(props.adminUserInfo.perm_info.project_perm));
        setProjectMemberPermValues(genProjectMemberPermValues(props.adminUserInfo.perm_info.project_member_perm));
        setMenuPermValues(genMenuPermValues(props.adminUserInfo.perm_info.menu_perm));
        setAppStorePermValues(genAppStorePermValues(props.adminUserInfo.perm_info.app_store_perm));
        setDockerTemplatePermValues(genDockerTemplatePermValues(props.adminUserInfo.perm_info.docker_template_perm));
        setDevContainerPermValues(genDevContainerPermValues(props.adminUserInfo.perm_info.dev_container_perm));
        setIdeaStorePermValues(genIdeaStorePermValues(props.adminUserInfo.perm_info.idea_store_perm));
        setWidgetStorePermValues(genWidgetStorePermValues(props.adminUserInfo.perm_info.widget_store_perm));
        setSwStorePermValues(genSwStorePermValues(props.adminUserInfo.perm_info.sw_store_perm));
        setSkillCenterPermValues(genSkillCenterPermValues(props.adminUserInfo.perm_info.skill_center_perm));
        setOrgPermValues(genOrgPermValues(props.adminUserInfo.perm_info.org_perm));
        setOrgMemberPermValues(genOrgMemberPermValues(props.adminUserInfo.perm_info.org_member_perm));
        setKeywordPermValues(genKeywordPermValues(props.adminUserInfo.perm_info.keyword_perm));
        setGitVpPermValues(genGitVpPermValues(props.adminUserInfo.perm_info.git_vp_perm));
    };

    const updatePerm = async () => {
        const sessionId = await get_admin_session();
        await request(update_user_perm({
            admin_session_id: sessionId,
            user_name: props.adminUserInfo.user_name,
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
                git_vp_perm: calcGitVpPerm(gitVpPermValues),
                super_admin_user: false,
            },
        }));
        setInEdit(false);
        props.onChange();
    };

    const removeUser = async () => {
        const sessionId = await get_admin_session();
        await request(remove_user({
            admin_session_id: sessionId,
            user_name: props.adminUserInfo.user_name,
        }));
        setShowRemoveModal(false);
        props.onRemove();
    };

    useEffect(() => {
        resetPerm();
    }, [props.adminUserInfo.perm_info]);


    return (
        <Card title={<span style={{ fontSize: "20px", fontWeight: 700 }}>用户:{props.adminUserInfo.user_name}</span>}
            extra={
                <Popover trigger="click" placement="bottom" content={
                    <div>
                        <Button type="link" danger onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowRemoveModal(true);
                        }}>删除</Button>
                    </div>
                }>
                    <MoreOutlined />
                </Popover>
            }>
            <h1 style={{ fontSize: "20px", fontWeight: 700 }}>公钥</h1>
            <EditTextArea editable content={props.adminUserInfo.pub_key}
                onChange={async value => {
                    if (value.trim() == "") {
                        return false;
                    }
                    try {
                        const sessionId = await get_admin_session();
                        await request(update_user_pub_key({
                            admin_session_id: sessionId,
                            user_name: props.adminUserInfo.user_name,
                            pub_key: value,
                        }));
                        props.onChange();
                        return true;
                    } catch (e) {
                        console.log(e);
                        return false;
                    }
                }} showEditIcon />
            <h1 style={{ fontSize: "20px", fontWeight: 700 }}>备注</h1>
            <EditTextArea editable content={props.adminUserInfo.user_desc}
                onChange={async value => {
                    try {
                        const sessionId = await get_admin_session();
                        await request(update_user_desc({
                            admin_session_id: sessionId,
                            user_name: props.adminUserInfo.user_name,
                            user_desc: value,
                        }));
                        props.onChange();
                        return true;
                    } catch (e) {
                        console.log(e);
                        return false;
                    }
                }} showEditIcon />
            <Card title="权限" headStyle={{ fontSize: "20px", fontWeight: 700 }}
                extra={
                    <Space>
                        {inEdit == false && (
                            <Button type="primary" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setInEdit(true);
                            }}>修改</Button>
                        )}
                        {inEdit == true && (
                            <>
                                <Button type="default" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    resetPerm();
                                    setInEdit(false);
                                }}>取消</Button>
                                <Button type="primary" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updatePerm();
                                }}>保存</Button>
                            </>
                        )}
                    </Space>
                }>
                <Form labelCol={{ span: 4 }} disabled={inEdit == false}>
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
                    <Form.Item label="Git项目权限">
                        <Checkbox.Group options={gitVpPermOptionList} value={gitVpPermValues} onChange={values => setGitVpPermValues(values as string[])} />
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
            </Card>
            {showRemoveModal == true && (
                <Modal open title="删除用户"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeUser();
                    }}>
                    是否删除用户&nbsp;{props.adminUserInfo.user_name}&nbsp;?
                </Modal>
            )}
        </Card>
    );
};

const AdminUserList = () => {

    const [showAddModal, setShowAddModal] = useState(false);

    const [adminUserList, setAdminUserList] = useState<AdminUserInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);


    const loadAdminUserList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_user({
            admin_session_id: sessionId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setAdminUserList(res.admin_user_list);
    };

    const onUpdate = async (userName: string) => {
        const tmpList = adminUserList.slice();
        const index = tmpList.findIndex(item => item.user_name == userName);
        if (index == -1) {
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(get_user({
            admin_session_id: sessionId,
            user_name: userName,
        }));
        tmpList[index] = res.admin_user;
        setAdminUserList(tmpList);
    };

    useEffect(() => {
        loadAdminUserList();
    }, [curPage]);

    return (
        <Card title="管理员列表"
            bodyStyle={{ height: "calc(100vh - 85px)", overflowY: "scroll" }}
            extra={
                <Button type="primary" icon={<PlusOutlined />}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddModal(true);
                    }}>
                    增加管理员
                </Button>
            }>
            <List rowKey="user_name" dataSource={adminUserList}
                pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
                renderItem={adminUserInfo => (
                    <AdminUserPanel adminUserInfo={adminUserInfo} onChange={() => onUpdate(adminUserInfo.user_name)}
                        onRemove={() => {
                            loadAdminUserList();
                        }} />
                )} />
            {showAddModal == true && (
                <AddAdminUserModal onCancel={() => setShowAddModal(false)}
                    onOk={() => {
                        setShowAddModal(false);
                        if (curPage != 0) {
                            setCurPage(0);
                        } else {
                            loadAdminUserList();
                        }
                    }} />
            )}
        </Card>
    );
};

export default AdminUserList;