//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Descriptions, Form, List, message, Select, Space } from "antd";
import { get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import type { OS_TYPE, SoftWareCateInfo, SoftWareInfo } from "@/api/sw_store";
import { request } from "@/utils/request";
import { list_cate, list_soft_ware, get_soft_ware, OS_WINDOWS, OS_MAC, OS_LINUX } from "@/api/sw_store";
import { PlusOutlined } from "@ant-design/icons";
import AddSoftWareModal from "./components/AddSoftWareModal";
import s from "./components/AddSoftWareModal.module.less";
import AsyncImage from "@/components/AsyncImage";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { EditText } from "@/components/EditCell/EditText";
import { open as shell_open } from '@tauri-apps/api/shell';
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { get_admin_session } from '@/api/admin_auth';
import { write_file, set_file_owner, GLOBAL_SOFT_WARE_STORE_FS_ID, FILE_OWNER_TYPE_SOFT_WARE_STORE } from "@/api/fs";
import { update_soft_ware } from "@/api/sw_store_admin";
import { EditNumber } from "@/components/EditCell/EditNumber";
import { EditSelect } from "@/components/EditCell/EditSelect";
import { ReadOnlyEditor, useCommonEditor } from "@/components/Editor";

const PAGE_SIZE = 10;

interface SoftWareItemProps {
    softWare: SoftWareInfo;
    canUpdate: boolean;
    cateList: SoftWareCateInfo[];
    onChange: () => void;
}

const SoftWareItem = (props: SoftWareItemProps) => {
    const [inEdit, setInEdit] = useState(false);


    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: "",
        ownerType: 0,
        ownerId: "",
        projectId: "",
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        widgetInToolbar: false,
        showReminder: false,
    });

    const updateOsList = async (osList: OS_TYPE[]) => {
        const sessionId = await get_admin_session();
        await update_soft_ware({
            admin_session_id: sessionId,
            sw_id: props.softWare.sw_id,
            sw_name: props.softWare.sw_name,
            sw_desc: props.softWare.sw_desc,
            cate_id: props.softWare.cate_id,
            weight: props.softWare.weight,
            recommend: props.softWare.recommend,
            os_list: osList,
            download_url: props.softWare.download_url,
            icon_file_id: props.softWare.icon_file_id,
        });
        props.onChange();
    }

    const updateRecommend = async (recommend: boolean) => {
        const sessionId = await get_admin_session();
        await update_soft_ware({
            admin_session_id: sessionId,
            sw_id: props.softWare.sw_id,
            sw_name: props.softWare.sw_name,
            sw_desc: props.softWare.sw_desc,
            cate_id: props.softWare.cate_id,
            weight: props.softWare.weight,
            recommend: recommend,
            os_list: props.softWare.os_list,
            download_url: props.softWare.download_url,
            icon_file_id: props.softWare.icon_file_id,
        });
        props.onChange();
    };

    const updateDesc = async () => {
        const content = editorRef.current?.getContent() ?? { type: 'doc' };
        const sessionId = await get_admin_session();
        await update_soft_ware({
            admin_session_id: sessionId,
            sw_id: props.softWare.sw_id,
            sw_name: props.softWare.sw_name,
            sw_desc: JSON.stringify(content),
            cate_id: props.softWare.cate_id,
            weight: props.softWare.weight,
            recommend: props.softWare.recommend,
            os_list: props.softWare.os_list,
            download_url: props.softWare.download_url,
            icon_file_id: props.softWare.icon_file_id,
        });
        props.onChange();
        setInEdit(false);
    };

    const changeIcon = async () => {
        const selectd = await open_dialog({
            title: "更换应用图标",
            filters: [{
                name: "图标",
                extensions: ["ico", "png", "jpg", "jpeg"],
            }],
        });
        if (selectd == null || Array.isArray(selectd)) {
            return;
        } else {
            const sessionId = await get_admin_session();
            const fileRes = await request(write_file(sessionId, GLOBAL_SOFT_WARE_STORE_FS_ID, selectd, ""));
            await update_soft_ware({
                admin_session_id: sessionId,
                sw_id: props.softWare.sw_id,
                sw_name: props.softWare.sw_name,
                sw_desc: props.softWare.sw_desc,
                cate_id: props.softWare.cate_id,
                weight: props.softWare.weight,
                recommend: props.softWare.recommend,
                os_list: props.softWare.os_list,
                download_url: props.softWare.download_url,
                icon_file_id: fileRes.file_id,
            });
            await set_file_owner({
                session_id: sessionId,
                fs_id: GLOBAL_SOFT_WARE_STORE_FS_ID,
                file_id: fileRes.file_id,
                owner_type: FILE_OWNER_TYPE_SOFT_WARE_STORE,
                owner_id: props.softWare.sw_id,
            });
            props.onChange();
        }
    };

    useEffect(() => {
        if (inEdit && editorRef.current != null) {
            editorRef.current.setContent(props.softWare.sw_desc);
        }
    }, [inEdit, editorRef.current, props.softWare.sw_desc]);

    return (
        <div>
            <div className={s.head}>
                <div className={s.left}>
                    <AsyncImage style={{ width: "80px", cursor: "pointer" }}
                        src={`fs://localhost/${GLOBAL_SOFT_WARE_STORE_FS_ID}/${props.softWare.icon_file_id}/icon.png`}
                        preview={false}
                        fallback={defaultIcon}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (props.canUpdate) {
                                changeIcon();
                            }
                        }}
                        useRawImg={false}
                    />
                </div>
                <div className={s.right}>
                    <Descriptions bordered style={{ width: "calc(100vw - 400px)" }}>
                        <Descriptions.Item label="名称">
                            <EditText editable={props.canUpdate} content={props.softWare.sw_name}
                                onChange={async value => {
                                    if (value.trim() == "") {
                                        return false;
                                    }
                                    try {
                                        const sessionId = await get_admin_session();
                                        await update_soft_ware({
                                            admin_session_id: sessionId,
                                            sw_id: props.softWare.sw_id,
                                            sw_name: value.trim(),
                                            sw_desc: props.softWare.sw_desc,
                                            cate_id: props.softWare.cate_id,
                                            weight: props.softWare.weight,
                                            recommend: props.softWare.recommend,
                                            os_list: props.softWare.os_list,
                                            download_url: props.softWare.download_url,
                                            icon_file_id: props.softWare.icon_file_id,
                                        });
                                        props.onChange();
                                        return true;
                                    } catch (e) {
                                        console.log(e);
                                        return false;
                                    }
                                }} showEditIcon />
                        </Descriptions.Item>
                        <Descriptions.Item label="权重">
                            <EditNumber editable={props.canUpdate} value={props.softWare.weight}
                                onChange={async value => {
                                    try {
                                        const sessionId = await get_admin_session();
                                        await update_soft_ware({
                                            admin_session_id: sessionId,
                                            sw_id: props.softWare.sw_id,
                                            sw_name: props.softWare.sw_name,
                                            sw_desc: props.softWare.sw_desc,
                                            cate_id: props.softWare.cate_id,
                                            weight: value,
                                            recommend: props.softWare.recommend,
                                            os_list: props.softWare.os_list,
                                            download_url: props.softWare.download_url,
                                            icon_file_id: props.softWare.icon_file_id,
                                        });
                                        props.onChange();
                                        return true;
                                    } catch (e) {
                                        console.log(e);
                                        return false;
                                    }
                                }} showEditIcon fixedLen={0} min={0} max={99} />
                        </Descriptions.Item>
                        <Descriptions.Item label="类别">
                            <EditSelect editable={props.canUpdate} curValue={props.softWare.cate_id}
                                itemList={props.cateList.map(item => ({
                                    value: item.cate_id,
                                    label: item.cate_name,
                                    color: "black",
                                }))} onChange={async value => {
                                    try {
                                        const sessionId = await get_admin_session();
                                        await update_soft_ware({
                                            admin_session_id: sessionId,
                                            sw_id: props.softWare.sw_id,
                                            sw_name: props.softWare.sw_name,
                                            sw_desc: props.softWare.sw_desc,
                                            cate_id: value as string,
                                            weight: props.softWare.weight,
                                            recommend: props.softWare.recommend,
                                            os_list: props.softWare.os_list,
                                            download_url: props.softWare.download_url,
                                            icon_file_id: props.softWare.icon_file_id,
                                        });
                                        props.onChange();
                                        return true;
                                    } catch (e) {
                                        console.log(e);
                                        return false;
                                    }
                                }} showEditIcon allowClear={false} />
                        </Descriptions.Item>
                        <Descriptions.Item label="推荐软件">
                            <Checkbox checked={props.softWare.recommend} disabled={!props.canUpdate} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                updateRecommend(e.target.checked);
                            }} />
                        </Descriptions.Item>
                        <Descriptions.Item label="操作系统" span={2}>
                            <Checkbox.Group options={[
                                {
                                    label: "windows",
                                    value: OS_WINDOWS,
                                },
                                {
                                    label: "mac",
                                    value: OS_MAC,
                                },
                                {
                                    label: "linux",
                                    value: OS_LINUX,
                                }
                            ]} disabled={!props.canUpdate}
                                value={props.softWare.os_list} onChange={values => updateOsList(values as number[])} />
                        </Descriptions.Item>
                        <Descriptions.Item label="下载地址" span={3}>
                            <EditText editable={props.canUpdate} content={props.softWare.download_url}
                                onChange={async value => {
                                    if (value.startsWith("https://") == false) {
                                        message.error("必须以https://开头");
                                        return false;
                                    }
                                    try {
                                        const sessionId = await get_admin_session();
                                        await update_soft_ware({
                                            admin_session_id: sessionId,
                                            sw_id: props.softWare.sw_id,
                                            sw_name: props.softWare.sw_name,
                                            sw_desc: props.softWare.sw_desc,
                                            cate_id: props.softWare.cate_id,
                                            weight: props.softWare.weight,
                                            recommend: props.softWare.recommend,
                                            os_list: props.softWare.os_list,
                                            download_url: value,
                                            icon_file_id: props.softWare.icon_file_id,
                                        });
                                        props.onChange();
                                        return true;
                                    } catch (e) {
                                        console.log(e);
                                        return false;
                                    }
                                }} showEditIcon onClick={() => shell_open(props.softWare.download_url)} />
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </div>
            <Card title="软件简介" bordered={false}
                extra={<>
                    {inEdit == false && (
                        <Button type="primary" disabled={!props.canUpdate} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setInEdit(true);
                        }}>编辑</Button>
                    )}
                    {inEdit == true && (
                        <Space size="middle">
                            <Button onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setInEdit(false);
                            }}>取消</Button>
                            <Button type="primary" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                updateDesc();
                            }}>保存</Button>
                        </Space>
                    )}
                </>}>
                {inEdit == false && (
                    <ReadOnlyEditor content={props.softWare.sw_desc} />
                )}
                {inEdit == true && (
                    <div className="_projectEditContext">
                        {editor}
                    </div>
                )}
            </Card>
        </div>
    );
};


