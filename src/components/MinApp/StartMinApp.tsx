import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { list as list_user_app, add as add_user_app } from "@/api/user_app";
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
            project_id: "",
            project_name: "",
            member_user_id: userStore.userInfo.userId,
            member_display_name: userStore.userInfo.displayName,
            token_url: "",
            label: "minApp:" + appInfo.app_id,
            title: `${appInfo.base_info.app_name}(微应用)`,
            path: path,
        }, appInfo?.app_perm);
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
            await add_user_app(appStore.openMinAppId);
        }
        //打开应用
        await preOpenUserApp();

        //清空openMinAppId
        appStore.openMinAppId = "";
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

    return (<>
        {showDownload != null && (
            <DownloadProgressModal fsId={showDownload.fsId} fileId={showDownload.fileId}
                onCancel={() => setShowDownload(null)}
                onOk={() => {
                    setShowDownload(null);
                    openUserApp(showDownload.fsId, showDownload.fileId);
                }} />
        )}
    </>);
};

export default observer(StartMinApp);