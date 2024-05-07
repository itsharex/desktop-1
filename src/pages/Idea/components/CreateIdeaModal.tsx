//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { observer } from 'mobx-react';
import { Checkbox, Form, Input, Modal, Select, Space, message } from "antd";
import { change_file_fs, change_file_owner, useCommonEditor } from "@/components/Editor";
import { useStores } from "@/hooks";
import { FILE_OWNER_TYPE_IDEA, FILE_OWNER_TYPE_PROJECT } from "@/api/fs";
import { create_idea, type IdeaPerm } from "@/api/project_idea";
import { request } from "@/utils/request";
import { useHistory } from "react-router-dom";
import { LinkIdeaPageInfo } from "@/stores/linkAux";
import UserPhoto from "@/components/Portrait/UserPhoto";


const CreateModal = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const ideaStore = useStores('ideaStore');
    const linkAuxStore = useStores('linkAuxStore');
    const memberStore = useStores('memberStore');

    const { editor, editorRef } = useCommonEditor({
        content: ideaStore.createContent,
        fsId: projectStore.curProject?.idea_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_PROJECT,
        ownerId: projectStore.curProjectId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
    });

    const [title, setTitle] = useState(ideaStore.createTitle);
    const [keywordList, setKeywordList] = useState<string[]>([]);
    const [ideaPerm, setIdeaPeam] = useState<IdeaPerm>({
        update_for_all: true,
        extra_update_user_id_list: [],
    });

    const createIdea = async () => {
        if (title.trim() == "") {
            message.error("标题不能为空");
            return;
        }
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        //更新文件存储
        await change_file_fs(
            content,
            projectStore.curProject?.idea_fs_id ?? '',
            userStore.sessionId,
            FILE_OWNER_TYPE_PROJECT,
            projectStore.curProjectId,
        );
        const createRes = await request(create_idea({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            basic_info: {
                title: title.trim(),
                content: JSON.stringify(content),
                keyword_list: keywordList,
            },
            idea_group_id: ideaStore.curIdeaGroupId,
            idea_perm: ideaPerm,
        }));
        //变更文件Owner
        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_IDEA, createRes.idea_id);
        ideaStore.closeShowCreateIdea();
        linkAuxStore.goToLink(new LinkIdeaPageInfo("", projectStore.curProjectId, "", []), history);
    };


    return (
        <Modal open title="创建知识点"
            width={800}
            okText="创建" okButtonProps={{ disabled: title.trim() == "" || keywordList.length == 0 }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                ideaStore.closeShowCreateIdea();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createIdea();
            }}>
            <Form labelCol={{ span: 3 }}>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value);
                    }} />
                </Form.Item>
                <Form.Item label="内容">
                    <div className="_editChatContext">
                        {editor}
                    </div>
                </Form.Item>
                <Form.Item label="关键词">
                    <Select mode="tags" onChange={value => setKeywordList((value as string[]).map(item => item.toLowerCase()))}
                        placement="topLeft" placeholder="请设置知识点相关的关键词">
                        {ideaStore.keywordList.map(keyword => (
                            <Select.Option key={keyword} value={keyword}>{keyword}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="全体成员可编辑">
                    <Checkbox checked={ideaPerm.update_for_all} onChange={e => {
                        e.stopPropagation();
                        setIdeaPeam({
                            update_for_all: e.target.checked,
                            extra_update_user_id_list: e.target.checked ? [] : ideaPerm.extra_update_user_id_list,
                        });
                    }} />
                </Form.Item>
                {ideaPerm.update_for_all == false && (
                    <Form.Item label="可编辑成员" help="管理员始终有编辑权限">
                        <Select value={ideaPerm.extra_update_user_id_list} onChange={value => {
                            setIdeaPeam({
                                update_for_all: false,
                                extra_update_user_id_list: value,
                            })
                        }} mode="multiple">
                            {memberStore.memberList.filter(member => member.member.can_admin == false).map(member => (
                                <Select.Option key={member.member.member_user_id} value={member.member.member_user_id}>
                                    <Space>
                                        <UserPhoto logoUri={member.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                        {member.member.display_name}
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default observer(CreateModal);