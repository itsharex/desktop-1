//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from "@/components/CardWrap";
import { Button, Descriptions, Form, List, Modal, Popover, Select, Space, message } from "antd";
import type { RECYCLE_ITEM_TYPE, RecycleItemInfo } from "@/api/project_recycle";
import {
    RECYCLE_ITEM_ALL, RECYCLE_ITEM_API_COLL, RECYCLE_ITEM_BOARD, RECYCLE_ITEM_BUG, RECYCLE_ITEM_BULLETIN, RECYCLE_ITEM_DATA_ANNO, RECYCLE_ITEM_DOC, RECYCLE_ITEM_FILE,
    RECYCLE_ITEM_IDEA, RECYCLE_ITEM_PAGES, RECYCLE_ITEM_REQUIREMENT, RECYCLE_ITEM_SPRIT, RECYCLE_ITEM_TASK, RECYCLE_ITEM_TESTCASE, list as list_recycle_item,
    recover as recover_recycle_item, remove as remove_recycle_item
} from "@/api/project_recycle";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { LinkBugInfo, LinkEntryInfo, LinkIdeaPageInfo, LinkRequirementInfo, LinkTaskInfo, LinkTestCaseInfo } from "@/stores/linkAux";
import { MoreOutlined } from "@ant-design/icons";
import ClearModal from "./components/ClearModal";

const PAGE_SIZE = 20;

