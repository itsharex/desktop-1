//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useRef, useState } from "react";
import { observer } from 'mobx-react';
import type { OrgForumInfo, ForumThreadInfo, ThreadContentInfo } from "@/api/org_forum";
import { get_thread, remove_thread, update_thread, list_content, create_content, update_content, get_content, remove_content } from "@/api/org_forum";
import { Button, Card, List, message, Modal, Popover, Space } from "antd";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { DoubleLeftOutlined, MoreOutlined } from "@ant-design/icons";
import { EditText } from "@/components/EditCell/EditText";
import { change_file_owner, is_empty_doc, ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import { FILE_OWNER_TYPE_NONE, FILE_OWNER_TYPE_ORG_FORUM_CONTENT } from "@/api/fs";

const PAGE_SIZE = 10;

interface EditContentModalProps {
    contentInfo?: ThreadContentInfo;
    forumInfo: OrgForumInfo;
    threadId: string;
    onCancel: () => void;
    onOk: () => void;
}

const EditContentModal = observer((props: EditContentModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const { editor, editorRef } = useCommonEditor({
        content: props.contentInfo?.content ?? "",
        fsId: props.forumInfo.fs_id,
        ownerType: props.contentInfo == undefined ? FILE_OWNER_TYPE_NONE : FILE_OWNER_TYPE_ORG_FORUM_CONTENT,
        ownerId: props.contentInfo?.content_id ?? "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: true,
    });

    const createContent = async () => {
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        if (is_empty_doc(content)) {
            message.warn("内容为空");
            return;
        }
        const createRes = await request(create_content({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: props.threadId,
            content: JSON.stringify(content),
        }));
        //设置文件owner
        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_ORG_FORUM_CONTENT, createRes.content_id);
        message.info("回复成功");
        props.onOk();
    };

    const updateContent = async () => {
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        if (is_empty_doc(content)) {
            message.warn("内容为空");
            return;
        }
        await request(update_content({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: props.threadId,
            content_id: props.contentInfo?.content_id ?? "",
            content: JSON.stringify(content),
        }));
        message.info("修改成功");
        props.onOk();
    };

    return (
        <Modal open title={props.contentInfo == undefined ? "回复帖子" : "修改内容"}
            width="calc(100vw - 200px)"
            okText={props.contentInfo == undefined ? "回复" : "修改"}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (props.contentInfo == undefined) {
                    createContent();
                } else {
                    updateContent();
                }
            }}>
            <div className="_orgPostContext">
                {editor}
            </div>
        </Modal>
    );
});

export interface ThreadContentListProps {
    forumInfo: OrgForumInfo;
    threadId: string;
    onBack: () => void;
}

