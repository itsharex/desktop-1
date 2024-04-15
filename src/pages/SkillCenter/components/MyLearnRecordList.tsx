import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Form, List, message, Modal, Popover, Space } from "antd";
import { useStores } from "@/hooks";
import type { LearnRecordInfo } from "@/api/skill_learn";
import { list_my_learn_record, get_my_learn_record, remove_learn_record } from "@/api/skill_learn";
import { request } from "@/utils/request";
import moment from "moment";
import { ReadOnlyEditor } from "@/components/Editor";
import EditLearnRecordModal from "./EditLearnRecordModal";
import { MoreOutlined } from "@ant-design/icons";

const PAGE_SIZE = 12;

const MyLearnRecordList = () => {
    const userStore = useStores("userStore");

    const [recordList, setRecordList] = useState<LearnRecordInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [updateRecordInfo, setUpdateRecordInfo] = useState<LearnRecordInfo | null>(null);
    const [removeRecordInfo, setRemoveRecordInfo] = useState<LearnRecordInfo | null>(null);

    const loadRecordList = async () => {
        const res = await request(list_my_learn_record({
            session_id: userStore.sessionId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setRecordList(res.record_list);
    };

    const onUpdateRecord = async () => {
        if (updateRecordInfo == null) {
            return;
        }
        const tmpList = recordList.slice();
        const index = tmpList.findIndex(item => item.point_id == updateRecordInfo.point_id);
        if (index == -1) {
            return;
        }
        const res = await request(get_my_learn_record({
            session_id: userStore.sessionId,
            cate_id: updateRecordInfo.cate_id,
            point_id: updateRecordInfo.point_id,
        }));
        tmpList[index] = res.record_info;
        setRecordList(tmpList);
        setUpdateRecordInfo(null);
        message.info("修改成功");
    };

    const removeLearnRecord = async () => {
        if (removeRecordInfo == null) {
            return;
        }
        await request(remove_learn_record({
            session_id: userStore.sessionId,
            cate_id: removeRecordInfo.cate_id,
            point_id: removeRecordInfo.point_id,
        }));
        await userStore.updateLearnState(userStore.sessionId);
        setRemoveRecordInfo(null);
        message.info("删除学习记录成功");
        await loadRecordList();
    };

    useEffect(() => {
        loadRecordList();
    }, [curPage]);

    return (
        <>
            <List rowKey="point_id" dataSource={recordList} grid={{ gutter: 16 }}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
                renderItem={item => (
                    <List.Item>
                        <Card title={`${item.cate_name}:${item.full_point_name}`} style={{ width: "400px" }} bodyStyle={{ height: "200px", overflowY: "scroll" }}
                            headStyle={{ backgroundColor: "#eee" }}
                            extra={
                                <Space>
                                    <Button type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setUpdateRecordInfo(item);
                                    }}>修改</Button>
                                    <Popover trigger="click" placement="bottom" content={
                                        <div>
                                            <Button type="link" danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setRemoveRecordInfo(item);
                                            }}>删除</Button>
                                        </div>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                </Space>
                            }>
                            <Form>
                                <Form.Item label="学习时间">
                                    {moment(item.create_time).format("YYYY-MM-DD HH:mm")}({item.learn_hour}小时)
                                </Form.Item>
                                <Form.Item label="点赞人数">
                                    {item.vote_count}
                                </Form.Item>
                            </Form>
                            {item.learn_material_len > 0 && (
                                <>
                                    <h1 style={{ fontSize: "16px", fontWeight: 700 }}>学习材料</h1>
                                    <ReadOnlyEditor content={item.learn_material_content} />
                                </>
                            )}
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
                <EditLearnRecordModal cateId={updateRecordInfo.cate_id} pointId={updateRecordInfo.point_id}
                    update onCancel={() => setUpdateRecordInfo(null)}
                    onOk={() => onUpdateRecord()} />
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
                        removeLearnRecord();
                    }}>
                    是否删除学习记录{removeRecordInfo.cate_name}:{removeRecordInfo.full_point_name}?
                </Modal>
            )}
        </>
    );
};

export default observer(MyLearnRecordList);