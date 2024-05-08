//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { AppInfo, MajorCate, MinorCate, SubMinorCate } from "@/api/appstore";
import { Button, Card, Form, Input, Layout, List, Menu, Modal, Select, Space, Tabs } from "antd";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import {
    list_major_cate, list_minor_cate, list_sub_minor_cate, list_app,
    OS_SCOPE_LINUX, OS_SCOPE_MAC, OS_SCOPE_WINDOWS, SORT_KEY_UPDATE_TIME, SORT_KEY_INSTALL_COUNT,
    SORT_KEY_AGREE_COUNT
} from "@/api/appstore";
import { platform } from '@tauri-apps/api/os';
import { CloseOutlined } from "@ant-design/icons";
import AsyncImage from "@/components/AsyncImage";
import { GLOBAL_APPSTORE_FS_ID, GLOBAL_DOCKER_TEMPLATE_FS_ID, GLOBAL_SOFT_WARE_STORE_FS_ID } from "@/api/fs";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { ReadOnlyEditor } from "../ReadOnlyEditor";
import type { SoftWareCateInfo, SoftWareInfo } from "@/api/sw_store";
import { list_cate as list_soft_cate, list_soft_ware, OS_LINUX, OS_MAC, OS_WINDOWS } from "@/api/sw_store";
import type { ItemType, MenuItemGroupType } from "antd/lib/menu/hooks/useItems";
import type { IdeaInStore } from "@/api/idea_store";
import { list_store_cate, list_store, list_idea } from "@/api/idea_store";
import type { CateInfo, AppWithTemplateInfo } from "@/api/docker_template";
import { list_cate as list_docker_cate, list_app_with_template } from "@/api/docker_template";

const PAGE_SIZE = 12;

export interface PubResModalProps {
    onCancel: () => void;
    onOk: (refId: string) => void;
}

