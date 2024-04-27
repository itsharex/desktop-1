//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { LearnRecordInfo } from "@/api/skill_learn";
import type { LearnSummaryItem } from "@/api/skill_learn";
import { get_my_learn_summary, list_my_learn_record, get_my_learn_record, remove_learn_record } from "@/api/skill_learn";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import SkillSummaryTag from "@/components/Skill/SkillSummaryTag";
import { Button, Card, List, message, Modal, Popover, Space } from "antd";
import moment from "moment";
import { ReadOnlyEditor } from "@/components/Editor";
import { MoreOutlined } from "@ant-design/icons";
import EditLearnRecordModal from "@/pages/SkillCenter/components/EditLearnRecordModal";


const PAGE_SIZE = 10;

const MyLearnRecordList = () => {
    const userStore = useStores("userStore");

    const [recordList, setRecordList] = useState<LearnRecordInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [updateRecordInfo, setUpdateRecordInfo] = useState<LearnRecordInfo | null>(null);
    const [removeRecordInfo, setRemoveRecordInfo] = useState<LearnRecordInfo | null>(null);

    const [summaryItemList, setSummaryItemList] = useState<LearnSummaryItem[]>([]);

    const loadSummaryItemList = async () => {
        const res = await request(get_my_learn_summary({
            session_id: userStore.sessionId,
        }));
        setSummaryItemList(res.summary_info.item_list);
    };

    const loadRecordList = async () => {
        const res = await request(list_my_learn_record({
            session_id: userStore.sessionId,
            offset: PAGE_SIZE * curPage,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setRecordList(res.record_list);
    };

    const onUpdateRecord = async (cateId: string, pointId: string) => {
        const tmpList = recordList.slice();
        const index = tmpList.findIndex(item => (item.cate_id == cateId && item.point_id == pointId));
        if (index == -1) {
            return;
        }
        const res = await request(get_my_learn_record({
            session_id: userStore.sessionId,
            cate_id: cateId,
            point_id: pointId,
        }));
        tmpList[index] = res.record_info;
        setRecordList(tmpList);
    };

    const removeRecord = async () => {
        if (removeRecordInfo == null) {
            return;
        }
        await request(remove_learn_record({
            session_id: userStore.sessionId,
            cate_id: removeRecordInfo.cate_id,
            point_id: removeRecordInfo.point_id,
        }));
        await loadRecordList();
        await loadSummaryItemList();
        setRemoveRecordInfo(null);
        message.info("删除成功");
    };

    useEffect(() => {
        loadSummaryItemList();
    }, []);

    useEffect(() => {
        loadRecordList();
    }, [curPage]);

    return (
        <div style={{ height: "calc(100vh - 225px)", overflowY: "scroll", width: "100%" }}>
            <div style={{ width: "100%", display: "flex" }}>
                {summaryItemList.map(item => (
                    <SkillSummaryTag key={item.cate_id} summaryItem={item} />
                ))}
            </div>
            <List rowKey="point_id" dataSource={recordList}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
                renderItem={item => (
                    <List.Item>
                        <Card title={`在${moment(item.create_time).format("YYYY-MM-DD HH:mm")}花费${item.learn_hour}小时学会${item.cate_name}:${item.full_point_name}`}
                            style={{ width: "100%" }} bordered={false} headStyle={{ backgroundColor: "#eee" }} bodyStyle={{ padding: item.my_learned_len == 0 ? "0px 0px" : undefined }}
                            extra={
                                <Popover trigger="click" placement="bottom" content={
                                    <Space direction="vertical">
                                        <Button type="link" onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setUpdateRecordInfo(item);
                                        }}>修改学习记录</Button>
                                        <Button type="link" danger onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setRemoveRecordInfo(item);
                                        }}>删除学习记录</Button>
                                    </Space>
                                }>
                                    <MoreOutlined />
                                </Popover>
                            }>
                            {item.my_learned_len > 0 && (
                                <>
                                    <h1 style={{ fontSize: "16px", fontWeight: 700 }}>学习心得</h1>
                                    <ReadOnlyEditor content={item.my_learned_content} />
                                </>
                            )}
                        </Card>
                    </List.Item>
                )} />
            {updateRecordInfo != null && (
                <EditLearnRecordModal cateId={updateRecordInfo.cate_id} pointId={updateRecordInfo.point_id} update={true}
                    onCancel={() => setUpdateRecordInfo(null)}
                    onOk={() => {
                        onUpdateRecord(updateRecordInfo.cate_id, updateRecordInfo.point_id);
                        setUpdateRecordInfo(null);
                    }} />
            )}
            {removeRecordInfo != null && (
                <Modal open title="删除学习记录"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveRecordInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeRecord();
                    }}>
                    是否删除学习记录&nbsp;{removeRecordInfo.cate_name}:{removeRecordInfo.full_point_name}&nbsp;?
                </Modal>
            )}
        </div>
    );
};

export default observer(MyLearnRecordList);