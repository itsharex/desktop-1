//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Modal, Tree } from "antd";
import type { DataNode } from "antd/lib/tree";
import { list_all_folder, type FolderPathItem } from "@/api/project_entry";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";

export interface MoveToFolderModalProps {
    skipFolderId?: string; //忽略的目录
    onCancel: () => void;
    onOk: (folderId: string) => void;
}

const MoveToFolderModal = (props: MoveToFolderModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);
    const [folderList, setFolderList] = useState<FolderPathItem[]>([]);

    const setupTreeNode = (pathItemList: FolderPathItem[], nodeList: DataNode[], parentFolderId: string) => {
        for (const pathItem of pathItemList) {
            if (pathItem.parent_folder_id != parentFolderId) {
                continue;
            }
            if (pathItem.folder_id == props.skipFolderId) {
                continue;
            }
            const subNode: DataNode = {
                key: pathItem.folder_id,
                title: pathItem.folder_title,
                children: [],
            };
            nodeList.push(subNode);
            setupTreeNode(pathItemList, subNode.children!, pathItem.folder_id);
        }
    };

    const initTree = async () => {
        const res = await request(list_all_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        setFolderList(res.item_list);
        const tmpNodeList = [] as DataNode[];
        setupTreeNode(res.item_list, tmpNodeList, "");
        setTreeNodeList([{
            key: "",
            title: "根目录",
            children: tmpNodeList,
        }]);
    };

    useEffect(() => {
        initTree();
    }, []);

    return (
        <Modal open title="移动到目录"
            bodyStyle={{ height: "calc(100vh - 400px)", overflowY: "scroll" }}
            footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            >
            {treeNodeList.length > 0 && (
                <Tree.DirectoryTree treeData={treeNodeList} expandedKeys={["", ...(folderList.map(item => item.folder_id))]} onSelect={keys => {
                    if (keys.length == 1) {
                        props.onOk(keys[0] as string);
                    }
                }} style={{fontSize:"16px"}}/>
            )}
        </Modal>
    );
};

export default observer(MoveToFolderModal);