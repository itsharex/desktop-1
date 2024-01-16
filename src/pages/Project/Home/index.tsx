import React, { useEffect, useState } from "react";
import s from "./index.module.less";
import { observer } from 'mobx-react';
import { Breadcrumb, Button, Card, Divider, Dropdown, Form, Input, List, Select, Space, Switch, Tabs } from "antd";
import { useHistory } from "react-router-dom";
import { useStores } from "@/hooks";
import type { ENTRY_TYPE, ListParam, EntryInfo, EntryOrFolderInfo, FolderPathItem, FolderInfo } from "@/api/project_entry";
import {
    list as list_entry, list_sys as list_sys_entry, list_sub_entry, list_sub_folder, get_folder_path,
    ENTRY_TYPE_SPRIT, ENTRY_TYPE_DOC, ENTRY_TYPE_NULL, ENTRY_TYPE_PAGES, ENTRY_TYPE_BOARD, ENTRY_TYPE_FILE,
    ENTRY_TYPE_API_COLL,
    ENTRY_TYPE_DATA_ANNO
} from "@/api/project_entry";
import { request } from "@/utils/request";
import { CreditCardFilled, FilterTwoTone } from "@ant-design/icons";
import EntryCard from "./EntryCard";
import CreateFolderModal from "./components/CreateFolderModal";
import FolderCard from "./FolderCard";

const PAGE_SIZE = 24;