export const MinAppSelectModal = observer((props: PubResModalProps) => {
    const userStore = useStores('userStore');
    const appStore = useStores('appStore');
    const pubResStore = useStores('pubResStore');

    const [appList, setAppList] = useState<AppInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const [majorCateList, setMajorCateList] = useState<MajorCate[]>([]);
    const [minorCateList, setMinorCateList] = useState<MinorCate[]>([]);
    const [subMinorCateList, setSubMinorCateList] = useState<SubMinorCate[]>([]);

    const loadMajorCate = async () => {
        const res = await request(list_major_cate({}));
        setMajorCateList(res.cate_info_list);
    };

    const loadMinorCate = async () => {
        setMinorCateList([]);
        if (pubResStore.appMajorCateId != "") {
            const res = await request(list_minor_cate({ major_cate_id: pubResStore.appMajorCateId }));
            setMinorCateList(res.cate_info_list);
        }
    }

    const loadSubMinorCate = async () => {
        setSubMinorCateList([]);
        if (pubResStore.appMinorCateId != "") {
            const res = await request(list_sub_minor_cate({ minor_cate_id: pubResStore.appMinorCateId }));
            setSubMinorCateList(res.cate_info_list);
        }
    };

    const loadAppList = async () => {
        let osScope = OS_SCOPE_LINUX;
        const p = await platform();
        if ("darwin" == p) {
            osScope = OS_SCOPE_MAC;
        } else if ("win32" == p) {
            osScope = OS_SCOPE_WINDOWS;
        }
        console.log(pubResStore.appSortKey);
        const res = await request(list_app({
            list_param: {
                filter_by_major_cate_id: pubResStore.appMajorCateId != "",
                major_cate_id: pubResStore.appMajorCateId,
                filter_by_minor_cate_id: pubResStore.appMinorCateId != "",
                minor_cate_id: pubResStore.appMinorCateId,
                filter_by_sub_minor_cate_id: pubResStore.appSubMinorCateId != "",
                sub_minor_cate_id: pubResStore.appSubMinorCateId,
                filter_by_os_scope: true,
                os_scope: osScope,
                filter_by_keyword: pubResStore.appKeyword.trim() != "",
                keyword: pubResStore.appKeyword.trim(),
            },
            offset: pubResStore.appCurPage * PAGE_SIZE,
            limit: PAGE_SIZE,
            sort_key: pubResStore.appSortKey,
            session_id: userStore.sessionId,
        }));

        setTotalCount(res.total_count);
        setAppList(res.app_info_list);
    };

    const adjustUrl = (fileId: string) => {
        if (appStore.isOsWindows) {
            return `https://fs.localhost/${GLOBAL_APPSTORE_FS_ID}/${fileId}/icon.png`;
        } else {
            return `fs://localhost/${GLOBAL_APPSTORE_FS_ID}/${fileId}/icon.png`;
        }
    }

    useEffect(() => {
        loadMajorCate();
    }, []);

    useEffect(() => {
        pubResStore.appMinorCateId = "";
        loadMinorCate();
    }, [pubResStore.appMajorCateId]);

    useEffect(() => {
        pubResStore.appSubMinorCateId = "";
        loadSubMinorCate();
    }, [pubResStore.appMinorCateId]);

    useEffect(() => {
        loadAppList();
    }, [pubResStore.appCurPage, pubResStore.appDataVersion, pubResStore.appMajorCateId, pubResStore.appMinorCateId, pubResStore.appSubMinorCateId]);

    return (
        <Modal open closable={false}
            width="calc(100vw - 200px)" bodyStyle={{ padding: "0px 0px" }}
            footer={null}>
            <Card title="应用市场" bordered={false} bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "scroll" }}
                extra={
                    <Form layout="inline">
                        <Form.Item label="一级分类">
                            <Select style={{ width: "100px" }} value={pubResStore.appMajorCateId} onChange={value => pubResStore.appMajorCateId = value}>
                                <Select.Option value="">全部</Select.Option>
                                {majorCateList.map(cate => (
                                    <Select.Option key={cate.cate_id} value={cate.cate_id}>{cate.cate_name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="二级分类">
                            <Select style={{ width: "100px" }} value={pubResStore.appMinorCateId} onChange={value => pubResStore.appMinorCateId = value}>
                                <Select.Option value="">全部</Select.Option>
                                {minorCateList.map(cate => (
                                    <Select.Option key={cate.cate_id} value={cate.cate_id}>{cate.cate_name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="三级分类">
                            <Select style={{ width: "100px" }} value={pubResStore.appSubMinorCateId} onChange={value => pubResStore.appSubMinorCateId = value}>
                                <Select.Option value="">全部</Select.Option>
                                {subMinorCateList.map(cate => (
                                    <Select.Option key={cate.cate_id} value={cate.cate_id}>{cate.cate_name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="关键词">
                            <Input style={{ width: 150 }} value={pubResStore.appKeyword} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                pubResStore.appKeyword = e.target.value.trim();
                            }} />
                        </Form.Item>
                        <Form.Item label="排序">
                            <Select value={pubResStore.appSortKey} onChange={value => pubResStore.appSortKey = value} style={{ width: "100px" }}>
                                <Select.Option value={SORT_KEY_UPDATE_TIME}>更新时间</Select.Option>
                                <Select.Option value={SORT_KEY_INSTALL_COUNT}>安装数量</Select.Option>
                                <Select.Option value={SORT_KEY_AGREE_COUNT}>点赞数量</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item>
                            <Button type="text" icon={<CloseOutlined />} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                props.onCancel();
                            }} />
                        </Form.Item>
                    </Form>
                }>
                <List rowKey="app_id" dataSource={appList}
                    grid={{ gutter: 16, column: 3 }} renderItem={app => (
                        <List.Item>
                            <Card style={{ flex: 1, borderRadius: "10px", cursor: "pointer" }}
                                headStyle={{ backgroundColor: "#e4e4e8" }}
                                title={app.base_info.app_name}
                                bodyStyle={{ display: "flex" }}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    props.onOk(app.app_id);
                                }}>
                                <Space direction="vertical">
                                    <AsyncImage style={{ width: "80px", height: "80px", cursor: "pointer" }}
                                        src={adjustUrl(app.base_info.icon_file_id)} fallback={defaultIcon} preview={false} useRawImg={false}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            props.onOk(app.app_id);
                                        }} />
                                </Space>
                                <div style={{ marginLeft: "20px", height: "120px", overflowY: "scroll", width: "100%" }}>
                                    <ReadOnlyEditor content={app.base_info.app_desc} />
                                </div>
                            </Card>
                        </List.Item>
                    )} pagination={{ total: totalCount, current: pubResStore.appCurPage + 1, pageSize: PAGE_SIZE, onChange: (page) => pubResStore.appCurPage = (page - 1) }} />
            </Card>
        </Modal>
    );
});

export const SoftWareSelectModal = observer((props: PubResModalProps) => {
    const [cateList, setCateList] = useState<SoftWareCateInfo[]>([]);
    const [activeKey, setActiveKey] = useState("");

    const [softWareList, setSoftWareList] = useState<SoftWareInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);


    useEffect(() => {
        request(list_soft_cate({})).then(res => setCateList([
            {
                cate_id: "",
                cate_name: "推荐软件",
                weight: 99,
                soft_ware_count: 0,
                create_time: 0,
                update_time: 0,
            },
            ...res.cate_list,
        ]));
    }, []);

    const loadSoftWareList = async () => {
        let osType = OS_LINUX;
        const osName = await platform();
        if (osName == "win32") {
            osType = OS_WINDOWS;
        } else if (osName == "darwin") {
            osType = OS_MAC;
        }
        const res = await request(list_soft_ware({
            list_param: {
                filterby_os_type: true,
                os_type: osType,
                filter_by_cate_id: activeKey != "",
                cate_id: activeKey,
                filter_by_recommend: activeKey == "",
                recommend: activeKey == "",
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setSoftWareList(res.soft_ware_list);
    };

    useEffect(() => {
        loadSoftWareList();
    }, [activeKey, curPage]);

    return (
        <Modal open title="常用软件"
            width="calc(100vw - 200px)" bodyStyle={{ padding: "0px 0px" }}
            footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            <Tabs activeKey={activeKey} onChange={key => {
                setActiveKey(key)
                setCurPage(0);
            }}
                items={cateList.map(cate => ({
                    key: cate.cate_id,
                    label: cate.cate_name,
                    children: (
                        <>
                            {cate.cate_id == activeKey && (
                                <List rowKey="sw_id" dataSource={softWareList}
                                    pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                                    renderItem={item => (
                                        <Card title={<span style={{ fontSize: "20px", fontWeight: 700 }}>{item.sw_name}</span>} bordered={false}
                                            style={{ cursor: "pointer" }} onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                props.onOk(item.sw_id);
                                            }}>
                                            <div style={{ display: "flex" }}>
                                                <div>
                                                    <AsyncImage style={{ width: "80px", cursor: "pointer" }}
                                                        src={`fs://localhost/${GLOBAL_SOFT_WARE_STORE_FS_ID}/${item.icon_file_id}/icon.png`}
                                                        preview={false}
                                                        fallback={defaultIcon}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            props.onOk(item.sw_id);
                                                        }}
                                                        useRawImg={false}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, paddingLeft: "20px" }}>
                                                    <ReadOnlyEditor content={item.sw_desc} />
                                                </div>
                                            </div>
                                        </Card>
                                    )} style={{ height: "calc(100vh - 130px)", overflowY: "scroll", paddingRight: "10px" }} />
                            )}
                        </>
                    ),
                }))} tabPosition="left" style={{ height: "calc(100vh - 130px)" }} type="card" tabBarStyle={{ width: "100px", overflow: "hidden" }} />
        </Modal>
    );
});


