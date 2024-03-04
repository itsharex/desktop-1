import React, { useState } from "react";
import { observer } from 'mobx-react';
import type { EntryOrFolderInfo, EntryInfo } from "@/api/project_entry";
import { ENTRY_TYPE_FILE } from "@/api/project_entry";
import EntryListWrap, { PAGE_SIZE } from "./components/EntryListWrap";
import { useStores } from "@/hooks";
import Table, { ColumnsType } from "antd/lib/table";
import { Button, Space, Tag } from "antd";
import s from "./Card.module.less";
import EntryEditCol from "./components/EntryEditCol";
import FileModal from "./components/FileModal";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";

const FileList = () => {
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');

    const [showFileInfo, setShowFileInfo] = useState<EntryInfo | null>(null);

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
                        setShowFileInfo(row.value as EntryInfo);
                    }} title={(row.value as EntryInfo).entry_title}>{(row.value as EntryInfo).entry_title}</Button>
                    <EntryEditCol entryInfo={row.value as EntryInfo} />
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
            title: "文件名",
            width: 200,
            render: (_, row: EntryOrFolderInfo) => (row.value as EntryInfo).extra_info.ExtraFileInfo?.file_name ?? "",
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
        <>
            <EntryListWrap entryType={ENTRY_TYPE_FILE}>
                <Table rowKey="id" dataSource={entryStore.entryOrFolderList.filter(item => item.is_folder == false).filter(item => (item.value as EntryInfo).entry_type == ENTRY_TYPE_FILE)}
                    columns={columns} scroll={{ x: 950 }}
                    pagination={{ total: projectStore.projectHome.otherTotalCount, current: projectStore.projectHome.otherCurPage + 1, pageSize: PAGE_SIZE, onChange: page => projectStore.projectHome.otherCurPage = page + 1 }} />
            </EntryListWrap>
            {showFileInfo != null && (
                <FileModal fileId={showFileInfo.extra_info.ExtraFileInfo?.file_id ?? "'"} fileName={showFileInfo.extra_info.ExtraFileInfo?.file_name ?? ""}
                    onClose={() => setShowFileInfo(null)} />
            )}
        </>
    );
};

export default observer(FileList);