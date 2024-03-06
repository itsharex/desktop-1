import React from "react";
import { observer } from 'mobx-react';
import { ENTRY_TYPE_SPRIT } from "@/api/project_entry";
import type { EntryInfo, EntryOrFolderInfo } from "@/api/project_entry";
import EntryListWrap, { PAGE_SIZE } from "./components/EntryListWrap";
import { Button, Space, Table, Tag } from "antd";
import type { ColumnsType } from 'antd/lib/table';
import { useStores } from "@/hooks";
import { useHistory } from "react-router-dom";
import { APP_PROJECT_WORK_PLAN_PATH } from "@/utils/constant";
import s from "./Card.module.less";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import EntryEditCol from "./components/EntryEditCol";

const WorkPlanList = () => {
    const history = useHistory();

    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const columns: ColumnsType<EntryOrFolderInfo> = [
        {
            title: "标题",
            width: 300,
            render: (_, row: EntryOrFolderInfo) => (
                <Space size="small">
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if ((row.value as EntryInfo).my_watch) {
                            entryStore.unwatchEntry(row.id);
                        } else {
                            entryStore.watchEntry(row.id);
                        }
                    }}>
                        <span className={(row.value as EntryInfo).my_watch ? s.isCollect : s.noCollect} />
                    </a>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px", fontWeight: 600 }} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        entryStore.curEntry = (row.value as EntryInfo);
                        history.push(APP_PROJECT_WORK_PLAN_PATH);
                    }} title={(row.value as EntryInfo).entry_title}>{(row.value as EntryInfo).entry_title}</Button>
                    <EntryEditCol entryInfo={row.value as EntryInfo}/>
                </Space>
            ),
        },
        {
            title: "标签",
            width: 200,
            render: (_, row: EntryOrFolderInfo) => (
                <Space style={{ flexWrap: "wrap" }} size="small">
                    {(row.value as EntryInfo).tag_list.map(tag => (
                        <Tag key={tag.tag_id} style={{ backgroundColor: tag.bg_color }}>{tag.tag_name}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: "开始时间",
            width: 100,
            render: (_, row: EntryOrFolderInfo) => moment((row.value as EntryInfo).extra_info.ExtraSpritInfo?.start_time ?? 0).format("YYYY-MM-DD"),
        },
        {
            title: "结束时间",
            width: 100,
            render: (_, row: EntryOrFolderInfo) => moment((row.value as EntryInfo).extra_info.ExtraSpritInfo?.end_time ?? 0).format("YYYY-MM-DD"),
        },
        {
            title: "非工作日",
            width: 200,
            render: (_, row: EntryOrFolderInfo) => (
                <Space style={{ flexWrap: "wrap" }} size="small">
                    {(row.value as EntryInfo).extra_info.ExtraSpritInfo?.non_work_day_list.map(day => (
                        <Tag key={day}>{moment(day).format("YYYY-MM-DD")}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: "创建者",
            width: 100,
            render: (_, row: EntryOrFolderInfo) => (
                <Space>
                    <UserPhoto logoUri={row.value.create_logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                    {row.value.create_display_name}
                </Space>
            ),
        },
        {
            title: "创建时间",
            width: 150,
            render: (_, row: EntryOrFolderInfo) => moment(row.value.create_time).format("YYYY-MM-DD HH:mm:ss"),
        }
    ];

    return (
        <EntryListWrap entryType={ENTRY_TYPE_SPRIT}>
            <Table rowKey="id" dataSource={entryStore.entryOrFolderList.filter(item => item.is_folder == false).filter(item => (item.value as EntryInfo).entry_type == ENTRY_TYPE_SPRIT)}
                columns={columns} scroll={{ x: 1300 }}
                pagination={{ total: projectStore.projectHome.otherTotalCount, current: projectStore.projectHome.otherCurPage + 1, pageSize: PAGE_SIZE, onChange: page => projectStore.projectHome.otherCurPage = page + 1 }} />
        </EntryListWrap>);
};

export default observer(WorkPlanList);