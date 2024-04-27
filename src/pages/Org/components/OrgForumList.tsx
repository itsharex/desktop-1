//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Form, Input, InputNumber, List, message, Modal, Popover, Space } from "antd";
import { useStores } from "@/hooks";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import type { OrgForumInfo } from "@/api/org_forum";
import { create_forum, list_forum, update_forum, remove_forum } from "@/api/org_forum";
import { request } from "@/utils/request";


interface EditForumModalProps {
    forumInfo?: OrgForumInfo;
    onCancel: () => void;
    onOk: () => void;
}

const EditForumModal = observer((props: EditForumModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [name, setName] = useState(props.forumInfo?.forum_name ?? "");
    const [weight, setWeight] = useState(props.forumInfo?.weight ?? 0);

    const createForum = async () => {
        await request(create_forum({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_name: name,
            weight: weight,
        }));
        message.info("创建成功");
        props.onOk();
    };

    const updateForum = async () => {
        if (props.forumInfo == undefined) {
            return;
        }
        await request(update_forum({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: props.forumInfo.forum_id,
            forum_name: name,
            weight: weight,
        }));
        message.info("修改成功");
        props.onOk();
    };

    return (
        <Modal open title={`${props.forumInfo == undefined ? "创建" : "修改"}讨论组`}
            okText={props.forumInfo == undefined ? "创建" : "修改"} okButtonProps={{ disabled: name == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (props.forumInfo == undefined) {
                    createForum();
                } else {
                    updateForum();
                }
            }}>
            <Form>
                <Form.Item label="名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="权重">
                    <InputNumber value={weight} onChange={value => setWeight(value ?? 0)} controls={false} precision={0} min={0} max={99} />
                </Form.Item>
            </Form>
        </Modal>
    );
});


export interface OrgForumListProps {
    curOrgForumId: string;
    onChange: (newForumInfo: OrgForumInfo | null) => void;
}

const OrgForumList = (props: OrgForumListProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [forumList, setForumList] = useState<OrgForumInfo[]>([]);
    const [updateForumInfo, setUpdateForumInfo] = useState<OrgForumInfo | null>(null);
    const [removeForumInfo, setRemoveForumInfo] = useState<OrgForumInfo | null>(null);

    const loadForumList = async () => {
        const res = await request(list_forum({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
        }));
        setForumList(res.forum_list);
    };

    const removeForum = async () => {
        if (removeForumInfo == null) {
            return;
        }
        await request(remove_forum({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_id: removeForumInfo.forum_id,
        }));

        if (removeForumInfo.forum_id == props.curOrgForumId) {
            props.onChange(null);
        }
        await loadForumList();
        setRemoveForumInfo(null);
        message.info("删除成功");
    };

    useEffect(() => {
        if (orgStore.curOrgId == "") {
            setForumList([]);
        } else {
            loadForumList();
        }
    }, [orgStore.curOrgId]);

    return (
        <Card title="讨论组" bordered={false} bodyStyle={{ overflowY: "scroll", height: "160px" }}
            headStyle={{ backgroundColor: "#eee", fontWeight: 600 }}
            extra={<>
                {orgStore.curOrg != undefined && userStore.userInfo.userId == orgStore.curOrg.owner_user_id && (
                    <Button type="link" icon={<PlusOutlined />} title="创建讨论组"
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowCreateModal(true);
                        }} />
                )}
            </>}>
            <List rowKey="forum_id" dataSource={forumList} pagination={false}
                renderItem={item => (
                    <List.Item
                        extra={
                            <>
                                {orgStore.curOrg?.owner_user_id == userStore.userInfo.userId && (
                                    <Popover trigger="click" placement="right" content={
                                        <Space direction="vertical">
                                            <Button type="link" onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setUpdateForumInfo(item);
                                            }}>修改</Button>
                                            <Button type="link" danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setRemoveForumInfo(item);
                                            }}>删除</Button>
                                        </Space>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                )}
                            </>
                        }>
                        <Button type="link" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            props.onChange(item);
                        }} style={{ backgroundColor: item.forum_id == props.curOrgForumId ? "#a3dcff" : undefined, width: "240px", textAlign: "left" }}>{item.forum_name}</Button>
                    </List.Item>
                )} />
            {showCreateModal == true && (
                <EditForumModal onCancel={() => setShowCreateModal(false)} onOk={() => {
                    setShowCreateModal(false);
                    loadForumList();
                }} />
            )}
            {updateForumInfo != null && (
                <EditForumModal forumInfo={updateForumInfo} onCancel={() => setUpdateForumInfo(null)} onOk={() => {
                    setUpdateForumInfo(null);
                    loadForumList();
                }} />
            )}
            {removeForumInfo != null && (
                <Modal open title="删除讨论组"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveForumInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeForum();
                    }}>
                    是否删除讨论组&nbsp;{removeForumInfo.forum_name}&nbsp;?
                    <br />
                    <span style={{ color: "red" }}>所有帖子都将被删除，并且不可恢复！！</span>
                </Modal>
            )}
        </Card>
    );
};

export default observer(OrgForumList);