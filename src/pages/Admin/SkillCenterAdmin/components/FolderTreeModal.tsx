import React, { useEffect, useState } from "react";
import { Modal, Tree } from "antd";
import type { DataNode } from "antd/lib/tree";
import type { SkillFolderInfo } from "@/api/skill_center";
import { list_skill_folder } from "@/api/skill_center";
import { request } from "@/utils/request";
import { get_admin_session } from "@/api/admin_auth";
import { FolderOutlined } from "@ant-design/icons";


export interface FolderTreeModalProps {
    cateId: string;
    skipFolderId: string;
    onCancel: () => void;
    onOk: (newFolderId: string) => void
}

const FolderTreeModal = (props: FolderTreeModalProps) => {
    const [expandKeyList, setExpandKeyList] = useState<string[]>([]);
    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);


    const setupTreeNode = (nodeList: DataNode[], parentFolderId: string, folderInfoList: SkillFolderInfo[]) => {
        for (const folderInfo of folderInfoList) {
            if (folderInfo.parent_folder_id != parentFolderId) {
                continue;
            }
            if (folderInfo.folder_id == props.skipFolderId) {
                continue;
            }
            const subNode: DataNode = {
                key: folderInfo.folder_id,
                title: folderInfo.folder_name,
                children: [],
                icon: <FolderOutlined />,
                selectable: true,
            }
            nodeList.push(subNode);
            setupTreeNode(subNode.children!, folderInfo.folder_id, folderInfoList);
        }
    }

    const initTree = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_skill_folder({
            session_id: sessionId,
            cate_id: props.cateId,
            filter_by_parent_folder_id: false,
            parent_folder_id: "",
        }));

        const tmpNodeList = [] as DataNode[];
        setupTreeNode(tmpNodeList, "", res.folder_list);
        setTreeNodeList([{
            key: "",
            title: "根目录",
            children: tmpNodeList,
            checkable: false,
            selectable: true,
            icon: <FolderOutlined />,
        }]);

        const folderIdList = res.folder_list.map(item => item.folder_id);
        setExpandKeyList(["", ...folderIdList]);
    };

    useEffect(() => {
        initTree();
    }, []);

    return (
        <Modal open title="选择目录" footer={null}
            bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>

            <Tree expandedKeys={expandKeyList} treeData={treeNodeList} showIcon
                showLine
                onSelect={keys => {
                    if (keys.length > 0) {
                        props.onOk(keys[0] as string);
                    }
                }} />

        </Modal>
    );
}

export default FolderTreeModal;