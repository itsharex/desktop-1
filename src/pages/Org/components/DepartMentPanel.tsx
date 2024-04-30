//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { DepartMentInfo, DepartMentOrMember } from "@/api/org";
import { create_depart_ment, remove_depart_ment, update_depart_ment, move_depart_ment } from "@/api/org";
import { Button, Card, Divider, Form, Input, List, message, Modal, Popover, Space, Table, Tree } from "antd";
import { useStores } from "@/hooks";
import type { ColumnsType } from 'antd/lib/table';
import { EditText } from "@/components/EditCell/EditText";
import UserPhoto from "@/components/Portrait/UserPhoto";
import type { MemberInfo } from "@/api/org_mebmer";
import { remove_member, move_member } from "@/api/org_mebmer";
import { request } from "@/utils/request";
import { MoreOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import type { DataNode } from "antd/lib/tree";
import s from "./OrgTree.module.less";

interface SelectDepartMentModalProps {
    skipDepartMentIdList: string[];
    onCancel: () => void;
    onOk: (departMentId: string) => void;
}

const SelectDepartMentModal = observer((props: SelectDepartMentModalProps) => {
    const orgStore = useStores('orgStore');

    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);
    const [selectKey, setSelectKey] = useState("");

    const setupTreeNode = (nodeList: DataNode[], parentDepartMentId: string) => {
        //处理下属部门
        for (const departMent of orgStore.departMentList) {
            if (departMent.parent_depart_ment_id != parentDepartMentId) {
                continue;
            }
            if (props.skipDepartMentIdList.includes(departMent.depart_ment_id)) {
                continue;
            }
            const subNode: DataNode = {
                key: departMent.depart_ment_id,
                title: departMent.depart_ment_name,
                children: [],
                selectable: true,
            }
            nodeList.push(subNode);
            setupTreeNode(subNode.children!, departMent.depart_ment_id);
        }

    }

    const initTree = async () => {
        const tmpNodeList = [] as DataNode[];
        setupTreeNode(tmpNodeList, "");
        setTreeNodeList([{
            key: "",
            title: "总部门",
            children: tmpNodeList,
            checkable: false,
            selectable: true,
        }]);
    };

    useEffect(() => {
        initTree();
    }, [orgStore.departMentList, orgStore.memberList]);

    return (
        <Modal open title="选择部门"
            className={s.treeWrap}
            okText="选择" okButtonProps={{ disabled: props.skipDepartMentIdList.includes(selectKey) }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onOk(selectKey);
            }}>
            <Tree expandedKeys={["", ...orgStore.departMentList.map(item => item.depart_ment_id)]}
                selectedKeys={[selectKey]} treeData={treeNodeList} showIcon
                onSelect={keys => {
                    const tmpList = keys.filter(key => key != selectKey);
                    if (tmpList.length > 0) {
                        setSelectKey(tmpList[0] as string);
                    }
                }} />
        </Modal>
    );
});

interface CreateDepartMentModalProps {
    parentDepartMentId: string;
    onClose: () => void;
}

