//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, message, Modal, Popover, Space, Tree } from "antd";
import { useStores } from "@/hooks";
import type { DataNode } from "antd/lib/tree";
import { BulbTwoTone, MoreOutlined } from "@ant-design/icons";
import s from "./SkillTree.module.less";
import EditLearnRecordModal from "./EditLearnRecordModal";
import { request } from "@/utils/request";
import { remove_learn_record } from "@/api/skill_learn";

const SkillTree = () => {
    const userStore = useStores("userStore");
    const skillCenterStore = useStores('skillCenterStore');

    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const removeLearnRecord = async () => {
        await request(remove_learn_record({
            session_id: userStore.sessionId,
            cate_id: skillCenterStore.curCateId,
            point_id: skillCenterStore.curPointId,
        }));
        await skillCenterStore.onUpdatePoint(skillCenterStore.curPointId);
        await userStore.updateLearnState(userStore.sessionId);
        setShowRemoveModal(false);
        message.info("删除学习记录成功");
    };

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
                selectable: false,
                checkable: false,
                disabled: true,
            }
            nodeList.push(subNode);
            setupTreeNode(subNode.children!, folderInfo.folder_id);
        }
        const pointInfoList = skillCenterStore.pointList.filter(item => item.parent_folder_id == parentFolderId);
        if (pointInfoList.length == 0) {
            return;
        }
        nodeList.push({
            key: "pointOf:" + parentFolderId,
            title: (
                <span style={{ display: "inline-block" }}>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {pointInfoList.map(pointInfo => (
                            <Space key={pointInfo.point_id} style={{ backgroundColor: "#eee", padding: "0px 10px", margin: "0px 4px 4px 4px",borderRadius:"10px" }}>
                                <Button type="text" style={{ minWidth: 0, padding: "0px 0px" }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        skillCenterStore.curPointId = pointInfo.point_id;
                                        if (pointInfo.has_learn) {
                                            setShowUpdateModal(true);
                                        } else {
                                            setShowAddModal(true);
                                        }
                                    }} title={pointInfo.has_learn ? "查看学习记录" : "点亮技能"}>
                                    <Space>
                                        {pointInfo.point_name}
                                        {pointInfo.has_learn == true && (
                                            <BulbTwoTone twoToneColor={["orange", "orange"]} />
                                        )}
                                        {pointInfo.has_learn == false && (
                                            <BulbTwoTone twoToneColor={["gray", "white"]} />
                                        )}
                                    </Space>
                                </Button>
                                {pointInfo.has_learn == true && (
                                    <Popover trigger="click" placement="bottom" content={
                                        <div>
                                            <Button type="link" danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                skillCenterStore.curPointId = pointInfo.point_id;
                                                setShowRemoveModal(true);
                                            }}>删除学习记录</Button>
                                        </div>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                )}
                            </Space>
                        ))}
                    </div>
                </span>),
        });
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
            <Tree.DirectoryTree expandedKeys={expandedKeys} treeData={treeNodeList} showIcon={false}
                style={{ fontSize: "16px" }}
                selectedKeys={[]}
            />
            {showAddModal == true && skillCenterStore.curPointId != "" && (
                <EditLearnRecordModal cateId={skillCenterStore.curCateId} pointId={skillCenterStore.curPointId} update={false}
                    onCancel={() => setShowAddModal(false)} onOk={() => {
                        setShowAddModal(false);
                        skillCenterStore.onUpdatePoint(skillCenterStore.curPointId);
                    }} />
            )}
            {showUpdateModal == true && skillCenterStore.curPointId != "" && (
                <EditLearnRecordModal cateId={skillCenterStore.curCateId} pointId={skillCenterStore.curPointId} update={true}
                    onCancel={() => setShowUpdateModal(false)}
                    onOk={() => {
                        setShowUpdateModal(false);
                    }} />
            )}
            {showRemoveModal == true && skillCenterStore.curPointId != "" && (
                <Modal open title="删除学习记录"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeLearnRecord();
                    }}>
                    是否删除当前技能点&nbsp;{skillCenterStore.curPoint?.point_name ?? ""}&nbsp;的学习记录?
                </Modal>
            )}
        </div>
    );
};

export default observer(SkillTree);