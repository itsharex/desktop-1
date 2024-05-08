//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { OrgForumInfo, ForumThreadInfo } from "@/api/org_forum";
import { list_thread, list_content_by_id, create_thread, update_thread, get_thread, set_thread_weight, remove_thread } from "@/api/org_forum";
import { Button, Card, Form, Input, InputNumber, List, message, Modal, Popover, Space } from "antd";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { FILE_OWNER_TYPE_NONE, FILE_OWNER_TYPE_ORG_FORUM_CONTENT } from "@/api/fs";
import { change_file_owner, is_empty_doc, ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { EditText } from "@/components/EditCell/EditText";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { CommentOutlined, MoreOutlined } from "@ant-design/icons";
import moment from "moment";

const PAGE_SIZE = 10;

type ForumThreadWithContentInfo = ForumThreadInfo & {
    content: string;
};

interface CreateModalProps {
    forumInfo: OrgForumInfo;
    onCancel: () => void;
    onOk: () => void;
}

const CreateModal = observer((props: CreateModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [title, setTitle] = useState("");

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: props.forumInfo.fs_id,
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: true,
    });

    const createThread = async () => {
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        if (is_empty_doc(content)) {
            message.warn("帖子内容为空");
            return;
        }
        const createRes = await request(create_thread({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            title: title,
            content: JSON.stringify(content),
        }));
        //设置文件owner
        await change_file_owner(content, userStore.sessionId, FILE_OWNER_TYPE_ORG_FORUM_CONTENT, createRes.content_id);
        message.info("发布成功");
        props.onOk();
    };

    return (
        <Modal open title="发布帖子" width="calc(100vw - 200px)"
            okText="发布" okButtonProps={{ disabled: title == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createThread();
            }}>
            <Form>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="内容">
                    <div className="_orgPostContext">
                        {editor}
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
});

interface UpdateWeightModalProps {
    forumId: string;
    threadInfo: ForumThreadWithContentInfo;
    onCancel: () => void;
    onOk: () => void;
}

const UpdateWeightModal = observer((props: UpdateWeightModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [weight, setWeight] = useState(props.threadInfo.weight);

    const setThreadWeight = async () => {
        await request(set_thread_weight({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumId,
            thread_id: props.threadInfo.thread_id,
            weight: weight,
        }));
        message.info("调整成功");
        props.onOk();
    };

    return (
        <Modal open title="调整推荐值"
            okText="调整" okButtonProps={{ disabled: weight == props.threadInfo.weight }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                setThreadWeight();
            }}>
            <Form>
                <Form.Item label="推荐值" help="数值越大，排序越前(取值范围0-99)">
                    <InputNumber value={weight} onChange={value => setWeight(value ?? 0)} precision={0} controls={false} min={0} max={99} />
                </Form.Item>
            </Form>
        </Modal>
    );
});


export interface ForumThreadListProps {
    forumInfo: OrgForumInfo;
    curPage: number;
    onChange: (newThreadId: string) => void;
    onClickMember: (memberUserId: string) => void;
    onChangePage: (newPage: number) => void;
}