const CreateDepartMentModal = (props: CreateDepartMentModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [name, setName] = useState("");

    const createDepartMent = async () => {
        const res = await request(create_depart_ment({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            parent_depart_ment_id: props.parentDepartMentId,
            depart_ment_name: name,
        }));
        await orgStore.onUpdateDepartMent(orgStore.curOrgId, res.depart_ment_id);
        if (props.parentDepartMentId != "") {
            await orgStore.onUpdateDepartMent(orgStore.curOrgId, props.parentDepartMentId);
        }
        message.info("创建成功");
        props.onClose();
    };

    return (
        <Modal open title="创建部门"
            okText="创建" okButtonProps={{ disabled: name == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createDepartMent();
            }}>
            <Form>
                <Form.Item label="部门名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value.trim());
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export interface DepartMentPanelProps {
    curDepartMent?: DepartMentInfo;
    onSelect: (newItem: DepartMentOrMember) => void;
}

const DepartMentPanel = (props: DepartMentPanelProps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [removeDepartMentInfo, setRemoveDepartMentInfo] = useState<DepartMentInfo | null>(null);
    const [removeMemberInfo, setRemoveMemberInfo] = useState<MemberInfo | null>(null);
    const [moveDepartMentInfo, setMoveDepartMentInfo] = useState<DepartMentInfo | null>(null);
    const [moveMemberInfo, setMoveMemberInfo] = useState<MemberInfo | null>(null);

    const checkSelectAble = (myMember: MemberInfo | undefined, targetMember: MemberInfo): boolean => {
        if (myMember == undefined) {
            return false
        }
        if (myMember.member_user_id == orgStore.curOrg?.owner_user_id) {
            return true;
        }
        if (myMember.depart_ment_id_path.length > targetMember.depart_ment_id_path.length) {
            return false;
        }
        for (const item of myMember.depart_ment_id_path.entries()) {
            if (item[1] != targetMember.depart_ment_id_path[item[0]]) {
                return false;
            }
        }
        return true;
    }

    const removeDepartMent = async () => {
        if (removeDepartMentInfo == null) {
            return;
        }
        await request(remove_depart_ment({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            depart_ment_id: removeDepartMentInfo.depart_ment_id,
        }));
        await orgStore.onRemoveDepartMent(orgStore.curOrgId, removeDepartMentInfo.depart_ment_id);
        if (removeDepartMentInfo.parent_depart_ment_id != "") {
            await orgStore.onRemoveDepartMent(orgStore.curOrgId, removeDepartMentInfo.parent_depart_ment_id);
        }
        setRemoveDepartMentInfo(null);
        message.info("删除成功");
    };

    const removeMember = async () => {
        if (removeMemberInfo == null) {
            return;
        }
        await request(remove_member({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: removeMemberInfo.member_user_id,
        }));
        await orgStore.onLeave(orgStore.curOrgId, removeMemberInfo.member_user_id, history);
        if (removeMemberInfo.parent_depart_ment_id != "") {
            await orgStore.onRemoveDepartMent(orgStore.curOrgId, removeMemberInfo.parent_depart_ment_id);
        }
        setRemoveMemberInfo(null);
        message.info("删除成功");
    };

    const moveDepartMent = async (destDepartMentId: string) => {
        if (moveDepartMentInfo == null) {
            return;
        }
        await request(move_depart_ment({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            depart_ment_id: moveDepartMentInfo.depart_ment_id,
            parent_depart_ment_id: destDepartMentId,
        }));
        await orgStore.onUpdateDepartMent(orgStore.curOrgId, moveDepartMentInfo.depart_ment_id);
        if (moveDepartMentInfo.parent_depart_ment_id != "") {
            await orgStore.onUpdateDepartMent(orgStore.curOrgId, moveDepartMentInfo.parent_depart_ment_id);
        }
        if (destDepartMentId != "") {
            await orgStore.onUpdateDepartMent(orgStore.curOrgId, destDepartMentId);
        }
        setMoveDepartMentInfo(null);
        message.info("移动成功");
    }

    const moveMember = async (destDepartMentId: string) => {
        if (moveMemberInfo == null) {
            return;
        }
        await request(move_member({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: moveMemberInfo.member_user_id,
            parent_depart_ment_id: destDepartMentId
        }));
        await orgStore.onUpdateMember(orgStore.curOrgId, moveMemberInfo.member_user_id);
        if (moveMemberInfo.parent_depart_ment_id != "") {
            await orgStore.onUpdateDepartMent(orgStore.curOrgId, moveMemberInfo.parent_depart_ment_id);
        }
        if (destDepartMentId != "") {
            await orgStore.onUpdateDepartMent(orgStore.curOrgId, destDepartMentId);
        }
        setMoveMemberInfo(null);
        message.info("移动成功");
    }

    const departMentColumns: ColumnsType<DepartMentInfo> = [
        {
            title: "名称",
            render: (_, row: DepartMentInfo) => (
                <EditText editable={userStore.userInfo.userId == orgStore.curOrg?.owner_user_id && row.depart_ment_id != orgStore.curOrg?.new_member_depart_ment_id}
                    content={row.depart_ment_name} showEditIcon
                    onChange={async (value) => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            await request(update_depart_ment({
                                session_id: userStore.sessionId,
                                org_id: orgStore.curOrgId,
                                depart_ment_id: row.depart_ment_id,
                                depart_ment_name: value.trim(),
                            }));
                            await orgStore.onUpdateDepartMent(orgStore.curOrgId, row.depart_ment_id);
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }}
                    onClick={() => {
                        props.onSelect({
                            type: "departMent",
                            id: row.depart_ment_id,
                            value: row,
                        });
                    }}
                />
            ),
        },
        {
            title: "下级部门数量",
            dataIndex: "sub_depart_ment_count",
            width: 100,
        },
        {
            title: "下属成员数量",
            dataIndex: "sub_member_count",
            width: 100,
        },
        {
            title: "操作",
            width: 150,
            render: (_, row: DepartMentInfo) => (
                <Space size="large">
                    <Button type="link" disabled={!(userStore.userInfo.userId == orgStore.curOrg?.owner_user_id && row.depart_ment_id != orgStore.curOrg?.new_member_depart_ment_id)}
                        style={{ minWidth: 0, padding: "0px 0px" }} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setMoveDepartMentInfo(row);
                        }}>移动</Button>
                    <Button type="link" disabled={!(userStore.userInfo.userId == orgStore.curOrg?.owner_user_id && row.depart_ment_id != orgStore.curOrg?.new_member_depart_ment_id && row.sub_depart_ment_count == 0 && row.sub_member_count == 0)}
                        style={{ minWidth: 0, padding: "0px 0px" }}
                        danger onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoveDepartMentInfo(row);
                        }}>删除</Button>
                </Space>
            ),
        }
    ];


    return (
        <Card title={props.curDepartMent?.depart_ment_name ?? "总部门"}
            headStyle={{ backgroundColor: "#eee", fontWeight: 600 }} bordered={false}
            bodyStyle={{ height: "calc(100vh - 100px)", overflowY: "scroll", padding: "0px 10px" }}
            extra={
                <>
                    {userStore.userInfo.userId == orgStore.curOrg?.owner_user_id && props.curDepartMent?.depart_ment_id != orgStore.curOrg?.new_member_depart_ment_id && (
                        <Button type="primary" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowCreateModal(true);
                        }}>创建部门</Button>
                    )}
                </>
            }>
            <Divider orientation="left" style={{ fontWeight: 600 }}>下级部门</Divider>
            <Table rowKey="depart_ment_id" dataSource={orgStore.departMentList.filter(item => item.parent_depart_ment_id == (props.curDepartMent?.depart_ment_id ?? ""))}
                columns={departMentColumns} pagination={false} />
            <Divider orientation="left" style={{ fontWeight: 600 }}>部门成员</Divider>
            <List rowKey="member_user_id" dataSource={orgStore.memberList.filter(item => item.parent_depart_ment_id == (props.curDepartMent?.depart_ment_id ?? ""))}
                pagination={false} grid={{ gutter: 16 }} renderItem={member => (
                    <List.Item style={{ border: "1px solid #e4e4e8", padding: "0px 10px" }}>
                        <Space size="small">
                            <UserPhoto logoUri={member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                            <Button type="link" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                props.onSelect({
                                    type: "member",
                                    id: member.member_user_id,
                                    value: member,
                                });
                            }} disabled={!(checkSelectAble(orgStore.memberList.find(item => item.member_user_id == userStore.userInfo.userId), member))}
                                style={{ minWidth: 0, padding: "0px 0px" }}>
                                {member.display_name}
                            </Button>
                            <Popover trigger="click" placement="bottom" content={
                                <Space style={{ padding: "10px 10px" }} direction="vertical">
                                    <Button type="link" disabled={userStore.userInfo.userId != orgStore.curOrg?.owner_user_id}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setMoveMemberInfo(member);
                                        }}>移动</Button>
                                    <Button type="link" disabled={userStore.userInfo.userId != orgStore.curOrg?.owner_user_id || member.member_user_id == orgStore.curOrg?.owner_user_id} danger
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setRemoveMemberInfo(member);
                                        }}>删除</Button>
                                </Space>
                            }>
                                <MoreOutlined />
                            </Popover>
                        </Space>

                    </List.Item>
                )
                } />
            {
                showCreateModal == true && (
                    <CreateDepartMentModal parentDepartMentId={props.curDepartMent?.depart_ment_id ?? ""} onClose={() => setShowCreateModal(false)} />
                )
            }
            {
                removeDepartMentInfo != null && (
                    <Modal open title="删除部门"
                        okText="删除" okButtonProps={{ danger: true }}
                        onCancel={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoveDepartMentInfo(null);
                        }}
                        onOk={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeDepartMent();
                        }}>
                        是否删除部门&nbsp;{removeDepartMentInfo.depart_ment_name}&nbsp;?
                    </Modal>
                )
            }
            {removeMemberInfo != null && (
                <Modal open title="删除成员"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveMemberInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeMember();
                    }}>
                    是否删除成员&nbsp;{removeMemberInfo.display_name}&nbsp;?
                </Modal>
            )}
            {moveDepartMentInfo != null && (
                <SelectDepartMentModal skipDepartMentIdList={[moveDepartMentInfo.parent_depart_ment_id, moveDepartMentInfo.depart_ment_id, orgStore.curOrg?.new_member_depart_ment_id ?? ""]}
                    onCancel={() => setMoveDepartMentInfo(null)}
                    onOk={departMentId => moveDepartMent(departMentId)} />
            )}
            {moveMemberInfo != null && (
                <SelectDepartMentModal skipDepartMentIdList={[moveMemberInfo.parent_depart_ment_id, orgStore.curOrg?.new_member_depart_ment_id ?? ""]}
                    onCancel={() => setMoveMemberInfo(null)}
                    onOk={departMentId => moveMember(departMentId)} />
            )}
        </Card >
    );
};

export default observer(DepartMentPanel);