const ProjectHome = () => {
    const history = useHistory();

    const appStore = useStores("appStore");
    const userStore = useStores("userStore");
    const projectStore = useStores("projectStore");
    const entryStore = useStores("entryStore");
    const linkAuxStore = useStores("linkAuxStore");
    const ideaStore = useStores("ideaStore");

    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const [dataVersion, setDataVersion] = useState(0); //防止两次加载

    const [keyword, setKeyword] = useState("");
    const [showFilterBar, setShowFilterBar] = useState(false);
    const [tagIdList, setTagIdList] = useState<string[]>([]);
    const [entryType, setEntryType] = useState<ENTRY_TYPE>(ENTRY_TYPE_NULL);

    const [activeKey, setActiveKey] = useState<"folder" | "list" | "close">("folder");
    const [filterByWatch, setFilterByWatch] = useState(false);

    const [sysEntryList, setSysEntryList] = useState<{ id: string; content: string | EntryInfo; }[]>([]);
    const [pathItemList, setPathItemList] = useState([] as FolderPathItem[]);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);


    const loadFolderList = async () => {
        const tmpList = entryStore.entryOrFolderList.filter(item => item.is_folder == false);
        const res = await request(list_sub_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            parent_folder_id: entryStore.curFolderId,
        }));
        const folderList: EntryOrFolderInfo[] = res.folder_list.map(item => ({
            id: item.folder_id,
            is_folder: true,
            value: item,
        }));
        entryStore.entryOrFolderList = [...folderList, ...tmpList];
    };

    const loadEntryList = async () => {
        const tmpList = [] as EntryOrFolderInfo[];

        if (activeKey == "folder") {
            //获取当前路径
            if (entryStore.curFolderId == "") {
                setPathItemList([]);
            } else {
                const res = await request(get_folder_path({
                    session_id: userStore.sessionId,
                    project_id: projectStore.curProjectId,
                    folder_id: entryStore.curFolderId,
                }));
                setPathItemList(res.path_list);
            }
            const folderRes = await request(list_sub_folder({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                parent_folder_id: entryStore.curFolderId,
            }));
            for (const item of folderRes.folder_list) {
                tmpList.push({
                    id: item.folder_id,
                    is_folder: true,
                    value: item,
                });
            }
            const entryRes = await request(list_sub_entry({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                parent_folder_id: entryStore.curFolderId,
            }));
            for (const item of entryRes.entry_list) {
                tmpList.push({
                    id: item.entry_id,
                    is_folder: false,
                    value: item,
                })
            }
            setTotalCount(0);
        } else {
            let listParam: ListParam | null = null;
            if (activeKey == "list") {
                listParam = {
                    filter_by_watch: filterByWatch,
                    filter_by_tag_id: tagIdList.length > 0,
                    tag_id_list: tagIdList,
                    filter_by_keyword: keyword.length > 0,
                    keyword: keyword,
                    filter_by_mark_remove: true,
                    mark_remove: false,
                    filter_by_entry_type: entryType != ENTRY_TYPE_NULL,
                    entry_type_list: entryType == ENTRY_TYPE_NULL ? [] : [entryType],
                };
            } else if (activeKey == "close") {
                listParam = {
                    filter_by_watch: filterByWatch,
                    filter_by_tag_id: tagIdList.length > 0,
                    tag_id_list: tagIdList,
                    filter_by_keyword: keyword.length > 0,
                    keyword: keyword,
                    filter_by_mark_remove: true,
                    mark_remove: true,
                    filter_by_entry_type: entryType != ENTRY_TYPE_NULL,
                    entry_type_list: entryType == ENTRY_TYPE_NULL ? [] : [entryType],
                };
            }
            if (listParam == null) {
                return;
            }

            const res = await request(list_entry({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                list_param: listParam,
                offset: PAGE_SIZE * curPage,
                limit: PAGE_SIZE,
            }));
            setTotalCount(res.total_count);
            for (const item of res.entry_list) {
                tmpList.push({
                    id: item.entry_id,
                    is_folder: false,
                    value: item,
                })
            }
        }
        entryStore.entryOrFolderList = tmpList;
    };

    const loadSysEntryList = async () => {
        const res = await request(list_sys_entry({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        entryStore.sysEntryList = res.entry_list;
    };

    const calcFolderInfoWidth = () => {
        let subWidth = 400;
        if (appStore.focusMode == false) {
            subWidth += 200;
        }
        if (projectStore.showChatAndComment) {
            subWidth += 300;
        }
        console.log("xxxxx", subWidth);
        return `calc(100vw - ${subWidth}px)`;
    };

    const entryOrFolderList = (
        <List rowKey="id" dataSource={entryStore.entryOrFolderList} grid={{ gutter: 16 }}
            renderItem={item => (
                <List.Item key={item.id}>
                    {item.is_folder == false && (
                        <EntryCard entryInfo={item.value as EntryInfo} onRemove={() => loadEntryList()}
                            onMarkSys={() => {
                                loadSysEntryList();
                                loadEntryList();
                            }} canMove={activeKey == "folder" && projectStore.isAdmin} />
                    )}
                    {item.is_folder == true && (
                        <FolderCard folderInfo={item.value as FolderInfo} onRemove={() => loadFolderList()} canMove={activeKey == "folder" && projectStore.isAdmin}
                            onMove={() => loadFolderList()} />
                    )}
                </List.Item>
            )} pagination={activeKey == "folder" ? false : { total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true }} />
    );

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        }
        if (keyword != "") {
            setKeyword("");
        }
        if (tagIdList.length != 0) {
            setTagIdList([]);
        }
        if (entryType != ENTRY_TYPE_NULL) {
            setEntryType(ENTRY_TYPE_NULL);
        }
        if (showFilterBar) {
            setShowFilterBar(false);
        }
        setDataVersion(oldValue => oldValue + 1);
    }, [projectStore.curProjectId, entryStore.dataVersion, entryStore.curFolderId, activeKey]);

    useEffect(() => {
        loadEntryList();
    }, [curPage, dataVersion, keyword, tagIdList, entryType, filterByWatch]);

    useEffect(() => {
        loadSysEntryList();
    }, [projectStore.curProjectId]);


    useEffect(() => {
        setSysEntryList([
            ...(entryStore.sysEntryList.map(sysEntry => (
                {
                    id: sysEntry.entry_id,
                    content: sysEntry,
                }
            )))
        ]);
    }, [entryStore.sysEntryList]);

    return (
        <div className={s.home_wrap}>
            {sysEntryList.length > 0 && (
                <>
                    <h1 className={s.header}><CreditCardFilled />&nbsp;&nbsp;系统面板</h1>
                    <List rowKey="id"
                        grid={{ gutter: 16 }}
                        dataSource={sysEntryList}
                        renderItem={item => (
                            <List.Item>
                                <EntryCard entryInfo={item.content as EntryInfo} onRemove={() => loadEntryList()}
                                    onMarkSys={() => {
                                        loadSysEntryList();
                                        loadEntryList();
                                    }} canMove={false} />
                            </List.Item>
                        )} />
                    <Divider style={{ margin: "4px 0px" }} />
                </>
            )}
            <Card title={<h1 className={s.header}><CreditCardFilled />&nbsp;&nbsp;内容面板</h1>}
                headStyle={{ paddingLeft: "0px" }} bodyStyle={{ padding: "4px 0px" }}
                bordered={false} extra={
                    <Space size="small">
                        <Form layout="inline">
                            <FilterTwoTone style={{ fontSize: "24px", marginRight: "10px" }} />
                            <Form.Item>
                                <Input style={{ minWidth: "100px" }} value={keyword} onChange={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setKeyword(e.target.value.trim());
                                }} placeholder="过滤标题" size="large" allowClear />
                            </Form.Item>
                            {(projectStore.curProject?.tag_list ?? []).filter(item => item.use_in_entry).length > 0 && (
                                <Form.Item>
                                    <Select mode="multiple" style={{ minWidth: "100px" }} size="large"
                                        placeholder="过滤标签"
                                        allowClear value={tagIdList} onChange={value => setTagIdList(value)}>
                                        {(projectStore.curProject?.tag_list ?? []).filter(item => item.use_in_entry).map(item => (
                                            <Select.Option key={item.tag_id} value={item.tag_id}>
                                                <div style={{ backgroundColor: item.bg_color, padding: "0px 4px" }}>{item.tag_name}</div></Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                        </Form>
                        <Dropdown.Button type="primary" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            entryStore.createEntryType = ENTRY_TYPE_SPRIT;
                        }} menu={{
                            items: [
                                {
                                    key: "requirement",
                                    label: "创建需求",
                                    onClick: () => {
                                        linkAuxStore.goToCreateRequirement("", projectStore.curProjectId, history);
                                    },
                                },
                                {
                                    key: "task",
                                    label: "创建任务",
                                    onClick: () => {
                                        linkAuxStore.goToCreateTask("", projectStore.curProjectId, history);
                                    },
                                },
                                {
                                    key: "bug",
                                    label: "创建缺陷",
                                    onClick: () => {
                                        linkAuxStore.goToCreateBug("", projectStore.curProjectId, history);
                                    },
                                },
                                {
                                    key: "idea",
                                    label: "创建知识点",
                                    onClick: () => {
                                        ideaStore.setShowCreateIdea("", "");
                                    },
                                }
                            ],
                        }}>创建内容</Dropdown.Button>
                    </Space>
                }>
                <Tabs accessKey={activeKey} onChange={value => {
                    entryStore.curFolderId = "";
                    if (["folder", "list", "close"].includes(value)) {
                        setActiveKey(value as "list" | "folder" | "close");
                    }
                }}
                    animated tabBarStyle={{ height: "40px" }}
                    items={[
                        {
                            key: "folder",
                            label: <span style={{ fontSize: "16px" }}>目录</span>,
                            children: (
                                <>
                                    {activeKey == "folder" && (<>{entryOrFolderList}</>)}
                                </>
                            ),
                        },
                        {
                            key: "list",
                            label: <span style={{ fontSize: "16px" }}>列表</span>,
                            children: (
                                <>
                                    {activeKey == "list" && (<>{entryOrFolderList}</>)}
                                </>
                            ),
                        },
                        {
                            key: "close",
                            label: <span style={{ fontSize: "16px" }}>回收站</span>,
                            children: (
                                <>
                                    {activeKey == "close" && (<>{entryOrFolderList}</>)}

                                </>
                            ),
                        },
                    ]} type="card" tabBarExtraContent={
                        <>
                            {activeKey != "folder" && (
                                <Form layout="inline">
                                    <Form.Item className={s.seg_wrap} label="内容类型">
                                        <Select value={entryType} onChange={value => setEntryType(value)} style={{ width: "100px" }}>
                                            <Select.Option value={ENTRY_TYPE_NULL}>全部</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_SPRIT}>工作计划</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_DOC}>文档</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_PAGES}>静态网页</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_BOARD}>信息面板</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_FILE}>文件</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_API_COLL}>接口集合</Select.Option>
                                            <Select.Option value={ENTRY_TYPE_DATA_ANNO}>数据标注</Select.Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item label="只看我的关注">
                                        <Switch checked={filterByWatch} onChange={value => setFilterByWatch(value)} />
                                    </Form.Item>
                                </Form>
                            )}
                            {activeKey == "folder" && (
                                <Space>
                                    <div style={{ width: calcFolderInfoWidth(), overflow: "hidden", height: "30px" }}>
                                        <Breadcrumb>
                                            <Breadcrumb.Item>
                                                <Button type="link" disabled={entryStore.curFolderId == ""}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        entryStore.curFolderId = "";
                                                    }}>
                                                    根目录
                                                </Button>
                                            </Breadcrumb.Item>
                                            {pathItemList.map(item => (
                                                <Breadcrumb.Item key={item.folder_id}>
                                                    <Button type="link" disabled={item.folder_id == entryStore.curFolderId}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            entryStore.curFolderId = item.folder_id;
                                                        }}>{item.folder_title}</Button>
                                                </Breadcrumb.Item>
                                            ))}
                                        </Breadcrumb>
                                    </div>
                                    <Button type="primary" style={{ marginRight: "14px" }} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowCreateFolderModal(true);
                                    }}>创建目录</Button>
                                </Space>
                            )}
                        </>
                    } />
            </Card>
            {showCreateFolderModal == true && (
                <CreateFolderModal onCancel={() => setShowCreateFolderModal(false)} onOk={() => {
                    loadFolderList();
                    setShowCreateFolderModal(false);
                }} />
            )}
        </div >
    );
};

export default observer(ProjectHome);