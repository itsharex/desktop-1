//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, Input, List, message, Modal, Popover, Space } from "antd";
import { observer } from 'mobx-react';
import type { OkrInfoWithId, OkrItemInfoWithId } from "@/api/org_okr";
import { list as list_okr, convert_okr_info, create as create_okr, remove as remove_okr, update as update_okr, get as get_okr } from "@/api/org_okr";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { uniqId } from "@/utils/utils";
import { MoreOutlined } from "@ant-design/icons";
import type { Moment } from "moment";
import moment from "moment";

const PAGE_SIZE = 10;

interface EditModalProps {
    okrInfo?: OkrInfoWithId;
    onCancel: () => void;
    onOk: () => void;
}

export const EditModal = (props: EditModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [okrItemList, setOkrItemList] = useState<OkrItemInfoWithId[]>(props.okrInfo?.okr_item_list ?? [{
        id: uniqId(),
        objective: "",
        key_result_list: [
            {
                id: uniqId(),
                key_result: "",
            }
        ],
    }]);

    const [startTime, setStartTime] = useState<Moment | null>(props.okrInfo == undefined ? null : moment(props.okrInfo.start_time));
    const [endTime, setEndTime] = useState<Moment | null>(props.okrInfo == undefined ? null : moment(props.okrInfo.end_time));

    const createOkr = async () => {
        if (startTime == null || endTime == null) {
            return;
        }
        await request(create_okr({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            okr_item_list: okrItemList.map(item => ({
                objective: item.objective,
                key_result_list: item.key_result_list.map(subItem => subItem.key_result),
            })),
            start_time: startTime.startOf("day").valueOf(),
            end_time: endTime.endOf("day").valueOf(),
        }));
        props.onOk();
        message.info("创建成功");
    };

    const updateOkr = async () => {
        if (props.okrInfo == undefined) {
            return;
        }
        if (startTime == null || endTime == null) {
            return;
        }
        await request(update_okr({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            okr_id: props.okrInfo.okr_id,
            okr_item_list: okrItemList.map(item => ({
                objective: item.objective,
                key_result_list: item.key_result_list.map(subItem => subItem.key_result),
            })),
            start_time: startTime.startOf("day").valueOf(),
            end_time: endTime.endOf("day").valueOf(),
        }));
        props.onOk();
        message.info("修改成功");
    };

    return (
        <Modal open title={props.okrInfo == undefined ? "创建OKR" : "修改OKR"}
            bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
            okText={props.okrInfo == undefined ? "创建" : "修改"} okButtonProps={{ disabled: startTime == null || endTime == null }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (props.okrInfo == undefined) {
                    createOkr();
                } else {
                    updateOkr();
                }
            }}>
            <Form>
                <Form.Item label="日期区间">
                    <DatePicker.RangePicker value={[startTime, endTime]} onChange={values => {
                        if (values != null && values.length == 2) {
                            setStartTime(values[0]);
                            setEndTime(values[1]);
                        }
                    }} popupStyle={{ zIndex: 10000 }} />
                </Form.Item>
            </Form>
            <List rowKey="id" dataSource={okrItemList} pagination={false}
                renderItem={(okrItem, okrIndex) => (
                    <List.Item style={{ border: "none" }}>
                        <Card bordered={true}
                            headStyle={{ backgroundColor: "#eee" }}
                            title={
                                <Space>
                                    目标{okrIndex + 1}
                                    <Input style={{ width: "260px", marginRight: "30px" }} value={okrItem.objective} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const tmpList = okrItemList.slice();
                                        tmpList[okrIndex].objective = e.target.value.trim();
                                        setOkrItemList(tmpList);
                                    }} placeholder="请输入目标" />
                                </Space>
                            }
                            extra={
                                <Space>
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const tmpList = okrItemList.slice();
                                        tmpList[okrIndex].key_result_list.push({
                                            id: uniqId(),
                                            key_result: "",
                                        });
                                        setOkrItemList(tmpList);
                                    }}>增加关键结果</Button>
                                    <Popover trigger="click" placement="bottom" content={
                                        <div style={{ padding: "10px 10px" }}>
                                            <Button type="link" danger disabled={okrItemList.length <= 1}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    const tmpList = okrItemList.filter(item => item.id != okrItem.id);
                                                    setOkrItemList(tmpList);
                                                }}>删除</Button>
                                        </div>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                </Space>
                            }>
                            <List rowKey="id" dataSource={okrItem.key_result_list} pagination={false}
                                renderItem={(krItem, krIndex) => (
                                    <List.Item style={{ border: "none" }} extra={
                                        <Popover trigger="click" placement="bottom" content={
                                            <div style={{ padding: "10px 10px" }}>
                                                <Button type="link" danger disabled={okrItem.key_result_list.length <= 1}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        const tmpList = okrItemList.slice();
                                                        tmpList[okrIndex].key_result_list = tmpList[okrIndex].key_result_list.filter(item => item.id != krItem.id);
                                                        setOkrItemList(tmpList);
                                                    }}>删除</Button>
                                            </div>
                                        }>
                                            <MoreOutlined />
                                        </Popover>
                                    }>
                                        <Space>
                                            关键结果 {krIndex + 1}
                                            <Input style={{ width: "360px" }} value={krItem.key_result} onChange={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                const tmpList = okrItemList.slice();
                                                tmpList[okrIndex].key_result_list[krIndex].key_result = e.target.value.trim();
                                                setOkrItemList(tmpList);
                                            }} placeholder="请输入关键结果" />
                                        </Space>
                                    </List.Item>
                                )} />
                        </Card>
                    </List.Item>
                )} />
            <Button type="primary" style={{ marginLeft: "10px" }} onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                const tmpList = okrItemList.slice();
                tmpList.push({
                    id: uniqId(),
                    objective: "",
                    key_result_list: [
                        {
                            id: uniqId(),
                            key_result: "",
                        }
                    ],
                });
                setOkrItemList(tmpList);
            }}>增加目标</Button>
        </Modal>
    );
}

