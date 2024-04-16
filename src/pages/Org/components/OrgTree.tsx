import React, { useEffect, useState } from "react";
import type { DepartMentOrMember } from "@/api/org";
import { observer } from 'mobx-react';
import { Button, Card, Space, Tree } from "antd";
import type { DataNode } from "antd/lib/tree";
import { useStores } from "@/hooks";
import { TeamOutlined, UserAddOutlined } from "@ant-design/icons";
import UserPhoto from "@/components/Portrait/UserPhoto";
import type { MemberInfo } from "@/api/org_mebmer";
import s from "./OrgTree.module.less";

export interface OrgTreeProps {
    curItem: DepartMentOrMember,
    onChange: (newItem: DepartMentOrMember) => void;
}

const OrgTree = (props: OrgTreeProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);

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

    const setupTreeNode = (nodeList: DataNode[], parentDepartMentId: string) => {
        //处理下属部门
        for (const departMent of orgStore.departMentList) {
            if (departMent.parent_depart_ment_id != parentDepartMentId) {
                continue;
            }
            const subNode: DataNode = {
                key: departMent.depart_ment_id,
                title: departMent.depart_ment_name,
                children: [],
                switcherIcon: () => "",
                icon: <TeamOutlined />,
                selectable: true,
            }
            nodeList.push(subNode);
            setupTreeNode(subNode.children!, departMent.depart_ment_id);
        }
        //处理下属成员
        for (const member of orgStore.memberList) {
            if (member.parent_depart_ment_id != parentDepartMentId) {
                continue;
            }
            const subNode: DataNode = {
                key: member.member_user_id,
                title: (
                    <Space>
                        <UserPhoto logoUri={member.logo_uri} style={{ width: "16px", borderRadius: "10px", backgroundColor: "white" }} />
                        {member.display_name}
                    </Space>
                ),
                disabled: !checkSelectAble(orgStore.memberList.find(item => item.member_user_id == userStore.userInfo.userId), member),
            };
            nodeList.push(subNode);
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
            switcherIcon: () => "",
            icon: <TeamOutlined />,
        }]);
    };

    useEffect(() => {
        initTree();
    }, [orgStore.departMentList, orgStore.memberList]);

    return (
        <Card bordered={false} title={`团队:${orgStore.curOrg?.basic_info.org_name}`}
            headStyle={{ fontWeight: 600, backgroundColor: "#eee" }}
            className={s.treeWrap}
            extra={
                <>
                    {userStore.userInfo.userId == orgStore.curOrg?.owner_user_id && (
                        <Button type="primary" icon={<UserAddOutlined />} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            orgStore.showInviteMember = true;
                        }}>邀请</Button>
                    )}
                </>
            }
            bodyStyle={{ overflowY: "scroll", height: "calc(100vh - 310px)" }}>
            <Tree expandedKeys={["", ...orgStore.departMentList.map(item => item.depart_ment_id)]}
                selectedKeys={[props.curItem.id]} treeData={treeNodeList} showIcon
                onSelect={keys => {
                    const tmpList = keys.filter(key => key != props.curItem.id);
                    if (tmpList.length > 0) {
                        const key = tmpList[0];
                        if (key == "") {
                            props.onChange({
                                type: "departMent",
                                id: "",
                                value: undefined,
                            });
                            return;
                        }
                        const departMent = orgStore.departMentList.find(item => item.depart_ment_id == key);
                        if (departMent !== undefined) {
                            props.onChange({
                                type: "departMent",
                                id: departMent.depart_ment_id,
                                value: departMent,
                            });
                            return;
                        }
                        const member = orgStore.memberList.find(item => item.member_user_id == key);
                        if (member !== undefined) {
                            props.onChange({
                                type: "member",
                                id: member.member_user_id,
                                value: member,
                            });
                        }
                    }
                }} />
        </Card>
    );
};

export default observer(OrgTree);