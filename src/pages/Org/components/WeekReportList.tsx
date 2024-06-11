//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import type { DayReportInfo, WeekReportInfo } from "@/api/org_report";
import { useStores } from "@/hooks";
import { Button, Card, DatePicker, List, Modal, Popover, Space } from "antd";
import { Moment } from "moment";
import moment from "moment";
import { ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { add_week_report, update_week_report, list_week_report, get_week_report, remove_week_report, list_day_report } from "@/api/org_report";
import { request } from "@/utils/request";
import { observer } from 'mobx-react';
import { MoreOutlined } from "@ant-design/icons";

const PAGE_SIZE = 10;

interface SimpleDayReportListProps {
    fromTime: Moment;
    toTime: Moment;
}

const SimpleDayReportList = (props: SimpleDayReportListProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [reportList, setReportList] = useState<DayReportInfo[]>([]);

    const loadReportList = async () => {
        const res = await request(list_day_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: userStore.userInfo.userId,
            list_param: {
                filter_by_day_time: true,
                from_day_time: props.fromTime.startOf("day").valueOf(),
                to_day_time: props.toTime.endOf("day").valueOf(),
            },
            offset: 0,
            limit: 99,
        }));
        setReportList(res.report_list);
    };

    useEffect(() => {
        loadReportList();
    }, [props.fromTime, props.toTime]);

    return (
        <Card title={<span style={{ fontSize: "16px", fontWeight: 600 }}>参考日报</span>} style={{ width: "400px", marginTop: "-13px" }} bordered={false}
            bodyStyle={{ height: "286px", overflowY: "scroll" }}>
            <List rowKey="report_id" dataSource={reportList} pagination={false} renderItem={reportItem => (
                <Card title={`${moment(reportItem.basic_info.day_time).format("YYYY-MM-DD")}`} style={{ width: "100%", marginBottom: "10px" }} headStyle={{ backgroundColor: "#eee" }}>
                    <ReadOnlyEditor content={reportItem.basic_info.content} />
                </Card>
            )} />
        </Card>
    )
};

interface EditModalProps {
    reportInfo?: WeekReportInfo;
    onCancel: () => void;
    onOk: () => void;
}

export const EditModal = (props: EditModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [fromTime, setFromTime] = useState<Moment | null>(props.reportInfo == undefined ? null : moment(props.reportInfo.basic_info.from_time));
    const [toTime, setToTime] = useState<Moment | null>(props.reportInfo == undefined ? null : moment(props.reportInfo.basic_info.to_time));


    const { editor, editorRef } = useCommonEditor({
        content: props.reportInfo?.basic_info.content ?? "",
        fsId: "",
        ownerType: FILE_OWNER_TYPE_NONE,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: false,
        widgetInToolbar: false,
        showReminder: false,
        pubResInToolbar: false,
    });

    const createReport = async () => {
        if (fromTime == null || toTime == null) {
            return;
        }
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        await request(add_week_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            basic_info: {
                from_time: fromTime.startOf("day").valueOf(),
                to_time: toTime.endOf("day").valueOf(),
                content: JSON.stringify(content),
            },
        }));
        props.onOk();
    };

    const updateReport = async () => {
        if (fromTime == null || toTime == null) {
            return;
        }
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        await request(update_week_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            report_id: props.reportInfo?.report_id ?? "",
            basic_info: {
                from_time: fromTime.startOf("day").valueOf(),
                to_time: toTime.endOf("day").valueOf(),
                content: JSON.stringify(content),
            },
        }));
        props.onOk();
    };

    return (
        <Modal open title={
            <Space>
                周报
                <DatePicker.RangePicker value={[fromTime, toTime]} onChange={values => {
                    if (values != null && values.length == 2) {
                        setFromTime(values[0]);
                        setToTime(values[1]);
                    }
                }} popupStyle={{ zIndex: 8000 }}
                    disabled={props.reportInfo != undefined}
                    disabledDate={date => (date.valueOf() < moment().add(-14, "days").valueOf()) || (date.valueOf() > moment().add(1, "days").valueOf())} />
            </Space>
        }
            okText={props.reportInfo == undefined ? "创建" : "修改"}
            okButtonProps={{ disabled: fromTime == null || toTime == null }}
            width={1000}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                if (props.reportInfo == undefined) {
                    createReport();
                } else {
                    updateReport();
                }
            }}>
            <div style={{ display: "flex" }}>
                <div className="_orgReportContext" style={{ flex: 1 }}>
                    {editor}
                </div>
                {fromTime != null && toTime != null && (
                    <SimpleDayReportList fromTime={fromTime} toTime={toTime} />
                )}
            </div>
        </Modal>
    );
};


