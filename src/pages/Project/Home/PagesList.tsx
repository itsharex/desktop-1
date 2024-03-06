import React, { useState } from "react";
import { observer } from 'mobx-react';
import { ENTRY_TYPE_PAGES, type EntryOrFolderInfo, type EntryInfo } from "@/api/project_entry";
import EntryListWrap, { PAGE_SIZE } from "./components/EntryListWrap";
import { Button, Space, Table, Tag } from "antd";
import { useStores } from "@/hooks";
import type { ColumnsType } from "antd/lib/table";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";
import s from "./Card.module.less";
import PagesModal from "./components/PagesModal";
import EntryEditCol from "./components/EntryEditCol";

const PagesList = () => {
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const [entryInfo, setEntryInfo] = useState<EntryInfo | null>(null);

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
                        setEntryInfo(row.value as EntryInfo);
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
        <EntryListWrap entryType={ENTRY_TYPE_PAGES} >
            <Table rowKey="id" dataSource={entryStore.entryOrFolderList.filter(item => item.is_folder == false).filter(item => (item.value as EntryInfo).entry_type == ENTRY_TYPE_PAGES)} 
            columns={columns} scroll={{ x: 850 }}
                pagination={{ total: projectStore.projectHome.otherTotalCount, current: projectStore.projectHome.otherCurPage + 1, pageSize: PAGE_SIZE, onChange: page => projectStore.projectHome.otherCurPage = page + 1 }} />
            {entryInfo != null && (
                <PagesModal fileId={entryInfo.extra_info.ExtraPagesInfo?.file_id ?? ""}
                    entryId={entryInfo.entry_id} entryTitle={entryInfo.entry_title}
                    onClose={() => setEntryInfo(null)} />
            )}
        </EntryListWrap>
    );
};

export default observer(PagesList);