//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from "@/components/CardWrap";
import Button from "@/components/Button";
import { useStores } from "@/hooks";
import { Modal, Popover, Space, Tabs, message } from "antd";
import type { Tab } from "rc-tabs/lib/interface";
import type { IdeaGroup } from "@/api/project_idea";
import { clear_group, list_group, remove_group } from "@/api/project_idea";
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import CreateOrImportGroupModal from "./components/CreateOrImportGroupModal";
import { request } from "@/utils/request";
import { EditOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import UpdateGroupModal from "./components/UpdateGroupModal";
import ContentPanel from "./components/ContentPanel";

const IdeaPage = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const ideaStore = useStores('ideaStore');

    const [groupList, setGroupList] = useState([] as IdeaGroup[]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editGroupId, setEditGroupId] = useState("");
    const [showClearModal, setShowClearModal] = useState(false);

    const loadGroupList = async () => {
        const res = await request(list_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        if (ideaStore.curIdeaGroupId != "") {
            if (res.group_list.find(item => item.idea_group_id == ideaStore.curIdeaGroupId) == undefined) {
                ideaStore.curIdeaGroupId = "";
            }
        }
        setGroupList(res.group_list);
    };

    const removeGroup = async (groupId: string) => {
        await request(remove_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_group_id: groupId,
        }));
        message.info("删除知识点分组成功");
    };

    const clearGroup = async () => {
        if (ideaStore.curIdeaGroupId == "") {
            return;
        }
        await request(clear_group({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            idea_group_id: ideaStore.curIdeaGroupId,
        }));
        setShowClearModal(false);
    };

    const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
        if (action == "add") {
            setShowAddModal(true);
        } else if (action == "remove") {
            removeGroup(targetKey as string);
        }
    };

    const calcTabItems = (): Tab[] => {
        const items: Tab[] = [
            {
                key: "",
                label: <span style={{ fontSize: "16px", fontWeight: 600 }}>全部知识点</span>,
                closable: false,
                children: <ContentPanel groupList={groupList} />,
            }
        ];
        for (const group of groupList) {
            items.push({
                key: group.idea_group_id,
                label: (
                    <Space size="small">
                        <div style={{ fontSize: "16px", fontWeight: 600, width: "80px", overflow: "hidden", textAlign: "left", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.name}</div>
                        {group.idea_group_id != (projectStore.curProject?.default_idea_group_id ?? "") && (
                            <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} icon={<EditOutlined />} disabled={!projectStore.isAdmin}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setEditGroupId(group.idea_group_id);
                                }} />
                        )}
                    </Space>
                ),
                closable: (group.idea_group_id != (projectStore.curProject?.default_idea_group_id ?? "") && group.idea_count == 0 && projectStore.isAdmin),
                children: <ContentPanel groupList={groupList} />,
            });
        }
        return items;
    };

    useEffect(() => {
        loadGroupList();
    }, [projectStore.curProjectId]);

    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            const notice = ev.payload;
            if (notice.IdeaNotice?.CreateGroupNotice !== undefined && notice.IdeaNotice.CreateGroupNotice.project_id == projectStore.curProjectId) {
                loadGroupList();
            } else if (notice.IdeaNotice?.UpdateGroupNotice !== undefined && notice.IdeaNotice.UpdateGroupNotice.project_id == projectStore.curProjectId) {
                loadGroupList();
            } else if (notice.IdeaNotice?.RemoveGroupNotice !== undefined && notice.IdeaNotice.RemoveGroupNotice.project_id == projectStore.curProjectId) {
                loadGroupList();
            }
        });
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, []);

    return (
        <ErrorBoundary>
            <CardWrap title="项目知识点" extra={
                <Space size="middle">
                    <Button
                        disabled={projectStore.isClosed}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            ideaStore.setShowCreateIdea("", "");
                        }}>创建知识点</Button>
                    {ideaStore.curIdeaGroupId != "" && (
                        <Popover trigger="click" placement="bottom" content={
                            <Space direction="vertical" style={{ padding: "10px 10px" }}>
                                <Button type="link" danger disabled={!(projectStore.isAdmin && projectStore.isClosed == false)}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowClearModal(true);
                                    }}>清空分组</Button>
                            </Space>
                        }>
                            <MoreOutlined />
                        </Popover>
                    )}

                </Space>}>
                <Tabs type="editable-card" activeKey={ideaStore.curIdeaGroupId} onChange={key => {
                    ideaStore.curIdeaGroupId = key;
                    ideaStore.searchKeywords = [];
                    ideaStore.curIdeaId = "";
                }} onEdit={onEdit}
                    tabBarStyle={{ width: "160px" }}
                    style={{ height: "calc(100vh - 150px)", overflowY: "scroll" }}
                    items={calcTabItems()} tabPosition="left" addIcon={
                        <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} icon={<PlusOutlined />}>创建分组</Button>
                    } />
                {showAddModal == true && (
                    <CreateOrImportGroupModal onClose={() => setShowAddModal(false)} />
                )}
                {editGroupId != "" && (
                    <UpdateGroupModal ideaGroupId={editGroupId} onClose={() => setEditGroupId("")} />
                )}
                {showClearModal == true && (
                    <Modal open title="清空分组"
                        okText="清空" okButtonProps={{ danger: true }}
                        onCancel={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowClearModal(false);
                        }}
                        onOk={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            clearGroup();
                        }}>
                        <p>是否清除当前分组内所有知识点？</p>
                        <p>被清空的知识点会进入回收站。</p>
                    </Modal>
                )}
            </CardWrap>
        </ErrorBoundary>
    );
};

export default observer(IdeaPage);