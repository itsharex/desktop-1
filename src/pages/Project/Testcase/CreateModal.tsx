//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Checkbox, Form, Input, Modal, Radio, Select, Space, message } from "antd";
import React, { useState } from "react";
import { observer } from 'mobx-react';
import type { PermSetting, TestMethod } from "@/api/project_testcase";
import { create_case, create_folder } from "@/api/project_testcase";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import { change_file_owner, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_PROJECT, FILE_OWNER_TYPE_TEST_CASE } from "@/api/fs";
import UserPhoto from "@/components/Portrait/UserPhoto";


export interface CreateModalProps {
    onCancel: () => void;
    onOk: () => void;
};

const CreateModal = (props: CreateModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.test_case_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_PROJECT,
        ownerId: projectStore.curProjectId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        enableLink: false,
        widgetInToolbar: false,
        showReminder: false,
        placeholder: "请输入测试方案...",
    });

    const [createType, setCreateType] = useState<"folder" | "case">("case");

    const [folderTitle, setFolderTitle] = useState("");
    const [testMethod, setTestMethod] = useState<TestMethod>({
        unit_test: false,
        ci_test: false,
        load_test: false,
        manual_test: false,
    });

    const [caseTitle, setCaseTitle] = useState("");

    const [permSetting, setPermSetting] = useState<PermSetting>({
        update_for_all: true,
        extra_update_user_id_list: [],
    });

    const createFolder = async () => {
        await request(create_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            title: folderTitle,
            parent_folder_id: projectStore.projectModal.createTestCaseParentFolderId,
            perm_setting: {
                update_for_all: permSetting.update_for_all,
                extra_update_user_id_list: permSetting.update_for_all ? [] : permSetting.extra_update_user_id_list,
            },
        }));
        message.info("创建成功");
        props.onOk();
    };

    const createCase = async () => {
        if (editorRef.current == null) {
            return;
        }
        const content = editorRef.current.getContent();
        const res = await request(create_case({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            title: caseTitle,
            parent_folder_id: projectStore.projectModal.createTestCaseParentFolderId,
            perm_setting: {
                update_for_all: permSetting.update_for_all,
                extra_update_user_id_list: permSetting.update_for_all ? [] : permSetting.extra_update_user_id_list,
            },
            test_method: testMethod,
            content: JSON.stringify(content),
        }));

        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_TEST_CASE, res.case_id);
        message.info("创建成功");
        props.onOk();
    };

    const isValid = (): boolean => {
        if (createType == "folder") {
            if (folderTitle != "") {
                return true;
            }
        } else if (createType == "case") {
            if (caseTitle != "") {
                return true;
            }
        }
        return false;
    };

    return (
        <Modal open title={`创建${projectStore.projectModal.createTestCaseEnableFolder ? "目录/测试用例" : "测试用例 "}`}
            okText="创建" okButtonProps={{ disabled: !isValid() }} width={800}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (createType == "folder") {
                    createFolder();
                } else if (createType == "case") {
                    createCase();
                }
            }}>
            <Form labelCol={{ span: 3 }}>
                {projectStore.projectModal.createTestCaseEnableFolder && (
                    <Form.Item label="类型">
                        <Radio.Group value={createType} onChange={e => {
                            e.stopPropagation();
                            setCreateType(e.target.value);
                        }}>
                            <Radio value="case">测试用例</Radio>
                            <Radio value="folder">目录</Radio>
                        </Radio.Group>
                    </Form.Item>
                )}
                <Form.Item label="全体可编辑">
                    <Checkbox checked={permSetting.update_for_all} onChange={e => {
                        e.stopPropagation();
                        setPermSetting({
                            ...permSetting,
                            update_for_all: e.target.checked,
                        });
                    }} />
                </Form.Item>
                {permSetting.update_for_all == false && (
                    <Form.Item label="可编辑成员">
                        <Select mode="multiple" value={permSetting.extra_update_user_id_list}
                            onChange={value => setPermSetting({
                                ...permSetting,
                                extra_update_user_id_list: value,
                            })}>
                            {memberStore.memberList.map(item => (
                                <Select.Option key={item.member.member_user_id} value={item.member.member_user_id}>
                                    <Space>
                                        <UserPhoto logoUri={item.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                        {item.member.display_name}
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                {createType == "folder" && (
                    <Form.Item label="目录名称">
                        <Input value={folderTitle} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setFolderTitle(e.target.value.trim());
                        }} />
                    </Form.Item>
                )}
                {createType == "case" && (
                    <>
                        <Form.Item label="用例名称">
                            <Input value={caseTitle} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setCaseTitle(e.target.value.trim());
                            }} />
                        </Form.Item>
                        <Form.Item label="测试类型">
                            <Space>
                                <Checkbox checked={testMethod.unit_test} onChange={e => {
                                    e.stopPropagation();
                                    setTestMethod({
                                        ...testMethod,
                                        unit_test: e.target.checked,
                                    });
                                }}>单元测试</Checkbox>
                                <Checkbox checked={testMethod.ci_test} onChange={e => {
                                    e.stopPropagation();
                                    setTestMethod({
                                        ...testMethod,
                                        ci_test: e.target.checked,
                                    });
                                }}>集成测试</Checkbox>
                                <Checkbox checked={testMethod.load_test} onChange={e => {
                                    e.stopPropagation();
                                    setTestMethod({
                                        ...testMethod,
                                        load_test: e.target.checked,
                                    });
                                }}>压力测试</Checkbox>
                                <Checkbox checked={testMethod.manual_test} onChange={e => {
                                    e.stopPropagation();
                                    setTestMethod({
                                        ...testMethod,
                                        manual_test: e.target.checked,
                                    });
                                }}>手动测试</Checkbox>
                            </Space>
                        </Form.Item>
                        <Form.Item label="测试方案">
                            <div className="_chatContext">
                                {editor}
                            </div>
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default observer(CreateModal);