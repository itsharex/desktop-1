//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import type { IdeaInStore } from "@/api/idea_store";
import { Card, Form, Modal, Popover, Select, Space, message } from "antd";
import { AdminPermInfo, get_admin_session } from "@/api/admin_auth";
import Button from "@/components/Button";
import { ReadOnlyEditor } from "@/components/Editor";
import { MoreOutlined } from "@ant-design/icons";
import { remove_idea, move_idea } from "@/api/idea_store_admin";
import { request } from "@/utils/request";
import StoreListModal from "./StoreListModal";
import UpdateIdeaModal from "./UpdateIdeaModal";

export interface IdeaCardProps {
    idea: IdeaInStore;
    permInfo: AdminPermInfo;
    onChange: () => void;
    onRemove: () => void;
}

const IdeaCard = (props: IdeaCardProps) => {
    const [keywordList, setKeywordList] = useState(props.idea.basic_info.keyword_list);

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

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

    useEffect(() => {
        setKeywordList(props.idea.basic_info.keyword_list);
    }, [props.idea.basic_info.keyword_list]);

    return (
        <Card title={
            <Form layout="inline">
                <Form.Item label="标题">
                    {props.idea.basic_info.title}
                </Form.Item>
            </Form>
        } style={{ width: "100%" }}
            extra={
                <Space>
                    <Button type="link" disabled={!(props.permInfo.idea_store_perm.update_idea)}
                        style={{ minWidth: 0, padding: "0px 0px" }}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowUpdateModal(true);
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
                </Space>
            }>
            <Form labelCol={{ span: 1 }}>
                <Form.Item label="关键词">
                    <Select mode="tags" value={keywordList} onChange={value => setKeywordList((value as string[]).map(item => item.toLowerCase()))}
                        placement="topLeft" placeholder="请设置知识点相关的关键词" disabled />
                </Form.Item>
                <Form.Item label="内容">
                    <ReadOnlyEditor content={props.idea.basic_info.content} />
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
            {showUpdateModal == true && (
                <UpdateIdeaModal idea={props.idea} onCancel={() => setShowUpdateModal(false)}
                    onOk={() => {
                        setShowUpdateModal(false);
                        props.onChange();
                    }} />
            )}
        </Card>
    );
};

export default IdeaCard;