interface OkrCardProps {
    okrInfo: OkrInfoWithId;
    onRemove: () => void;
    onUpdate: () => void;
}

const OkrCard = (props: OkrCardProps) => {
    const userStore = useStores('userStore');

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const removeOkr = async () => {
        await request(remove_okr({
            session_id: userStore.sessionId,
            org_id: props.okrInfo.org_id,
            okr_id: props.okrInfo.okr_id,
        }));
        setShowRemoveModal(false);
        props.onRemove();
    };

    return (
        <Card style={{ width: "100%" }} headStyle={{ backgroundColor: "#eee" }}
            title={`${moment(props.okrInfo.start_time).format("YYYY-MM-DD")}至${moment(props.okrInfo.end_time).format("YYYY-MM-DD")}`}
            extra={
                <>
                    {userStore.userInfo.userId == props.okrInfo.member_user_id && (
                        <Space>
                            <Button type="link" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowUpdateModal(true);
                            }}>修改</Button>
                            <Popover trigger="click" placement="bottom" content={
                                <div style={{ padding: "10px 10px" }}>
                                    <Button type="link" danger onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowRemoveModal(true);
                                    }}>删除</Button>
                                </div>
                            }>
                                <MoreOutlined />
                            </Popover>
                        </Space>
                    )}
                </>
            }>
            <List rowKey="id" dataSource={props.okrInfo.okr_item_list} grid={{ gutter: 16 }} renderItem={(okrItem, okrIndex) => (
                <List.Item>
                    <Card title={`目标${okrIndex + 1}:${okrItem.objective}`} style={{ width: "250px" }} headStyle={{ backgroundColor: "#eee" }}
                        bodyStyle={{ height: "150px", overflowY: "scroll", backgroundColor: "lightyellow" }}>
                        <List rowKey="id" dataSource={okrItem.key_result_list} renderItem={(krItem, krIndex) => (
                            <List.Item style={{ border: "none" }}>
                                关键结果{krIndex + 1}:{krItem.key_result}
                            </List.Item>
                        )} />
                    </Card>
                </List.Item>
            )} pagination={false} />
            {showUpdateModal == true && (
                <EditModal okrInfo={props.okrInfo} onCancel={() => setShowUpdateModal(false)} onOk={() => {
                    setShowUpdateModal(false);
                    props.onUpdate();
                }} />
            )}
            {showRemoveModal == true && (
                <Modal open title="删除OKR"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeOkr();
                    }}>
                    是否删除OKR?
                </Modal>
            )}
        </Card>
    );
}

export interface OkrListProps {
    memberUserId: string;
    dataVersion: number;
}

const OkrList = (props: OkrListProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [okrList, setOkrList] = useState([] as OkrInfoWithId[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadOkrList = async () => {
        const res = await request(list_okr({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: props.memberUserId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setOkrList(res.okr_list.map(item => convert_okr_info(item)));
    };

    const onUpdate = async (okrId: string) => {
        const tmpList = okrList.slice();
        const index = tmpList.findIndex(item => item.okr_id == okrId);
        if (index == -1) {
            return;
        }
        const res = await request(get_okr({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: props.memberUserId,
            okr_id: okrId,
        }));
        tmpList[index] = convert_okr_info(res.okr);
        setOkrList(tmpList);
    };

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadOkrList();
        }
    }, [props.memberUserId, props.dataVersion]);

    useEffect(() => {
        loadOkrList();
    }, [curPage]);

    return (
        <>
            <List rowKey="okr_id" dataSource={okrList} renderItem={okrItem => (
                <List.Item style={{ border: "none" }}>
                    <OkrCard okrInfo={okrItem} onRemove={() => loadOkrList()} onUpdate={() => onUpdate(okrItem.okr_id)} />
                </List.Item>
            )} pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }} />
        </>
    );
};

export default observer(OkrList);
