import React, { useEffect, useState } from "react";
import type { DepartMentOrMember } from "@/api/org";
import { observer } from 'mobx-react';
import { Button, Card, Space, Tree } from "antd";
import type { DataNode } from "antd/lib/tree";
import { useStores } from "@/hooks";
import { TeamOutlined, UserAddOutlined } from "@ant-design/icons";
import UserPhoto from "@/components/Portrait/UserPhoto";

export interface OrgTreeProps {
    curItem: DepartMentOrMember,
    onChange: (newItem: DepartMentOrMember) => void;
}

const OrgTree = (props: OrgTreeProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);

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
                icon: <TeamOutlined />,
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
            };
            nodeList.push(subNode);
        }
    }

    const initTree = async () => {
        const tmpNodeList = [] as DataNode[];
        setupTreeNode(tmpNodeList, "");
        setTreeNodeList([{
            key: "",
            title: "成员列表",
            children: tmpNodeList,
            checkable: false,
            selectable: false,
            icon: <TeamOutlined />,
        }]);
    };

    useEffect(() => {
        initTree();
    }, [orgStore.departMentList, orgStore.memberList]);

    return (
        <Card bordered={false} title={`团队:${orgStore.curOrg?.basic_info.org_name}`}
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
                selectedKeys={[props.curItem.id]} treeData={treeNodeList} showIcon />
        </Card>
    );
};

export default observer(OrgTree);