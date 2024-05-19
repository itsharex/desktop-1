//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import type { AppInfo } from "@/api/appstore";
import { agree_app, cancel_agree_app, get_app, install_app } from "@/api/appstore";
import { Button, Card, Descriptions, Dropdown, Modal, Space } from "antd";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { CloseOutlined, DownloadOutlined, HeartTwoTone } from "@ant-design/icons";
import AppPermPanel from "@/pages/Admin/AppAdmin/components/AppPermPanel";
import { ReadOnlyEditor } from "@/components/Editor";
import { list_app as list_user_app, save_app_list } from "@/api/user_app";
import { open as open_shell } from '@tauri-apps/api/shell';



const AppStoreDetailModal = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');
    const pubResStore = useStores('pubResStore');

    const [myAppIdList, setMyAppIdList] = useState<string[]>([]);

    const [appInfo, setAppInfo] = useState<AppInfo | null>(null);

    const loadMyAppIdList = async () => {
        const res = await list_user_app();
        setMyAppIdList(res);
    };

    const loadAppInfo = async () => {
        const res = await request(get_app({
            app_id: pubResStore.showAppId,
            session_id: userStore.sessionId,
        }));
        setAppInfo(res.app_info);
    };

    const installUserApp = async () => {
        if (appInfo == null) {
            return;
        }
        const tmpList = myAppIdList.slice();
        if (tmpList.includes(appInfo.app_id) == false) {
            tmpList.push(appInfo.app_id);
            setMyAppIdList(tmpList);
            await save_app_list(tmpList);
            await install_app({ app_id: appInfo.app_id });
            setAppInfo({ ...appInfo, install_count: appInfo.install_count + 1 });
            pubResStore.incAppDataVersion();
        }

    };

    const removeUserApp = async () => {
        if (appInfo == null) {
            return;
        }
        const tmpList = myAppIdList.filter(item => item != appInfo.app_id);
        await save_app_list(tmpList);
        setMyAppIdList(tmpList);
    };

    const agreeApp = async (appId: string, newAgree: boolean) => {
        if (appInfo == null) {
            return;
        }
        if (newAgree) {
            await request(agree_app({
                session_id: userStore.sessionId,
                app_id: appId,
            }));
        } else {
            await request(cancel_agree_app({
                session_id: userStore.sessionId,
                app_id: appId,
            }));
        }
        let newAgreeCount = appInfo.agree_count;
        if (newAgree) {
            newAgreeCount = appInfo.agree_count + 1;
        } else {
            if (appInfo.agree_count > 0) {
                newAgreeCount = appInfo.agree_count - 1;
            }
        }

        setAppInfo({ ...appInfo, agree_count: newAgreeCount, my_agree: newAgree });
        pubResStore.incAppDataVersion();
    };

    useEffect(() => {
        if (pubResStore.showAppId != "") {
            loadAppInfo();
            loadMyAppIdList();
        }
    }, [pubResStore.showAppId]);


    return (
        <Modal open width={1000} footer={null} closable={false}>
            <Card title={
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{appInfo?.base_info.app_name ?? ""}</h2>
            } bordered={false}
                bodyStyle={{ height: "calc(100vh - 280px)", overflowY: "scroll" }}
                extra={
                    <Space style={{ fontSize: "18px" }} size="middle">
                        {appInfo != null && (
                            <>
                                <div><DownloadOutlined />&nbsp;{appInfo.install_count}</div>
                                <div onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    if (userStore.sessionId != "") {
                                        agreeApp(appInfo.app_id, !appInfo.my_agree);
                                    }
                                }} style={{ margin: "0px 20px" }}>
                                    <a style={{ cursor: userStore.sessionId == "" ? "default" : "pointer" }}>
                                        <HeartTwoTone twoToneColor={appInfo.my_agree ? ["red", "red"] : ["#e4e4e8", "#e4e4e8"]} />
                                    </a>
                                    &nbsp;{appInfo.agree_count}
                                </div>
                                {myAppIdList.includes(appInfo.app_id) == true && (
                                    <Dropdown.Button type="primary" menu={{
                                        items: [
                                            {
                                                key: "remove",
                                                label: <div style={{ padding: "10px 10px", color: "red" }}>卸载应用</div>,
                                                onClick: () => removeUserApp(),
                                            }
                                        ]
                                    }} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        appStore.openMinAppId = pubResStore.showAppId;
                                    }}>运行应用</Dropdown.Button>
                                )}
                                {myAppIdList.includes(appInfo.app_id) == false && (
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        installUserApp();
                                    }}>安装应用</Button>
                                )}
                            </>
                        )}
                        <Button type="text" icon={<CloseOutlined style={{ fontSize: "20px" }} />} title="关闭"
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                pubResStore.showAppId = "";
                            }} />
                    </Space>
                }>
                <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "10px" }}>应用信息</h2>
                {appInfo != null && (
                    <Descriptions bordered labelStyle={{ width: "100px" }}>
                        <Descriptions.Item label="一级分类">{appInfo.major_cate.cate_name}</Descriptions.Item>
                        <Descriptions.Item label="二级分类">{appInfo.minor_cate.cate_name}</Descriptions.Item>
                        <Descriptions.Item label="三级分类">{appInfo.sub_minor_cate.cate_name}</Descriptions.Item>
                        <Descriptions.Item span={3} label="应用描述">
                            <ReadOnlyEditor content={appInfo.base_info.app_desc} />
                        </Descriptions.Item>
                        <Descriptions.Item span={3} label="应用权限">
                            <AppPermPanel disable={true} showTitle={false} onChange={() => { }} perm={appInfo.app_perm} />
                        </Descriptions.Item>
                        {appInfo.base_info.src_url !== "" && (
                            <Descriptions.Item label="源代码">
                                <a onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    open_shell(appInfo?.base_info.src_url ?? "");
                                }}>{appInfo.base_info.src_url}</a>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Card>
        </Modal>
    );
};

export default observer(AppStoreDetailModal);