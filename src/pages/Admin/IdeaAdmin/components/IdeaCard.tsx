import React, { useState } from "react";
import type { IdeaInStore } from "@/api/project_idea";
import { Card, Form, Input, Modal, Popover, Select, Space, message } from "antd";
import { AdminPermInfo, get_admin_session } from "@/api/admin_auth";
import Button from "@/components/Button";
import { ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { MoreOutlined } from "@ant-design/icons";
import { update_idea, remove_idea, move_idea } from "@/api/project_idea_admin";
import { request } from "@/utils/request";
import StoreListModal from "./StoreListModal";

export interface IdeaCardProps {
    idea: IdeaInStore;
    permInfo: AdminPermInfo;
    onChange: () => void;
    onRemove: () => void;
}

const IdeaCard = (props: IdeaCardProps) => {
    const [inEdit, setInEdit] = useState(false);
    const [title, setTitle] = useState("");
    const [keywordList, setKeywordList] = useState([] as string[]);

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
    });

    const updateIdea = async () => {
        if (title.trim() == "" || keywordList.length == 0) {
            return;
        }
        const sessionId = await get_admin_session();
        const content = editorRef.current?.getContent() ?? {
            type: 'doc',
        };
        await request(update_idea({
            admin_session_id: sessionId,
            idea_id: props.idea.idea_id,
            basic_info: {
                title: title.trim(),
                content: JSON.stringify(content),
                keyword_list: keywordList,
            },
        }));
        setInEdit(false);
        props.onChange();
    };

    const removeIdea = async () => {
        const sessionId = await get_admin_session();
        await request(remove_idea({
            admin_session_id: sessionId,
            idea_id: props.idea.idea_id,
        }));
        setShowRemoveModal(false);
        props.onRemove();
        message.info("删除成功");
    };

    const moveIdea = async (newStoreId: string) => {
        const sessionId = await get_admin_session();
        await request(move_idea({
            admin_session_id: sessionId,
            idea_id: props.idea.idea_id,
            idea_store_id: newStoreId,
        }));
        setShowMoveModal(false);
        props.onRemove();
        message.info("移动成功");
    };

    return (
        <Card title={
            <Form layout="inline">
                <Form.Item label="标题">
                    {inEdit == false && props.idea.basic_info.title}
                    {inEdit == true && (
                        <Input value={title} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setTitle(e.target.value.trim());
                        }} style={{ width: "calc(100vw - 600px)" }} />
                    )}
                </Form.Item>
            </Form>
        } style={{ width: "100%" }}
            extra={
                <Space>
                    {inEdit == false && (
                        <>
                            <Button disabled={!(props.permInfo.idea_store_perm.update_idea)} onClick={e => {
                                e.stopPropagation();
                                setTitle(props.idea.basic_info.title);
                                setKeywordList(props.idea.basic_info.keyword_list);
                                const t = setInterval(() => {
                                    if (editorRef.current != null) {
                                        clearInterval(t);
                                        editorRef.current.setContent(props.idea.basic_info.content);
                                    }
                                }, 100);
                                setInEdit(true);
                            }}>编辑</Button>
                            <Popover placement="bottom" trigger="click" content={
                                <Space direction="vertical" size="small" style={{ padding: "10px 10px" }}>
                                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                                        disabled={!(props.permInfo.idea_store_perm.move_idea)}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setShowMoveModal(true);
                                        }}>移动</Button>
                                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                                        disabled={!(props.permInfo.idea_store_perm.remove_idea)}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setShowRemoveModal(true);
                                        }}>删除</Button>
                                </Space>
                            }>
                                <MoreOutlined />
                            </Popover>
                        </>
                    )}
                    {inEdit == true && (
                        <>
                            <Button type="default" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setInEdit(false);
                            }}>取消</Button>
                            <Button disabled={title == "" || keywordList.length == 0}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    updateIdea();
                                }}>保存</Button>
                        </>
                    )}
                </Space>
            }>
            <Form labelCol={{ span: 1 }}>
                <Form.Item label="关键词">
                    <Select mode="tags" value={keywordList} onChange={value => setKeywordList((value as string[]).map(item => item.toLowerCase()))}
                        placement="topLeft" placeholder="请设置知识点相关的关键词" disabled={!inEdit} />
                </Form.Item>
                <Form.Item label="内容">
                    {inEdit == false && (
                        <ReadOnlyEditor content={props.idea.basic_info.content} />
                    )}
                    {inEdit == true && (
                        <div className="_editChatContext">
                            {editor}
                        </div>
                    )}
                </Form.Item>
            </Form>
            {showRemoveModal == true && (
                <Modal open title="删除知识点"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeIdea();
                    }}>
                    是否删除知识点{props.idea.basic_info.title}?
                </Modal>
            )}
            {showMoveModal == true && (
                <StoreListModal disableStoreId={props.idea.idea_store_id}
                    onCancel={() => setShowMoveModal(false)}
                    onOk={newStoreId => moveIdea(newStoreId)} />
            )}
        </Card>
    );
};

export default IdeaCard;