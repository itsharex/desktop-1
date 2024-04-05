import React, { useEffect, useState } from "react";
import type { DayReportInfo } from "@/api/org_report";
import { useStores } from "@/hooks";
import { Button, Card, DatePicker, List, Modal, Popover, Space } from "antd";
import { Moment } from "moment";
import moment from "moment";
import { ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_NONE } from "@/api/fs";
import { add_day_report, update_day_report, list_day_report, get_day_report, remove_day_report } from "@/api/org_report";
import { request } from "@/utils/request";
import { observer } from 'mobx-react';
import { MoreOutlined } from "@ant-design/icons";

const PAGE_SIZE = 10;

interface EditModalProps {
    reportInfo?: DayReportInfo;
    onCancel: () => void;
    onOk: () => void;
}

export const EditModal = (props: EditModalProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [dayTime, setDayTime] = useState<Moment | null>(props.reportInfo == undefined ? null : moment(props.reportInfo.basic_info.day_time));

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
    });

    const createReport = async () => {
        if (dayTime == null) {
            return;
        }
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        await request(add_day_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            basic_info: {
                day_time: dayTime.startOf("day").valueOf(),
                content: JSON.stringify(content),
            },
        }));
        props.onOk();
    };

    const updateReport = async () => {
        if (dayTime == null) {
            return;
        }
        const content = editorRef.current?.getContent() ?? { type: "doc" };
        await request(update_day_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            report_id: props.reportInfo?.report_id ?? "",
            basic_info: {
                day_time: dayTime.startOf("day").valueOf(),
                content: JSON.stringify(content),
            },
        }));
        props.onOk();
    };

    return (
        <Modal open title={
            <Space>
                日报
                <DatePicker value={dayTime} onChange={value => setDayTime(value)} popupStyle={{ zIndex: 8000 }} />
            </Space>
        }
            okText={props.reportInfo == undefined ? "创建" : "修改"}
            okButtonProps={{ disabled: dayTime == null }}
            width={800}
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
            <div className="_editChatContext">
                {editor}
            </div>
        </Modal>
    );
};

export interface DayReportListProps {
    memberUserId: string;
    dataVersion: number;
}

const DayReportList = (props: DayReportListProps) => {
    const userStore = useStores('userStore');
    const orgStore = useStores('orgStore');

    const [reportList, setReportList] = useState<DayReportInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [updateReportInfo, setUpdateReportInfo] = useState<DayReportInfo | null>(null);
    const [removeReportInfo, setRemoveReportInfo] = useState<DayReportInfo | null>(null);

    const loadReportList = async () => {
        const res = await request(list_day_report({
            session_id: userStore.sessionId,
            org_id: orgStore.curOrgId,
            member_user_id: props.memberUserId,
            list_param: {
                filter_by_day_time: false,
                from_day_time: 0,
                to_day_time: 0,
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setReportList(res.report_list);
    };

    const onUpdate = async (reportId: string) => {
        const res = await request(get_day_report({
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
        await request(remove_day_report({
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
            loadReportList();
        }
    }, [props.memberUserId, props.dataVersion]);

    useEffect(() => {
        loadReportList();
    }, [curPage]);

    return (
        <>
            <List rowKey="report_id" dataSource={reportList} renderItem={reportItem => (
                <List.Item style={{ border: "none" }}>
                    <Card style={{ width: "100%" }} headStyle={{ backgroundColor: "#eee" }}
                        title={`${moment(reportItem.basic_info.day_time).format("YYYY-MM-DD")}`}
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
                <Modal open title="删除日报"
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
                    是否删除日报?
                </Modal>
            )}
        </>
    );
};

export default observer(DayReportList);