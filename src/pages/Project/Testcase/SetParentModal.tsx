import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Modal, Tree } from "antd";
import { useStores } from "@/hooks";
import type { DataNode } from "antd/lib/tree";
import type { SimpleFolderInfo } from "@/api/project_testcase";
import { list_all_folder, set_case_parent, set_folder_parent } from "@/api/project_testcase";
import { request } from "@/utils/request";

export interface SetParentModalProps {
    dataType: "folder" | "case";
    dataId: string;
    onCancel: () => void;
    onOk: () => void;
}

const SetParentModal = (props: SetParentModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);
    const [selectKey, setSelectkey] = useState<string | null>(null);

    const setupTreeNode = (pathItemList: SimpleFolderInfo[], nodeList: DataNode[], parentFolderId: string) => {
        for (const pathItem of pathItemList) {
            if (pathItem.parent_folder_id != parentFolderId) {
                continue;
            }
            if (props.dataType == "folder" && props.dataId == pathItem.folder_id) {
                continue;
            }
            const subNode: DataNode = {
                key: pathItem.folder_id,
                title: pathItem.title,
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
        const tmpNodeList = [] as DataNode[];
        setupTreeNode(res.folder_list, tmpNodeList, "");
        setTreeNodeList([{
            key: "",
            title: "根目录",
            children: tmpNodeList,
        }]);
    };

    const setParentFolder = async () => {
        if (selectKey == null) {
            return;
        }
        if (props.dataType == "folder") {
            await request(set_folder_parent({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                folder_id: props.dataId,
                parent_folder_id: selectKey,
            }));
        } else if (props.dataType == "case") {
            await request(set_case_parent({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                case_id: props.dataId,
                parent_folder_id: selectKey,
            }));
        }
        props.onOk();
    };

    useEffect(() => {
        initTree();
    }, []);

    return (
        <Modal open title="移动到目录"
            bodyStyle={{ height: "calc(100vh - 400px)", overflowY: "scroll" }}
            okText="移动" okButtonProps={{ disabled: selectKey == null }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                setParentFolder();
            }}
        >
            <Tree treeData={treeNodeList} defaultExpandAll={true} onSelect={keys => {
                if (keys.length == 1) {
                    setSelectkey(keys[0] as string);
                }
            }} />
        </Modal>
    )
};

export default observer(SetParentModal);