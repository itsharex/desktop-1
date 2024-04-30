//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Modal, Tree } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import type { DataNode } from "antd/lib/tree";
import { list_all_folder, list_all_case, link_sprit } from "@/api/project_testcase";
import { request } from "@/utils/request";
import { FileOutlined, FolderOutlined } from "@ant-design/icons";

interface SimpleFolderOrCase {
    id: string;
    title: string;
    isFolder: boolean;
    parentFolderId: string;
}

export interface AddTestCaseModalProps {
    checkedKeys: string[];
    onClose: () => void;
}

const AddTestCaseModal = (props: AddTestCaseModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);
    const [checkedKeys, setCheckedKeys] = useState(props.checkedKeys);

    const setupTreeNode = (pathItemList: SimpleFolderOrCase[], nodeList: DataNode[], parentFolderId: string) => {
        for (const pathItem of pathItemList) {
            if (pathItem.parentFolderId != parentFolderId) {
                continue;
            }
            const subNode: DataNode = {
                key: pathItem.id,
                title: pathItem.title,
                children: [],
                checkable: pathItem.isFolder == false,
                icon: pathItem.isFolder ? <FolderOutlined /> : <FileOutlined />,
                disabled: props.checkedKeys.includes(pathItem.id),
            };
            nodeList.push(subNode);
            if (pathItem.isFolder) {
                setupTreeNode(pathItemList, subNode.children!, pathItem.id);
            }
        }
    }


    const initTree = async () => {
        const folderRes = await request(list_all_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        const caseRes = await request(list_all_case({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        const folderOrCaseList = [] as SimpleFolderOrCase[];
        for (const info of folderRes.folder_list) {
            folderOrCaseList.push({
                id: info.folder_id,
                title: info.title,
                isFolder: true,
                parentFolderId: info.parent_folder_id,
            });
        }
        for (const info of caseRes.case_list) {
            folderOrCaseList.push({
                id: info.case_id,
                title: info.title,
                isFolder: false,
                parentFolderId: info.parent_folder_id,
            });
        }
        const tmpNodeList = [] as DataNode[];
        setupTreeNode(folderOrCaseList, tmpNodeList, "");
        setTreeNodeList([{
            key: "",
            title: "根目录",
            children: tmpNodeList,
            checkable: false,
            icon: <FolderOutlined />,
        }]);
    };

    const linkSprit = async () => {
        if (entryStore.curEntry == null) {
            return;
        }
        const curCaseIdList = props.checkedKeys;
        for (const caseId of checkedKeys) {
            if (curCaseIdList.includes(caseId)) {
                continue;
            }
            try {
                await request(link_sprit({
                    session_id: userStore.sessionId,
                    project_id: projectStore.curProjectId,
                    case_id: caseId,
                    sprit_id: entryStore.curEntry.entry_id,
                }));
            } catch (e) {
                console.log(e);
            }
        }
        props.onClose();
    };

    useEffect(() => {
        initTree();
    }, []);

    return (
        <Modal open title="选择测试用例" bodyStyle={{ height: "calc(100vh - 300px)", overflowY: "scroll" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onClose();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                linkSprit();
            }}>
            <Tree treeData={treeNodeList} selectable={false} checkable showIcon
                checkedKeys={checkedKeys} onCheck={keys => {
                    if (Array.isArray(keys) == false) {
                        return;
                    }
                    setCheckedKeys(keys as string[]);
                }} />
        </Modal>
    );
};

export default observer(AddTestCaseModal);