//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Form, Input, Modal, Popover, Space, message } from "antd";
import { useStores } from "@/hooks";
import { ReadOnlyEditor, is_empty_doc, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_BULLETIN } from "@/api/fs";
import { request } from "@/utils/request";
import { get as get_bulletin, update as update_bulletin, remove as remove_bulletin } from "@/api/project_bulletin";
import { MoreOutlined } from "@ant-design/icons";
import moment from "moment";

const ViewBulletinModal = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [inEdit, setInEdit] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [createDisplayName, setCreateDisplayName] = useState("");
    const [createTime, setCreateTime] = useState(0);

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.bulletin_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_BULLETIN,
        ownerId: projectStore.projectModal.bulletinId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
    });

    const loadBulletin = async () => {
        const res = await request(get_bulletin({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            bulletin_id: projectStore.projectModal.bulletinId,
        }));
        setTitle(res.key_info.title);
        editorRef.current?.setContent(res.content);
        setContent(res.content);
        setCreateDisplayName(res.key_info.create_display_name);
        setCreateTime(res.key_info.create_time);
    };

    const updateBulletin = async () => {
        if (title.trim() == "") {
            message.error("标题不能为空");
            return;
        }
        const newContent = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        if (is_empty_doc(newContent)) {
            message.error("内容不能为空");
            return;
        }
        await request(update_bulletin({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            bulletin_id: projectStore.projectModal.bulletinId,
            title: title.trim(),
            content: JSON.stringify(newContent),
        }));
        setInEdit(false);
        message.info("更新成功");
        await loadBulletin();
    };

    const removeBulletin = async () => {
        await request(remove_bulletin({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            bulletin_id: projectStore.projectModal.bulletinId,
        }));
        message.info("移至回收站成功");
        projectStore.projectModal.bulletinId = "";
    };

    useEffect(() => {
        loadBulletin();
    }, []);

    return (
        <Modal open title={inEdit ? "更新公告" : "查看公告"} footer={null}
            width="calc(100vw - 400px)"
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.bulletinId = "";
            }}>
            {projectStore.isAdmin && !projectStore.isClosed && (
                <div style={{ display: "flex", borderBottom: "1px solid #e4e4e8", paddingBottom: "4px", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>管理员可编辑公告</div>
                    <Space>
                        {inEdit == false && (
                            <>
                                <Button type="primary" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setInEdit(true);
                                    const t = setInterval(() => {
                                        if (editorRef.current != null) {
                                            clearInterval(t);
                                            editorRef.current.setContent(content);
                                        }
                                    }, 100)
                                }}>编辑</Button>
                                <Popover trigger="click" placement="bottom" content={
                                    <div style={{ padding: "10px 10px" }}>
                                        <Button type="link" danger onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            removeBulletin();
                                        }}>移至回收站</Button>
                                    </div>
                                }>
                                    <MoreOutlined />
                                </Popover>
                            </>
                        )}
                        {inEdit == true && (
                            <>
                                <Button onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    loadBulletin().then(() => {
                                        setInEdit(false);
                                    });
                                }}>取消</Button>
                                <Button type="primary" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updateBulletin();
                                }}>更新</Button>
                            </>
                        )}
                    </Space>
                </div>
            )}
            <Form labelCol={{ span: 2 }}>
                <Form.Item label="标题">
                    {inEdit == true && (
                        <Input value={title} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setTitle(e.target.value);
                        }} />
                    )}
                    {inEdit == false && (
                        <div>{title}</div>
                    )}
                </Form.Item>
                {inEdit == false && (
                    <Form.Item label="发布人">{createDisplayName}&nbsp;
                        {createTime != 0 && moment(createTime).format("(YYYY-MM-DD HH:mm)")}</Form.Item>
                )}
                <Form.Item label="内容">
                    {inEdit == true && (
                        <div className="_editChatContext">{editor}</div>
                    )}
                    {inEdit == false && content != "" && (
                        <div className="_editChatContext">
                            <ReadOnlyEditor content={content} />
                        </div>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default observer(ViewBulletinModal);