export const PubIdeaSelectModal = observer((props: PubResModalProps) => {
    const [menuList, setMenuList] = useState([] as ItemType[]);
    const [curCatId, setCurCateId] = useState("");
    const [curStoreId, setCurStoreId] = useState("");
    const [titleKeyword, setTitleKeyword] = useState("");

    const [ideaList, setIdeaList] = useState([] as IdeaInStore[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadMenuList = async () => {
        const cateRes = await request(list_store_cate({}));
        const storeRes = await request(list_store({
            filter_by_store_cate_id: false,
            store_cate_id: "",
        }));
        const tmpList = [] as ItemType[];
        for (const cate of cateRes.cate_list) {
            if (cate.store_count == 0) {
                continue;
            }
            const storeList = storeRes.store_list.filter(item => item.store_cate_id == cate.store_cate_id);
            const menuItem: ItemType = {
                key: cate.store_cate_id,
                label: cate.name,
                children: [] as ItemType[],
            };

            for (const store of storeList) {
                if (store.idea_count == 0) {
                    continue;
                }
                menuItem.children.push({
                    key: store.idea_store_id,
                    label: store.name,
                });
            }
            tmpList.push(menuItem);
        }
        if (storeRes.store_list.length > 0) {
            setCurCateId(storeRes.store_list[0].store_cate_id);
            setCurStoreId(storeRes.store_list[0].idea_store_id);
        }
        setMenuList(tmpList);
    };

    const loadIdeaList = async () => {
        if (curStoreId == "") {
            return;
        }
        const res = await request(list_idea({
            list_param: {
                filter_by_store_id: true,
                store_id: curStoreId,
                filter_by_title_keyword: titleKeyword != "",
                title_keyword: titleKeyword,
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setIdeaList(res.idea_list);
    };

    useEffect(() => {
        loadMenuList();
    }, []);

    useEffect(() => {
        loadIdeaList();
    }, [curPage, curStoreId, titleKeyword]);

    return (
        <Modal open title="知识点仓库"
            width="calc(100vw - 200px)" bodyStyle={{ padding: "0px 0px" }}
            footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            <Layout>
                <Layout.Sider theme="light" width="200px">
                    <Menu items={menuList} mode="inline" style={{ height: "calc(100vh - 240px)", overflowY: "scroll", overflowX: "hidden" }}
                        openKeys={[curCatId]} selectedKeys={[curStoreId]}
                        onOpenChange={keys => {
                            setTitleKeyword("");
                            setCurPage(0);
                            const tmpList = keys.filter(key => key != curCatId).filter(key => key != "");
                            if (tmpList.length == 0) {
                                setCurCateId("");
                                setCurStoreId("");
                            } else {
                                setCurCateId(tmpList[0]);
                                menuList.forEach(menu => {
                                    if (menu?.key == tmpList[0]) {
                                        const subMenuList = (menu as MenuItemGroupType).children ?? [];
                                        if (subMenuList.length > 0) {
                                            setCurStoreId(subMenuList[0]?.key as string);
                                        }
                                    }
                                });
                            }
                        }}
                        onSelect={info => {
                            setCurStoreId(info.key);
                            setTitleKeyword("");
                            setCurPage(0);
                        }} />
                </Layout.Sider>
                <Layout.Content>
                    <Card bordered={false} bodyStyle={{ height: "calc(100vh - 280px)", overflowY: "scroll" }}
                        extra={
                            <Form layout="inline">
                                <Form.Item label="过滤标题">
                                    <Input value={titleKeyword} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setTitleKeyword(e.target.value.trim());
                                    }} allowClear />
                                </Form.Item>
                            </Form>
                        }>
                        <List rowKey="idea_id" dataSource={ideaList}
                            pagination={{ current: curPage + 1, pageSize: PAGE_SIZE, total: totalCount, onChange: page => setCurPage(page - 1), showSizeChanger: false, hideOnSinglePage: true }}
                            renderItem={idea => (
                                <Card title={idea.basic_info.title} style={{ width: "100%", marginBottom: "10px", cursor: "pointer" }} headStyle={{ backgroundColor: "#eee" }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        props.onOk(idea.idea_id);
                                    }}>
                                    <ReadOnlyEditor content={idea.basic_info.content} />
                                </Card>
                            )} />
                    </Card>
                </Layout.Content>
            </Layout>
        </Modal>
    );
});


export const DockerTplSelectModal = observer((props: PubResModalProps) => {
    const appStore = useStores('appStore');
    const pubResStore = useStores('pubResStore');

    const [cateInfoList, setCateInfoList] = useState<CateInfo[]>([]);

    const [awtInfoList, setAwtInfoList] = useState<AppWithTemplateInfo[]>();
    const [totalCount, setTotalCount] = useState(0);

    const loadCateInfoList = async () => {
        const res = await request(list_docker_cate({}));
        setCateInfoList(res.cate_info_list);
    };

    const loadAwtInfoList = async () => {
        const res = await request(list_app_with_template({
            filter_by_cate_id: pubResStore.dockerCateId !== "",
            cate_id: pubResStore.dockerCateId,
            filter_by_keyword: pubResStore.dockerKeyword !== "",
            keyword: pubResStore.dockerKeyword,
            offset: pubResStore.dockerCurPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setAwtInfoList(res.info_list);
        setTotalCount(res.total_count);
    };

    const getIconUrl = (fileId: string) => {
        if (appStore.isOsWindows) {
            return `https://fs.localhost/${GLOBAL_DOCKER_TEMPLATE_FS_ID}/${fileId}/x.png`;
        } else {
            return `fs://localhost/${GLOBAL_DOCKER_TEMPLATE_FS_ID}/${fileId}/x.png`;
        }
    }

    useEffect(() => {
        loadCateInfoList();
    }, []);

    useEffect(() => {
        loadAwtInfoList();
    }, [pubResStore.dockerCurPage, pubResStore.dockerCateId, pubResStore.dockerKeyword]);

    return (
        <Modal open closable={false}
            width="calc(100vw - 200px)" bodyStyle={{ padding: "0px 0px" }}
            footer={null}>
            <Card bordered={false}
                bodyStyle={{ height: "calc(100vh - 280px)", overflowY: "scroll" }}
                extra={
                    <Space size="middle">
                        <Form layout="inline">
                            <Form.Item label="模板类别">
                                <Select value={pubResStore.dockerCateId} onChange={value => pubResStore.dockerCateId = value} style={{ width: "100px" }}>
                                    <Select.Option value="">全部</Select.Option>
                                    {cateInfoList.map(cateInfo => (
                                        <Select.Option key={cateInfo.cate_id} value={cateInfo.cate_id}>{cateInfo.cate_name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label="关键词">
                                <Input style={{ width: "150px" }} allowClear value={pubResStore.dockerKeyword} onChange={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    pubResStore.dockerKeyword = e.target.value.trim();
                                }} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="text" icon={<CloseOutlined />} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    props.onCancel();
                                }} />
                            </Form.Item>
                        </Form>
                    </Space>
                }>
                <List dataSource={awtInfoList} renderItem={item => (
                    <List.Item key={item.app_info.app_id}>
                        <Card title={<span style={{ fontSize: "20px", fontWeight: 700 }}>{item.app_info.name}</span>} bodyStyle={{ margin: "10px 10px" }} style={{ width: "100%", cursor: "pointer" }} bordered={false}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                props.onOk(item.app_info.app_id);
                            }}>
                            <div style={{ display: "flex" }}>
                                <div style={{ width: "100px" }}>
                                    <AsyncImage style={{ width: "80px", cursor: "pointer" }}
                                        src={getIconUrl(item.app_info.icon_file_id)}
                                        preview={false}
                                        fallback={defaultIcon}
                                        onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            props.onOk(item.app_info.app_id);
                                        }}
                                        useRawImg={false}
                                    />
                                </div>
                                <div style={{ paddingLeft: "20px", flex: 1, height: "120px", overflowY: "scroll" }}>
                                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{item.app_info.desc}</pre>
                                </div>
                            </div>

                        </Card>
                    </List.Item>
                )} pagination={{
                    total: totalCount, current: pubResStore.dockerCurPage + 1, pageSize: PAGE_SIZE,
                    onChange: page => pubResStore.dockerCurPage = page - 1, hideOnSinglePage: true,
                    showSizeChanger: false
                }} />
            </Card>
        </Modal>
    );
})