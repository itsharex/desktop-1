//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { list_app as list_user_app, save_app_list } from "@/api/user_app";
import DownloadProgressModal from "@/components/MinApp/DownloadProgressModal";
import { get_app, type AppInfo } from "@/api/appstore";
import { check_unpark, get_min_app_path, start as start_app } from '@/api/min_app';
import { GLOBAL_APPSTORE_FS_ID, get_cache_file } from "@/api/fs";
import { request } from "@/utils/request";

interface DownloadInfo {
    fsId: string;
    fileId: string;
}

const StartMinApp = () => {
    const appStore = useStores('appStore');
    const userStore = useStores('userStore');

    const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
    const [showDownload, setShowDownload] = useState<DownloadInfo | null>(null);

    const openUserApp = async (fsId: string, fileId: string) => {
        if (appInfo == null) {
            return;
        }

        const path = await get_min_app_path(fsId, fileId);
        await start_app({
            user_id: userStore.userInfo.userId,
            user_display_name: userStore.userInfo.displayName,
            label: "minApp:" + appInfo.app_id,
            title: `${appInfo.base_info.app_name}(微应用)`,
            path: path,
        }, appInfo?.app_perm);

        //清空openMinAppId
        appStore.openMinAppId = "";
    };

    const preOpenUserApp = async () => {
        //检查文件是否已经下载
        const res = await get_cache_file(GLOBAL_APPSTORE_FS_ID, appInfo?.file_id ?? "", "content.zip");
        if (res.exist_in_local == false) {
            setShowDownload({
                fsId: GLOBAL_APPSTORE_FS_ID,
                fileId: appInfo?.file_id ?? "",
            });
            return;
        }
        //检查是否已经解压zip包
        const ok = await check_unpark(GLOBAL_APPSTORE_FS_ID, appInfo?.file_id ?? "");
        if (!ok) {
            setShowDownload({
                fsId: GLOBAL_APPSTORE_FS_ID,
                fileId: appInfo?.file_id ?? "",
            });
            return;
        }
        //打开微应用
        await openUserApp(GLOBAL_APPSTORE_FS_ID, appInfo?.file_id ?? "");
    }

    const startMinApp = async () => {
        if (appInfo == null) {
            return;
        }

        //安装应用
        const appList = await list_user_app();
        if (appStore.openMinAppId == "") {
            return;
        }
        if (!appList.includes(appStore.openMinAppId)) {
            appList.push(appStore.openMinAppId);
            await save_app_list(appList);
        }
        //打开应用
        await preOpenUserApp();
    };

    const loadAppInfo = async () => {
        if (appStore.openMinAppId == "") {
            return;
        }
        const res = await request(get_app({
            app_id: appStore.openMinAppId,
            session_id: userStore.sessionId,
        }));
        setAppInfo(res.app_info);
    };

    useEffect(() => {
        startMinApp();
    }, [appInfo]);

    useEffect(() => {
        if (appStore.openMinAppId == "") {
            setAppInfo(null);
            setShowDownload(null);
        } else {
            loadAppInfo();
        }
    }, [appStore.openMinAppId]);

    return (
        <div>
            {showDownload != null && (
                <DownloadProgressModal fsId={showDownload.fsId} fileId={showDownload.fileId}
                    onCancel={() => setShowDownload(null)}
                    onOk={() => {
                        setShowDownload(null);
                        openUserApp(showDownload.fsId, showDownload.fileId);
                    }} />
            )}
        </div>
    );
};

export default observer(StartMinApp);