export interface WeekReportListProps {
    memberUserId: string;
    dataVersion: number;
}

const WeekReportList = (props: WeekReportListProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [reportList, setReportList] = useState<WeekReportInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [updateReportInfo, setUpdateReportInfo] = useState<WeekReportInfo | null>(null);
    const [removeReportInfo, setRemoveReportInfo] = useState<WeekReportInfo | null>(null);

    const loadReportList = async () => {
        const res = await request(list_week_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: props.memberUserId,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setReportList(res.report_list);
    };

    const onUpdate = async (reportId: string) => {
        const res = await request(get_week_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            report_id: reportId,
        }));
        const tmpList = reportList.slice();
        const index = tmpList.findIndex(item => item.report_id == reportId);
        if (index != -1) {
            tmpList[index] = res.report;
            setReportList(tmpList);
        }
    };

    const removeReport = async () => {
        if (removeReportInfo == null) {
            return;
        }
        await request(remove_week_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            report_id: removeReportInfo.report_id,
        }));
        const tmpList = reportList.filter(item => item.report_id != removeReportInfo.report_id);
        setReportList(tmpList);
        setRemoveReportInfo(null);
    };

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        } else {
            if (orgStore.curOrgId != "") {
                loadReportList();
            }
        }
    }, [props.memberUserId, props.dataVersion, orgStore.curOrgId]);

    useEffect(() => {
        if (orgStore.curOrgId != "") {
            loadReportList();
        }
    }, [curPage]);

    return (
        <>
            <List rowKey="report_id" dataSource={reportList} renderItem={reportItem => (
                <List.Item style={{ border: "none" }}>
                    <Card style={{ width: "100%" }} headStyle={{ backgroundColor: "#eee" }}
                        title={`${moment(reportItem.basic_info.from_time).format("YYYY-MM-DD")}至${moment(reportItem.basic_info.to_time).format("YYYY-MM-DD")}`}
                        extra={
                            <Space>
                                {reportItem.user_perm.can_update && (
                                    <Button type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setUpdateReportInfo(reportItem);
                                    }}>修改</Button>
                                )}
                                {reportItem.user_perm.can_remove && (
                                    <Popover trigger="click" placement="bottom" content={
                                        <div style={{ padding: "10px 10px" }}>
                                            <Button type="link" danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setRemoveReportInfo(reportItem);
                                            }}>删除</Button>
                                        </div>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                )}
                            </Space>
                        }>
                        <ReadOnlyEditor content={reportItem.basic_info.content} />
                    </Card>
                </List.Item>
            )} pagination={{ current: curPage + 1, total: totalCount, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }} />
            {updateReportInfo != null && (
                <EditModal reportInfo={updateReportInfo} onCancel={() => setUpdateReportInfo(null)} onOk={() => {
                    onUpdate(updateReportInfo.report_id);
                    setUpdateReportInfo(null);
                }} />
            )}
            {removeReportInfo != null && (
                <Modal open title="删除周报"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveReportInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeReport();
                    }}>
                    是否删除周报?
                </Modal>
            )}
        </>
    );
};

export default observer(WeekReportList);