const SoftWareList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [cateList, setCateList] = useState<SoftWareCateInfo[]>([]);
    const [curCateId, setCurCateId] = useState("");

    const [softWareList, setSoftWareList] = useState<SoftWareInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [showAddModal, setShowAddModal] = useState(false);

    const loadCateList = async () => {
        const res = await request(list_cate({}));
        setCateList(res.cate_list);
        if (res.cate_list.map(item => item.cate_id).includes(curCateId) == false) {
            if (res.cate_list.length == 0) {
                setCurCateId("");
                setCurPage(0);
            } else {
                setCurCateId(res.cate_list[0].cate_id);
                setCurPage(0);
            }
        }
    };

    const loadSoftWareList = async () => {
        const res = await request(list_soft_ware({
            list_param: {
                filterby_os_type: false,
                os_type: 0,
                filter_by_cate_id: true,
                cate_id: curCateId,
                filter_by_recommend: false,
                recommend: false,
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setSoftWareList(res.soft_ware_list);
    };

    const onUpdateSoftWare = async (swId: string) => {
        const res = await request(get_soft_ware({ sw_id: swId }));
        const tmpList = softWareList.slice();
        const index = tmpList.findIndex(item => item.sw_id == swId);
        if (index != -1) {
            tmpList[index] = res.soft_ware;
            setSoftWareList(tmpList);
        }
    };

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadCateList();
    }, []);

    useEffect(() => {
        if (curCateId == "") {
            setSoftWareList([]);
        } else {
            loadSoftWareList();
        }
    }, [curCateId, curPage]);

    return (
        <Card title="软件列表"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}
            extra={
                <Form layout="inline">
                    <Form.Item label="类别">
                        <Select value={curCateId} onChange={value => {
                            setCurCateId(value);
                            setCurPage(0);
                        }} style={{ width: "100px" }}>
                            {cateList.map(item => (
                                <Select.Option key={item.cate_id} value={item.cate_id}>{item.cate_name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" icon={<PlusOutlined />} disabled={!(permInfo?.sw_store_perm.add_soft_ware ?? false)}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowAddModal(true);
                            }}>添加软件</Button>
                    </Form.Item>
                </Form>
            }
        >
            <List rowKey="sw_id" dataSource={softWareList}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true, showSizeChanger: false }}
                renderItem={item => (
                    <List.Item>
                        <SoftWareItem softWare={item} canUpdate={permInfo?.sw_store_perm.update_soft_ware ?? false}
                            cateList={cateList} onChange={() => onUpdateSoftWare(item.sw_id)} />
                    </List.Item>
                )} />
            {showAddModal == true && curCateId != "" && (
                <AddSoftWareModal cateId={curCateId} onCancel={() => setShowAddModal(false)}
                    onOk={() => {
                        setShowAddModal(false);
                        if (curPage == 0) {
                            loadSoftWareList();
                        } else {
                            setCurPage(0);
                        }
                    }} />
            )}
        </Card>
    );
};


export default SoftWareList;