const ThreadContentList = (props: ThreadContentListProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const lastRef = useRef<HTMLDivElement>(null);

    const [threadInfo, setThreadInfo] = useState<ForumThreadInfo | null>(null);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const [contentList, setContentList] = useState<ThreadContentInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editContentInfo, setEditContentInfo] = useState<ThreadContentInfo | null>(null);

    const [removeContentId, setRemoveContentId] = useState("");

    const loadThreadInfo = async () => {
        const res = await request(get_thread({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: props.threadId,
        }));
        setThreadInfo(res.thread_info);
    };

    const loadContentList = async () => {
        const res = await request(list_content({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: props.threadId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setContentList(res.content_list);
        setTotalCount(res.total_count);
    };

    const removeThread = async () => {
        await request(remove_thread({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: props.threadId,
        }));
        message.info("删除成功");
        setShowRemoveModal(false);
        props.onBack();
    };

    const onUpdateContent = async (contentId: string) => {
        const tmpList = contentList.slice();
        const index = tmpList.findIndex(item => item.content_id == contentId);
        if (index == -1) {
            return;
        }
        const res = await request(get_content({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: props.threadId,
            content_id: contentId,
        }));
        tmpList[index] = res.content_info;
        setContentList(tmpList);
    };

    const goToLastPage = async () => {
        await loadThreadInfo();
        if (threadInfo == null) {
            return;
        }
        const lastPage = Math.ceil(threadInfo.content_count / PAGE_SIZE) - 1;
        if (curPage != lastPage) {
            setCurPage(lastPage);
        } else {
            await loadContentList();
        }
        setTimeout(() => lastRef.current?.scrollIntoView(), 200);
        setTimeout(() => lastRef.current?.scrollIntoView(), 500);
    };

    const removeContent = async () => {
        if (removeContentId == "") {
            return;
        }
        await request(remove_content({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: props.threadId,
            content_id: removeContentId,
        }));
        setRemoveContentId("");
        await loadContentList();
        message.info("删除成功");
    };

    useEffect(() => {
        if (props.threadId == "") {
            setThreadInfo(null);
        } else {
            loadThreadInfo();
        }
    }, [props.threadId]);


    useEffect(() => {
        if (props.threadId != "") {
            loadContentList();
        }
    }, [curPage, props.threadId]);

    return (
        <Card title={
            <Space>
                <Button type="link" icon={<DoubleLeftOutlined />} title="返回" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    props.onBack();
                }} />
                {threadInfo != null && (
                    <EditText editable={threadInfo.user_id == userStore.userInfo.userId}
                        content={threadInfo.title} onChange={async value => {
                            if (value.trim() == "") {
                                return false;
                            }
                            try {
                                await request(update_thread({
                                    session_id: userStore.sessionId,
                                    org_id: orgStore.curOrgId,
                                    forum_id: props.forumInfo.forum_id,
                                    thread_id: props.threadId,
                                    title: value.trim(),
                                }));
                                await loadThreadInfo();
                                return true;
                            } catch (e) {
                                console.log(e);
                                return false;
                            }
                        }} showEditIcon fontSize="16px" fontWeight={700} width="calc(100vw - 800px)" />
                )}
            </Space>
        }
            bordered={false} headStyle={{ fontWeight: 600, backgroundColor: "#eee" }}
            bodyStyle={{ height: "calc(100vh - 110px)", overflowY: "scroll" }}
            extra={
                <Space>
                    <Button type="primary" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditContentInfo(null);
                        setShowEditModal(true);
                    }}>回复帖子</Button>
                    {((threadInfo != null && threadInfo.user_id == userStore.userInfo.userId) || orgStore.curOrg?.owner_user_id == userStore.userInfo.userId) && (
                        <Popover trigger="click" placement="bottom" content={
                            <Space>
                                <Button type="link" danger onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowRemoveModal(true);
                                }}>删除</Button>
                            </Space>
                        }>
                            <MoreOutlined />
                        </Popover>
                    )}
                </Space>
            }>
            <List rowKey="content_id" dataSource={contentList}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                renderItem={item => (
                    <List.Item>
                        <Card title={
                            <Space>
                                <UserPhoto logoUri={item.user_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                {item.user_display_name}
                                <span>({moment(item.create_time).format("YYYY-MM-DD HH:mm:ss")})</span>
                            </Space>
                        } bordered={true} style={{ width: "100%" }} headStyle={{ backgroundColor: "#eee" }}
                            extra={
                                <Popover trigger="click" placement="bottom" content={
                                    <Space direction="vertical">
                                        <Button type="link" disabled={item.user_id != userStore.userInfo.userId}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setEditContentInfo(item);
                                                setShowEditModal(true);
                                            }}>修改</Button>
                                        <Button type="link" danger
                                            disabled={!((item.content_id != threadInfo?.first_content_id) && (item.user_id == userStore.userInfo.userId || orgStore.curOrg?.owner_user_id == userStore.userInfo.userId))}
                                            onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setRemoveContentId(item.content_id);
                                            }}>删除</Button>
                                    </Space>
                                }>
                                    <MoreOutlined />
                                </Popover>
                            }>
                            <ReadOnlyEditor content={item.content} />
                        </Card>
                    </List.Item>
                )} />
            <div ref={lastRef} />
            {showRemoveModal == true && (
                <Modal open title="删除沟通会话"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeThread();
                    }}>
                    是否删除当前沟通会话？
                </Modal>
            )}
            {showEditModal == true && (
                <EditContentModal forumInfo={props.forumInfo} threadId={props.threadId} contentInfo={editContentInfo ?? undefined}
                    onCancel={() => {
                        setEditContentInfo(null);
                        setShowEditModal(false);
                    }}
                    onOk={() => {
                        if (editContentInfo != null) {
                            onUpdateContent(editContentInfo.content_id);
                        } else {
                            goToLastPage();
                        }
                        setEditContentInfo(null);
                        setShowEditModal(false);
                    }} />
            )}
            {removeContentId != "" && (
                <Modal open title="删除内容"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveContentId("");
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeContent();
                    }}>
                    是否删除内容？
                </Modal>
            )}
        </Card>
    );
};

export default observer(ThreadContentList);