const ForumThreadList = (props: ForumThreadListProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [threadList, setThreadList] = useState<ForumThreadWithContentInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const [updateWeightInfo, setUpdateWeightInfo] = useState<ForumThreadWithContentInfo | null>(null);
    const [removeInfo, setRemoveInfo] = useState<ForumThreadWithContentInfo | null>(null);

    const loadThreadList = async () => {
        try {
            const threadRes = await request(list_thread({
                session_id: userStore.sessionId,
                org_id: orgStore.curOrgId,
                forum_id: props.forumInfo.forum_id,
                offset: props.curPage * PAGE_SIZE,
                limit: PAGE_SIZE,
            }));
            const contentRes = await request(list_content_by_id({
                session_id: userStore.sessionId,
                org_id: orgStore.curOrgId,
                content_id_list: threadRes.thread_list.map(item => item.first_content_id),
            }));
            setTotalCount(threadRes.total_count);
            setThreadList(threadRes.thread_list.map(threadItem => {
                const content = contentRes.content_list.find(contentItem => contentItem.content_id == threadItem.first_content_id)?.content ?? "";
                return {
                    ...threadItem,
                    content: content,
                };
            }));
        } catch (e) {
            console.log(e);
        }
    };

    const onUpdateThread = async (threadId: string) => {
        const tmpList = threadList.slice();
        const index = tmpList.findIndex(item => item.thread_id == threadId);
        if (index == -1) {
            return;
        }
        const res = await request(get_thread({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: threadId,
        }));
        const oldContent = tmpList[index].content;
        tmpList[index] = {
            ...res.thread_info,
            content: oldContent,
        };
        setThreadList(tmpList);
    };

    const removeThread = async () => {
        if (removeInfo == null) {
            return;
        }
        await request(remove_thread({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            thread_id: removeInfo.thread_id,
        }));
        setRemoveInfo(null);
        await loadThreadList();
        message.info("删除成功");
    };

    useEffect(() => {
        if (orgStore.curOrgId != "") {
            loadThreadList();
        }
    }, [props.curPage, orgStore.curOrgId, props.forumInfo.forum_id]);

    return (
        <Card title={`讨论组: ${props.forumInfo.forum_name}`} bordered={false}
            headStyle={{ fontWeight: 600, backgroundColor: "#eee" }}
            bodyStyle={{ height: "calc(100vh - 110px)", overflowY: "scroll" }}
            extra={
                <Button type="primary" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowCreateModal(true);
                }}>发布帖子</Button>
            }>
            <List rowKey="thread_id" dataSource={threadList}
                pagination={{ total: totalCount, current: props.curPage + 1, pageSize: PAGE_SIZE, onChange: page => props.onChangePage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                renderItem={item => (
                    <List.Item>
                        <Card title={
                            <EditText editable={item.user_id == userStore.userInfo.userId}
                                content={item.title} onChange={async value => {
                                    if (value.trim() == "") {
                                        return false;
                                    }
                                    try {
                                        await request(update_thread({
                                            session_id: userStore.sessionId,
                                            org_id: orgStore.curOrgId,
                                            forum_id: props.forumInfo.forum_id,
                                            thread_id: item.thread_id,
                                            title: value.trim(),
                                        }));
                                        await onUpdateThread(item.thread_id);
                                        return true;
                                    } catch (e) {
                                        console.log(e);
                                        return false;
                                    }
                                }} showEditIcon fontSize="20px" fontWeight={700}
                                onClick={() => props.onChange(item.thread_id)} />
                        } bordered={false} style={{ width: "100%", marginRight: "20px" }}
                            extra={
                                <Space size="small">
                                    {moment(item.create_time).format("YYYY-MM-DD HH:mm:ss")}
                                    <UserPhoto logoUri={item.user_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                    <Button type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        props.onClickMember(item.user_id);
                                    }} disabled={orgStore.curOrg?.owner_user_id != userStore.userInfo.userId}
                                        style={{ minWidth: 0, padding: "0px 0px" }}>{item.user_display_name}</Button>
                                    <span>推荐值:{item.weight}</span>
                                    <span><CommentOutlined />&nbsp;{item.content_count}</span>
                                    {(orgStore.curOrg?.owner_user_id == userStore.userInfo.userId || item.user_id == userStore.userInfo.userId) && (
                                        <Popover trigger="click" placement="bottom" content={
                                            <Space direction="vertical">
                                                {orgStore.curOrg?.owner_user_id == userStore.userInfo.userId && (
                                                    <Button type="link" onClick={e => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setUpdateWeightInfo(item);
                                                    }}>调整推荐值</Button>
                                                )}
                                                {(orgStore.curOrg?.owner_user_id == userStore.userInfo.userId || item.user_id == userStore.userInfo.userId) && (
                                                    <Button type="link" danger onClick={e => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setRemoveInfo(item);
                                                    }}>删除</Button>
                                                )}
                                            </Space>
                                        }>
                                            <MoreOutlined />
                                        </Popover>
                                    )}
                                </Space>
                            }>
                            <div className="_commentContext">
                                <ReadOnlyEditor content={item.content} />
                            </div>
                        </Card>
                    </List.Item>
                )} />
            {showCreateModal == true && (
                <CreateModal forumInfo={props.forumInfo} onCancel={() => setShowCreateModal(false)}
                    onOk={() => {
                        setShowCreateModal(false);
                        if (props.curPage != 0) {
                            props.onChangePage(0);
                        } else {
                            loadThreadList();
                        }
                    }} />
            )}
            {updateWeightInfo != null && (
                <UpdateWeightModal forumId={props.forumInfo.forum_id} threadInfo={updateWeightInfo}
                    onCancel={() => setUpdateWeightInfo(null)}
                    onOk={() => {
                        onUpdateThread(updateWeightInfo.thread_id);
                        setUpdateWeightInfo(null);
                    }} />
            )}
            {removeInfo != null && (
                <Modal open title="删除沟通会话"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeThread();
                    }}>
                    是否删除沟通会话&nbsp;{removeInfo.title}&nbsp;?
                </Modal>
            )}
        </Card>
    );
}

export default observer(ForumThreadList);