const RecycleItemList = () => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [itemType, setItemType] = useState(RECYCLE_ITEM_ALL);
    const [recycleItemList, setRecycleItemList] = useState([] as RecycleItemInfo[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [removeInfo, setRemoveInfo] = useState<RecycleItemInfo | null>(null);
    const [showClearModal, setShowClearModal] = useState(false);

    const loadRecycleItemList = async () => {
        const res = await request(list_recycle_item({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            filter_by_item_type: itemType != RECYCLE_ITEM_ALL,
            item_type: itemType,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setRecycleItemList(res.item_list);
    };

    const recoverRecycleItem = async (recycleItem: RecycleItemInfo) => {
        await request(recover_recycle_item({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            recycle_item_id: recycleItem.recycle_item_id,
        }));
        await loadRecycleItemList();
        message.info("恢复成功");
        if (recycleItem.recycle_item_type == RECYCLE_ITEM_IDEA) {
            linkAuxStore.goToLink(new LinkIdeaPageInfo("", projectStore.curProjectId, "",
                [" "], //特殊处理，为了显示modal 
                recycleItem.recycle_item_id, true), history);
        } else if (recycleItem.recycle_item_type == RECYCLE_ITEM_REQUIREMENT) {
            linkAuxStore.goToLink(new LinkRequirementInfo("", projectStore.curProjectId, recycleItem.recycle_item_id), history);
        } else if (recycleItem.recycle_item_type == RECYCLE_ITEM_TASK) {
            linkAuxStore.goToLink(new LinkTaskInfo("", projectStore.curProjectId, recycleItem.recycle_item_id), history);
        } else if (recycleItem.recycle_item_type == RECYCLE_ITEM_BUG) {
            linkAuxStore.goToLink(new LinkBugInfo("", projectStore.curProjectId, recycleItem.recycle_item_id), history);
        } else if (recycleItem.recycle_item_type == RECYCLE_ITEM_TESTCASE) {
            linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, recycleItem.recycle_item_id), history);
        } else if (recycleItem.recycle_item_type == RECYCLE_ITEM_BULLETIN) {
            projectStore.projectModal.bulletinId = recycleItem.recycle_item_id;
        } else {
            linkAuxStore.goToLink(new LinkEntryInfo("", projectStore.curProjectId, recycleItem.recycle_item_id), history);
        }
    };

    const removeRecycleItem = async () => {
        if (removeInfo == null) {
            return;
        }
        await request(remove_recycle_item({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            recycle_item_id: removeInfo.recycle_item_id,
        }));
        message.info("删除成功");
        await loadRecycleItemList();
        setRemoveInfo(null);
    };

    const getTypeName = (itemType: RECYCLE_ITEM_TYPE): string => {
        if (itemType == RECYCLE_ITEM_IDEA) {
            return "知识点";
        } else if (itemType == RECYCLE_ITEM_REQUIREMENT) {
            return "项目需求";
        } else if (itemType == RECYCLE_ITEM_TASK) {
            return "任务";
        } else if (itemType == RECYCLE_ITEM_BUG) {
            return "缺陷";
        } else if (itemType == RECYCLE_ITEM_TESTCASE) {
            return "测试用例";
        } else if (itemType == RECYCLE_ITEM_BULLETIN) {
            return "项目公告";
        } else if (itemType == RECYCLE_ITEM_SPRIT) {
            return "工作计划";
        } else if (itemType == RECYCLE_ITEM_DOC) {
            return "项目文档";
        } else if (itemType == RECYCLE_ITEM_PAGES) {
            return "静态页面";
        } else if (itemType == RECYCLE_ITEM_BOARD) {
            return "信息面板";
        } else if (itemType == RECYCLE_ITEM_FILE) {
            return "文件";
        } else if (itemType == RECYCLE_ITEM_API_COLL) {
            return "接口集合";
        } else if (itemType == RECYCLE_ITEM_DATA_ANNO) {
            return "数据标注";
        } else {
            return "";
        }
    }

    useEffect(() => {
        loadRecycleItemList();
    }, [curPage, itemType]);

    return (
        <CardWrap title="回收站" halfContent extra={
            <Space>
                <Form layout="inline">
                    <Form.Item label="过滤类型">
                        <Select style={{ width: "100px" }} value={itemType} onChange={value => {
                            setItemType(value);
                            setCurPage(0);
                        }}>
                            <Select.Option value={RECYCLE_ITEM_ALL}>全部类型</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_IDEA}>知识点</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_REQUIREMENT}>项目需求</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_TASK}>任务</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_BUG}>缺陷</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_TESTCASE}>测试用例</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_BULLETIN}>项目公告</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_SPRIT}>工作计划</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_DOC}>项目文档</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_PAGES}>静态网页</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_BOARD}>信息面板</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_FILE}>文件</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_API_COLL}>接口集合</Select.Option>
                            <Select.Option value={RECYCLE_ITEM_DATA_ANNO}>数据标注</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Popover trigger="click" placement="bottom" content={
                            <Space direction="vertical" style={{ padding: "10px 10px" }}>
                                <Button type="link" danger disabled={!(projectStore.isAdmin && projectStore.isClosed == false)}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowClearModal(true);
                                    }}>清空回收站</Button>
                            </Space>
                        }>
                            <MoreOutlined />
                        </Popover>
                    </Form.Item>
                </Form>
            </Space>
        }>
            <List rowKey="recycle_item_id" dataSource={recycleItemList}
                style={{ padding: "4px 10px" }}
                renderItem={item => (
                    <List.Item extra={
                        <Space>
                            <Button type="link" disabled={!(projectStore.isAdmin && (!projectStore.isClosed))} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                recoverRecycleItem(item);
                            }}>恢复</Button>
                            <Button type="link" danger disabled={!(projectStore.isAdmin && (!projectStore.isClosed))}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setRemoveInfo(item);
                                }}>删除</Button>
                        </Space>
                    }>
                        <Popover trigger="hover" placement="left" content={
                            <Descriptions bordered column={1} labelStyle={{ width: "90px" }}>
                                <Descriptions.Item label="删除人">
                                    <UserPhoto logoUri={item.remove_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                    &nbsp;{item.remove_display_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="删除时间">
                                    {moment(item.remove_time).format("YYYY-MM-DD HH:mm")}
                                </Descriptions.Item>
                            </Descriptions>
                        }>
                            {getTypeName(item.recycle_item_type)}:&nbsp;{item.title}
                        </Popover>
                    </List.Item>
                )}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true }} />
            {removeInfo != null && (
                <Modal open title={`删除 ${getTypeName(removeInfo.recycle_item_type)} ${removeInfo.title}`}
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeRecycleItem();
                    }}>
                    是否删除&nbsp;{getTypeName(removeInfo.recycle_item_type)}&nbsp;{removeInfo.title} &nbsp;?
                    <div style={{ color: "red" }}>删除后，数据将不可恢复！！</div>
                </Modal>
            )}
            {showClearModal == true && (
                <ClearModal onCancel={() => setShowClearModal(false)} onOk={() => {
                    if (curPage != 0) {
                        setCurPage(0);
                    } else {
                        loadRecycleItemList();
                    }
                    setShowClearModal(false);
                }} />
            )}
        </CardWrap>
    );
};

export default observer(RecycleItemList)