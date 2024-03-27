import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, message, Modal, Popover, Table, Tag } from "antd";
import { useStores } from "@/hooks";
import type { AdminPermInfo } from '@/api/admin_auth';
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import AddWidgetModal from "./components/AddWidgetModal";
import type { WidgetInfo } from "@/api/widget";
import { list_widget, get_widget } from "@/api/widget";
import type { ColumnsType } from 'antd/es/table';
import { GLOBAL_WIDGET_STORE_FS_ID } from "@/api/fs";
import AsyncImage from "@/components/AsyncImage";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { request } from "@/utils/request";
import { EditText } from "@/components/EditCell/EditText";
import { EditNumber } from "@/components/EditCell/EditNumber";
import moment from "moment";
import { update_widget, update_weight, remove_widget } from "@/api/widget_admin";
import UpdateExtListModal from "./components/UpdateExtListModal";
import UpdateFileListModal from "./components/UpdateFileListModal";
import { MoreOutlined } from "@ant-design/icons";
import UpdateFileModal from "./components/UpdateFileModal";


const WidgetList = () => {
    const appStore = useStores('appStore');

    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [widgetList, setWidgetList] = useState<WidgetInfo[]>([]);
    const [updateExtListWidgetInfo, setUpdateExtListWidgetInfo] = useState<WidgetInfo | null>(null);
    const [updateFileListWidgetInfo, setUpdateFileListWidgetInfo] = useState<WidgetInfo | null>(null);
    const [removeWidgetInfo, setRemoveWidgetInfo] = useState<WidgetInfo | null>(null);
    const [updateFileWidgetInfo, setUpdateFileWidgetInfo] = useState<WidgetInfo | null>(null);

    const loadWidgetList = async () => {
        const res = await request(list_widget());
        setWidgetList(res.widget_list);
    };

    const onUpdateWidget = async (widgetId: string) => {
        const tmpList = widgetList.slice();
        const index = tmpList.findIndex(item => item.widget_id == widgetId);
        if (index == -1) {
            return;
        }
        const res = await request(get_widget({ widget_id: widgetId }));
        tmpList[index] = res.widget;
        setWidgetList(tmpList);
    };

    const removeWidget = async () => {
        if (removeWidgetInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_widget({
            admin_session_id: sessionId,
            widget_id: removeWidgetInfo.widget_id,
        }));
        const tmpList = widgetList.filter(item => item.widget_id != removeWidgetInfo.widget_id);
        setWidgetList(tmpList);
        setRemoveWidgetInfo(null);
        message.info("删除成功");
    };

    const columns: ColumnsType<WidgetInfo> = [
        {
            title: "图标",
            width: 80,
            render: (_, row: WidgetInfo) => {
                let iconUrl = "";
                if (appStore.isOsWindows) {
                    iconUrl = `https://fs.localhost/${GLOBAL_WIDGET_STORE_FS_ID}/${row.icon_file_id}/icon.png`;
                } else {
                    iconUrl = `fs://localhost/${GLOBAL_WIDGET_STORE_FS_ID}/${row.icon_file_id}/icon.png`;
                }
                return (
                    <AsyncImage style={{ width: "60px", cursor: "pointer", marginRight: "20px" }}
                        src={iconUrl}
                        preview={false}
                        fallback={defaultIcon}
                        useRawImg={false}
                    />
                );
            }
        },
        {
            title: "名称",
            width: 200,
            render: (_, row: WidgetInfo) => (
                <EditText editable={permInfo?.widget_store_perm.update_widget ?? false} content={row.widget_name}
                    onChange={async (value) => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_widget({
                                admin_session_id: sessionId,
                                widget_id: row.widget_id,
                                widget_name: value.trim(),
                                extension_list: row.extension_list,
                                file_list: row.file_list,
                            }));
                            const tmpList = widgetList.slice();
                            const index = tmpList.findIndex(item => item.widget_id == row.widget_id);
                            if (index != -1) {
                                tmpList[index].widget_name = value.trim();
                                setWidgetList(tmpList);
                            }
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon />
            ),
        },
        {
            title: "权重",
            width: 150,
            render: (_, row: WidgetInfo) => (
                <EditNumber editable={permInfo?.widget_store_perm.update_widget ?? false} value={row.weight}
                    onChange={async (value) => {
                        if (value < 0 || value > 99) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_weight({
                                admin_session_id: sessionId,
                                widget_id: row.widget_id,
                                weight: value,
                            }));
                            const tmpList = widgetList.slice();
                            const index = tmpList.findIndex(item => item.widget_id == row.widget_id);
                            if (index != -1) {
                                tmpList[index].weight = value;
                                setWidgetList(tmpList);
                            }
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "文件扩展匹配",
            width: 300,
            render: (_, row: WidgetInfo) => (
                <>
                    {row.extension_list.length == 0 && (
                        "未设置文件扩展匹配"
                    )}
                    <div style={{ width: "280px", display: "flex", flexWrap: "wrap", maxHeight: "200px", overflowY: "scroll" }}>
                        {row.extension_list.map(ext => (
                            <Tag key={ext} style={{ margin: "4px 4px" }}>{ext}</Tag>
                        ))}
                    </div>
                    {(permInfo?.widget_store_perm.update_widget ?? false) == true && (
                        <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setUpdateExtListWidgetInfo(row);
                        }}>修改扩展匹配</Button>
                    )}
                </>
            ),
        },
        {
            title: "文件精确匹配",
            width: 300,
            render: (_, row: WidgetInfo) => (
                <>
                    {row.file_list.length == 0 && (
                        "未设置文件精确匹配"
                    )}
                    <div style={{ width: "280px", display: "flex", flexWrap: "wrap", maxHeight: "200px", overflowY: "scroll" }}>
                        {row.file_list.map(fileName => (
                            <Tag key={fileName} style={{ margin: "4px 4px" }}>{fileName}</Tag>
                        ))}
                    </div>
                    {(permInfo?.widget_store_perm.update_widget ?? false) == true && (
                        <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setUpdateFileListWidgetInfo(row);
                        }}>修改精确匹配</Button>
                    )}
                </>
            ),
        },
        {
            title: "操作",
            width: 100,
            render: (_, row: WidgetInfo) => (
                <>
                    <Button type="link" disabled={!(permInfo?.widget_store_perm.remove_widget ?? false)} style={{ minWidth: 0, padding: "0px 0px", marginRight: "10px" }}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setUpdateFileWidgetInfo(row);
                        }}>更新文件</Button>
                    <Popover trigger="click" placement="bottom" content={
                        <div style={{ padding: "10px 10px" }}>
                            <Button type="link" disabled={!(permInfo?.widget_store_perm.remove_widget ?? false)} danger style={{ minWidth: 0, padding: "0px 0px" }}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setRemoveWidgetInfo(row);
                                }}>删除</Button>
                        </div>
                    }>
                        <MoreOutlined />
                    </Popover>

                </>
            ),
        },
        {
            title: "创建时间",
            width: 120,
            render: (_, row: WidgetInfo) => moment(row.create_time).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "更新时间",
            width: 120,
            render: (_, row: WidgetInfo) => moment(row.update_time).format("YYYY-MM-DD HH:mm"),
        }
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadWidgetList();
    }, []);

    return (
        <Card title="Git插件列表" style={{ height: "calc(100vh - 40px)", overflowY: "hidden" }}
            extra={
                <Button type="primary" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowAddModal(true);
                }} disabled={!(permInfo?.widget_store_perm.add_widget ?? false)}>增加插件</Button>
            }>
            <Table rowKey="widget_id" columns={columns} dataSource={widgetList} pagination={false} scroll={{ y: "calc(100vh - 150px)", x: 1300 }} />
            {showAddModal == true && (
                <AddWidgetModal onCancel={() => setShowAddModal(false)}
                    onOk={() => {
                        loadWidgetList();
                        setShowAddModal(false);
                    }} />
            )}
            {updateExtListWidgetInfo != null && (
                <UpdateExtListModal widgetInfo={updateExtListWidgetInfo} onCancel={() => setUpdateExtListWidgetInfo(null)}
                    onOk={() => {
                        onUpdateWidget(updateExtListWidgetInfo.widget_id);
                        setUpdateExtListWidgetInfo(null);
                    }} />
            )}
            {updateFileListWidgetInfo != null && (
                <UpdateFileListModal widgetInfo={updateFileListWidgetInfo} onCancel={() => setUpdateFileListWidgetInfo(null)}
                    onOk={() => {
                        onUpdateWidget(updateFileListWidgetInfo.widget_id);
                        setUpdateFileListWidgetInfo(null);
                    }} />
            )}
            {updateFileWidgetInfo != null && (
                <UpdateFileModal widgetId={updateFileWidgetInfo.widget_id} onCancel={()=>setUpdateFileWidgetInfo(null)}
                onOk={()=>{
                    onUpdateWidget(updateFileWidgetInfo.widget_id);
                    setUpdateFileWidgetInfo(null);
                }} />
            )}
            {removeWidgetInfo != null && (
                <Modal open title="删除插件"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveWidgetInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeWidget();
                    }}>
                    是否删除插件&nbsp;{removeWidgetInfo.widget_name}&nbsp;?
                </Modal>
            )}
        </Card>
    );
};

export default observer(WidgetList);