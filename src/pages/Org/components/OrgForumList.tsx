//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Checkbox, Form, Input, InputNumber, List, message, Modal, Popover, Select, Space } from "antd";
import { useStores } from "@/hooks";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import type { OrgForumInfo } from "@/api/org_forum";
import { create_forum, list_forum, update_forum, remove_forum } from "@/api/org_forum";
import type { MemberInfo } from "@/api/org_mebmer";
import { list_member } from "@/api/org_mebmer";
import { request } from "@/utils/request";
import UserPhoto from "@/components/Portrait/UserPhoto";


interface EditForumModalProps {
    forumInfo?: OrgForumInfo;
    onCancel: () => void;
    onOk: () => void;
}

const EditForumModal = observer((props: EditForumModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [memberList, setMemberList] = useState<MemberInfo[]>([]);

    const [name, setName] = useState(props.forumInfo?.forum_name ?? "");
    const [weight, setWeight] = useState(props.forumInfo?.weight ?? 0);
    const [allowCreateForAll, setAllowCreateForAll] = useState(props.forumInfo?.org_forum_perm?.allow_create_thread_for_all ?? true);
    const [createUserIdList, setCreateUserIdList] = useState(props.forumInfo?.org_forum_perm?.create_thread_user_id_list ?? []);
    const [allowReplyForAll, setAllowReplyForAll] = useState(props.forumInfo?.org_forum_perm?.allow_reply_thread_for_all ?? true);
    const [replyUserIdList, setReplyUserIdList] = useState(props.forumInfo?.org_forum_perm?.reply_thread_user_id_list ?? []);

    const loadMemberList = async () => {
        const res = await request(list_member({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
        }));
        setMemberList(res.member_list);
    };

    const createForum = async () => {
        await request(create_forum({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            forum_name: name,
            weight: weight,
            org_forum_perm: {
                allow_create_thread_for_all: allowCreateForAll,
                create_thread_user_id_list: allowCreateForAll ? [] : createUserIdList,
                allow_reply_thread_for_all: allowReplyForAll,
                reply_thread_user_id_list: allowReplyForAll ? [] : replyUserIdList,
            },
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
            org_forum_perm: {
                allow_create_thread_for_all: allowCreateForAll,
                create_thread_user_id_list: allowCreateForAll ? [] : createUserIdList,
                allow_reply_thread_for_all: allowReplyForAll,
                reply_thread_user_id_list: allowReplyForAll ? [] : replyUserIdList,
            },
        }));
        message.info("修改成功");
        props.onOk();
    };

    useEffect(() => {
        loadMemberList();
    }, []);

    return (
        <Modal open title={`${props.forumInfo == undefined ? "创建" : "修改"}讨论组`}
            width={600}
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
            <Form labelCol={{ span: 4 }}>
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
                <Form.Item label="全体成员可发帖">
                    <Checkbox checked={allowCreateForAll} onChange={e => {
                        e.stopPropagation();
                        setAllowCreateForAll(e.target.checked);
                    }} />
                </Form.Item>
                {allowCreateForAll == false && (
                    <Form.Item label="可发帖成员">
                        <Select mode="multiple" showSearch value={createUserIdList} onChange={value => setCreateUserIdList(value)}
                            filterOption={(value, option) => (option?.name ?? "").includes(value)}>
                            {memberList.map(member => (
                                <Select.Option key={member.member_user_id} value={member.member_user_id} name={member.display_name}>
                                    <Space>
                                        <UserPhoto logoUri={member.logo_uri} style={{ width: "16px", height: "16px", borderRadius: "8px" }} />
                                        {member.display_name}
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                <Form.Item label="全体成员可回帖">
                    <Checkbox checked={allowReplyForAll} onChange={e => {
                        e.stopPropagation();
                        setAllowReplyForAll(e.target.checked);
                    }} />
                </Form.Item>
                {allowReplyForAll == false && (
                    <Form.Item label="可回帖成员">
                        <Select mode="multiple" showSearch value={replyUserIdList} onChange={value => setReplyUserIdList(value)}
                            filterOption={(value, option) => (option?.name ?? "").includes(value)}>
                            {memberList.map(member => (
                                <Select.Option key={member.member_user_id} value={member.member_user_id} name={member.display_name}>
                                    <Space>
                                        <UserPhoto logoUri={member.logo_uri} style={{ width: "16px", height: "16px", borderRadius: "8px" }} />
                                        {member.display_name}
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
});


export interface OrgForumListProps {
    curOrgForumId: string;
    onChange: (newForumInfo: OrgForumInfo | null) => void;
}

const OrgForumList = (props: OrgForumListProps) => {
    const appStore = useStores('appStore');
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
        if (props.curOrgForumId != "") {
            const index = res.forum_list.findIndex(item => item.forum_id == props.curOrgForumId);
            if (index != -1) {
                props.onChange(res.forum_list[index]);
            }
        }
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
                    <Popover placement='bottom' overlayClassName="global_help"
                        open={appStore.showHelp}
                        content="创建团队讨论组" >
                        <Button type="link" icon={<PlusOutlined />} title="创建讨论组"
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowCreateModal(true);
                            }} />
                    </Popover>
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