//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import { observer } from 'mobx-react';
import type { EntryOrFolderInfo, EntryInfo } from "@/api/project_entry";
import { API_COLL_CUSTOM, API_COLL_GRPC, API_COLL_OPENAPI, ENTRY_TYPE_API_COLL } from "@/api/project_entry";
import EntryListWrap, { PAGE_SIZE } from "./components/EntryListWrap";
import { useStores } from "@/hooks";
import Table, { ColumnsType } from "antd/lib/table";
import { Button, Space, Tag } from "antd";
import s from "./Card.module.less";
import EntryEditCol from "./components/EntryEditCol";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment from "moment";

const ApiCollList = () => {
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const linkAuxStore = useStores('linkAuxStore');

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
                        linkAuxStore.openApiCollPage((row.value as EntryInfo).entry_id, (row.value as EntryInfo).entry_title, (row.value as EntryInfo).extra_info.ExtraApiCollInfo?.api_coll_type ?? 0,
                            (row.value as EntryInfo).extra_info.ExtraApiCollInfo?.default_addr ?? "", (row.value as EntryInfo).can_update, projectStore.isAdmin, false);
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
            title: "接口类型",
            width: 100,
            render: (_, row: EntryOrFolderInfo) => (
                <>
                    {(row.value as EntryInfo).extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_GRPC && "GRPC"}
                    {(row.value as EntryInfo).extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_OPENAPI && "SWAGGER/OPENAPI"}
                    {(row.value as EntryInfo).extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_CUSTOM && "自定义"}
                </>
            ),
        },
        {
            title: "服务地址",
            width: 120,
            render: (_, row: EntryOrFolderInfo) => (row.value as EntryInfo).extra_info.ExtraApiCollInfo?.default_addr ?? "",
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

        <EntryListWrap entryType={ENTRY_TYPE_API_COLL}>
            <Table rowKey="id" dataSource={entryStore.entryOrFolderList.filter(item => item.is_folder == false).filter(item => (item.value as EntryInfo).entry_type == ENTRY_TYPE_API_COLL)}
                columns={columns} scroll={{ x: 950 }}
                pagination={{ total: projectStore.projectHome.otherTotalCount, current: projectStore.projectHome.otherCurPage + 1, pageSize: PAGE_SIZE, onChange: page => projectStore.projectHome.otherCurPage = page + 1 }} />
        </EntryListWrap>

    );
};

export default observer(ApiCollList);