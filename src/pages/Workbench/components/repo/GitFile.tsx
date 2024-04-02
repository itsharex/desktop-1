import React, {  useState } from "react";
import { Button, Popover, Space } from "antd";
import {  MoreOutlined} from "@ant-design/icons";
import { useStores } from "@/hooks";
import { resolve } from '@tauri-apps/api/path';
import { start, type WidgetInfo } from "@/api/widget";
import { download_file, get_cache_file, GLOBAL_WIDGET_STORE_FS_ID } from "@/api/fs";
import { check_unpark, get_min_app_path, unpack_min_app } from '@/api/min_app';
import { uniqId } from "@/utils/utils";
import OpenGitFileModal from "./OpenGitFileModal";

interface GitFileProps {
    basePath: string;
    curDirList: string[];
    curFileName: string;
    widgetList: WidgetInfo[];
}

const GitFile = (props: GitFileProps) => {
    const userStore = useStores('userStore');

    const [showModal, setShowModal] = useState(false);
    const [hover, setHover] = useState(false);

    const findWidget = (): WidgetInfo | null => {
        for (const widget of props.widgetList) {
            if (widget.file_list.includes(props.curFileName)) {
                return widget;
            }
        }
        const pos = props.curFileName.lastIndexOf(".")
        if (pos == -1) {
            return null;
        }
        const ext = props.curFileName.substring(pos + 1);
        for (const widget of props.widgetList) {
            if (widget.extension_list.includes(ext)) {
                return widget;
            }
        }
        return null;
    }

    const startView = async () => {
        const widget = findWidget();
        if (widget == null) {
            return;
        }
        //下载文件
        const res = await get_cache_file(GLOBAL_WIDGET_STORE_FS_ID, widget.file_id, "content.zip");
        let localFilePath = "";
        if (res.exist_in_local) {
            localFilePath = res.local_path;
        }
        if (localFilePath == "") {
            const downloadRes = await download_file(userStore.sessionId, GLOBAL_WIDGET_STORE_FS_ID, widget.file_id, "", "content.zip");
            localFilePath = downloadRes.local_path;
        }
        //解压文件
        const ok = await check_unpark(GLOBAL_WIDGET_STORE_FS_ID, widget.file_id);
        if (!ok) {
            await unpack_min_app(GLOBAL_WIDGET_STORE_FS_ID, widget.file_id, "");
        }
        const path = await get_min_app_path(GLOBAL_WIDGET_STORE_FS_ID, widget.file_id);
        const filePath = await resolve(props.basePath, ...props.curDirList, props.curFileName);
        await start(`gw:${uniqId()}`, filePath, path, filePath);
    };

    return (
        <div onMouseEnter={e => {
            e.stopPropagation();
            e.preventDefault();
            setHover(true);
        }} onMouseLeave={e => {
            e.stopPropagation();
            e.preventDefault();
            setHover(false);
        }}>
            <Space>
                <Button type="link" style={{ minWidth: 0, padding: "0px 0px", fontSize: "16px", width: "200px", overflow: "hidden", textAlign: "left" }}
                    disabled={findWidget() == null}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        startView();
                    }} title={props.curFileName}>{props.curFileName}</Button>
                {hover == true && (
                    <Popover placement="bottom" trigger="click" content={
                        <div style={{ padding: "10px 10px" }}>
                            <a onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowModal(true);
                            }}>选择打开方式</a>
                        </div>
                    }>
                        <MoreOutlined />
                    </Popover>
                )}
            </Space>
            {showModal == true && (
                <OpenGitFileModal basePath={props.basePath} curDirList={props.curDirList} curFileName={props.curFileName}
                    onClose={() => setShowModal(false)} widgetList={props.widgetList} />
            )}
        </div>
    );
};

export default GitFile;