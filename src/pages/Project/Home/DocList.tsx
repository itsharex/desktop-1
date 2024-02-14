import React from "react";
import { observer } from 'mobx-react';
import type { EntryOrFolderInfo, EntryInfo } from "@/api/project_entry";
import { ENTRY_TYPE_DOC } from "@/api/project_entry";
import { useHistory } from "react-router-dom";
import { useStores } from "@/hooks";
import Table, { ColumnsType } from "antd/lib/table";
import { Space, Tag } from "antd";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import EntryListWrap, { PAGE_SIZE } from "./components/EntryListWrap";
import s from "./Card.module.less";
import { APP_PROJECT_KB_DOC_PATH } from "@/utils/constant";
import EntryOptCol from "./components/EntryOptCol";


const DocList = () => {
    const history = useHistory();

    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const docStore = useStores('docStore');

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
                    <span style={{ cursor: "pointer", fontWeight: 600 }} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        entryStore.curEntry = (row.value as EntryInfo);
                        docStore.loadDoc().then(() => {
                            history.push(APP_PROJECT_KB_DOC_PATH);
                        });
                    }} title={(row.value as EntryInfo).entry_title}>{(row.value as EntryInfo).entry_title}</span>
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
            title: "操作",
            width: 100,
            render: (_, row: EntryOrFolderInfo) => (
                <EntryOptCol entryInfo={row.value as EntryInfo} />
            ),
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
        <EntryListWrap entryType={ENTRY_TYPE_DOC}>
            <Table rowKey="id" dataSource={entryStore.entryOrFolderList.filter(item => item.is_folder == false).filter(item => (item.value as EntryInfo).entry_type == ENTRY_TYPE_DOC)} 
            columns={columns} scroll={{ x: 850 }}
                pagination={{ total: projectStore.projectHome.otherTotalCount, current: projectStore.projectHome.otherCurPage + 1, pageSize: PAGE_SIZE, onChange: page => projectStore.projectHome.otherCurPage = page + 1 }} />
        </EntryListWrap>);
};

export default observer(DocList);