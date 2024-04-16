import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Space, Tree } from "antd";
import { useStores } from "@/hooks";
import type { DataNode } from "antd/lib/tree";
import { CheckOutlined, FileOutlined, FolderOutlined } from "@ant-design/icons";
import s from "./SkillTree.module.less";


const SkillTree = () => {
    const skillCenterStore = useStores('skillCenterStore');

    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);

    const setupTreeNode = (nodeList: DataNode[], parentFolderId: string) => {
        for (const folderInfo of skillCenterStore.folderList) {
            if (folderInfo.parent_folder_id != parentFolderId) {
                continue;
            }
            const subNode: DataNode = {
                key: folderInfo.folder_id,
                title: folderInfo.folder_name,
                children: [],
                switcherIcon: () => "",
                icon: <FolderOutlined />,
                selectable: false,
                checkable: false,
                disabled: true,
            }
            nodeList.push(subNode);
            setupTreeNode(subNode.children!, folderInfo.folder_id);
        }
        for (const pointInfo of skillCenterStore.pointList) {
            if (pointInfo.parent_folder_id != parentFolderId) {
                continue;
            }
            const subNode: DataNode = {
                key: pointInfo.point_id,
                title: (
                    <Space>
                        {pointInfo.point_name}
                        {pointInfo.has_learn == true && <CheckOutlined style={{ color: "green" }} />}
                    </Space>
                ),
                children: [],
                switcherIcon: () => "",
                icon: <FileOutlined />,
                selectable: true,
                checkable: false,
            }
            nodeList.push(subNode);
        }
    }

    const initTree = async () => {
        const tmpNodeList = [] as DataNode[];
        setupTreeNode(tmpNodeList, "");
        setTreeNodeList(tmpNodeList);

        const folderIdList = skillCenterStore.folderList.map(item => item.folder_id);
        setExpandedKeys(["", ...folderIdList]);
    };

    useEffect(() => {
        if (skillCenterStore.curCateId == "") {
            setTreeNodeList([]);
        } else {
            initTree();
        }
    }, [skillCenterStore.curCateId, skillCenterStore.folderList, skillCenterStore.pointList]);


    return (
        <div className={s.treeWrap}>
            <Tree.DirectoryTree expandedKeys={expandedKeys} treeData={treeNodeList} showIcon
                style={{ fontSize: "16px" }}
                selectedKeys={skillCenterStore.curPointId == "" ? [] : [skillCenterStore.curPointId]}
                onSelect={keys => {
                    if (keys.length > 0) {
                        skillCenterStore.curPointId = (keys[0] as string);
                    }
                }} />
        </div>
    );
};

export default observer(SkillTree);