import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Form, Input, Select, Switch } from "antd";
import { FilterTwoTone, PlusOutlined } from "@ant-design/icons";
import { useStores } from "@/hooks";
import type { ENTRY_TYPE } from "@/api/project_entry";
import { ENTRY_TYPE_BOARD, ENTRY_TYPE_DOC, ENTRY_TYPE_PAGES, ENTRY_TYPE_SPRIT, list as list_entry } from "@/api/project_entry";
import { request } from "@/utils/request";

export const PAGE_SIZE = 20;

export interface EntryListWrapProps {
    entryType: ENTRY_TYPE;
    children: React.ReactNode;
}

const EntryListWrap = (props: EntryListWrapProps) => {
    const appStore = useStores('appStore');
    const userStore = useStores("userStore");
    const projectStore = useStores("projectStore");
    const entryStore = useStores("entryStore");

    const [dataVersion, setDataVersion] = useState(0); //防止两次加载

    const loadEntryList = async () => {
        entryStore.entryOrFolderList = [];
        const res = await request(list_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_param: {
                filter_by_watch: projectStore.projectHome.otherFilterByWatch,
                filter_by_tag_id: projectStore.projectHome.otherTagIdList.length > 0,
                tag_id_list: projectStore.projectHome.otherTagIdList,
                filter_by_keyword: projectStore.projectHome.otherKeyword != "",
                keyword: projectStore.projectHome.otherKeyword,
                filter_by_entry_type: true,
                entry_type_list: [props.entryType],
            },
            offset: projectStore.projectHome.otherCurPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        entryStore.entryOrFolderList = res.entry_list.map(item => ({
            id: item.entry_id,
            is_folder: false,
            value: item,
        }));
    };

    const getEntryTypeName = () => {
        if (props.entryType == ENTRY_TYPE_SPRIT) {
            return "工作计划";
        } else if (props.entryType == ENTRY_TYPE_DOC) {
            return "项目文档";
        } else if (props.entryType == ENTRY_TYPE_PAGES) {
            return "静态网页";
        } else if (props.entryType == ENTRY_TYPE_BOARD) {
            return "信息面板";
        }
        return "";
    };

    const calcWidth = () => {
        let subWidth = 60;
        if (projectStore.showChatAndComment) {
            subWidth += 400;
        }
        if (appStore.focusMode == false) {
            subWidth += 200;
        }
        return `calc(100vw - ${subWidth}px)`;
    };

    useEffect(() => {
        if (projectStore.projectHome.otherCurPage != 0) {
            projectStore.projectHome.otherCurPage = 0;
        }
        if (projectStore.projectHome.otherKeyword != "") {
            projectStore.projectHome.otherKeyword = "";
        }
        if (projectStore.projectHome.otherTagIdList.length > 0) {
            projectStore.projectHome.otherTagIdList = [];
        }
        if (projectStore.projectHome.otherFilterByWatch) {
            projectStore.projectHome.otherFilterByWatch = false;
        }
        setDataVersion(oldValue => oldValue + 1);
    }, [projectStore.curProjectId]);

    useEffect(() => {
        loadEntryList();
    }, [projectStore.projectHome.otherCurPage, dataVersion, projectStore.projectHome.otherKeyword, projectStore.projectHome.otherTagIdList, projectStore.projectHome.otherFilterByWatch, entryStore.dataVersion]);

    return (
        <Card title={<span style={{ fontSize: "20px", fontWeight: 700 }}>{getEntryTypeName()}</span>}
            headStyle={{ height: "50px" }} bordered={false}
            bodyStyle={{ height: "calc(100vh - 136px)", overflowY: "scroll", width: calcWidth() }}
            extra={
                <Form layout="inline">
                    <FilterTwoTone style={{ fontSize: "24px", marginRight: "10px" }} />
                    <Form.Item>
                        <Input style={{ minWidth: "100px" }} value={projectStore.projectHome.otherKeyword} onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            projectStore.projectHome.otherKeyword = e.target.value.trim();
                        }} allowClear placeholder="请输入标题关键词" />
                    </Form.Item>
                    {(projectStore.curProject?.tag_list ?? []).filter(item => item.use_in_entry).length > 0 && (
                        <Form.Item>
                            <Select mode="multiple" style={{ minWidth: "100px" }}
                                allowClear value={projectStore.projectHome.otherTagIdList} onChange={value => projectStore.projectHome.otherTagIdList = value}
                                placeholder="请选择标签">
                                {(projectStore.curProject?.tag_list ?? []).filter(item => item.use_in_entry).map(item => (
                                    <Select.Option key={item.tag_id} value={item.tag_id}>
                                        <div style={{ backgroundColor: item.bg_color, padding: "0px 4px" }}>{item.tag_name}</div></Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                    <Form.Item label="我的关注">
                        <Switch checked={projectStore.projectHome.otherFilterByWatch} onChange={value => projectStore.projectHome.otherFilterByWatch = value} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<PlusOutlined />} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            entryStore.createEntryType = props.entryType;
                        }}>创建{getEntryTypeName()}</Button>
                    </Form.Item>
                </Form>
            }>
            {props.children}
        </Card>
    );
};

export default observer(EntryListWrap);