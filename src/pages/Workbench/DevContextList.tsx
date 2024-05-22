//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only


import React, { useEffect, useState } from "react";
import { Card, List, message } from "antd";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import LaunchRepoModal from "./components/LaunchRepoModal";
import md5 from "md5";
import { WebviewWindow, appWindow } from '@tauri-apps/api/window';

interface DevProvider {
    id: string;
    icon: React.ReactNode;
}

export interface DevContextListProps {
    hasDocker: boolean | null;
}

const DevContextList = (props: DevContextListProps) => {

    const [runProviderId, setRunProviderId] = useState<"" | "vscode" | "jupyter" | "rstudio">("");
    const [targetDir, setTargetDir] = useState("");

    const selTargetDir = async () => {
        const selected = await open_dialog({
            title: "选择代码目录",
            directory: true,
        });
        if (Array.isArray(selected) || selected == null) {
            setTargetDir("");
        } else {
            setTargetDir(selected);
        }
    };

    const runOtherProvider = async () => {
        const pos = await appWindow.innerPosition();
        const repoId = `${runProviderId}:${md5(targetDir)}`;
        const label = `devc:${repoId}`;
        const oldWin = WebviewWindow.getByLabel(label)
        if (oldWin != null) {
            oldWin.setAlwaysOnTop(true);
            setTimeout(() => oldWin.setAlwaysOnTop(false), 1000);
            message.warn("已启动开发环境");
            return;
        }
        new WebviewWindow(label, {
            url: `devc.html?repoId=${encodeURIComponent(repoId)}&repoPath=${encodeURIComponent(targetDir)}&type=${runProviderId}`,
            width: 800,
            minWidth: 800,
            height: 600,
            minHeight: 600,
            center: true,
            title: `开发环境(${targetDir})`,
            resizable: true,
            x: pos.x + Math.floor(Math.random() * 200),
            y: pos.y + Math.floor(Math.random() * 200),
        });
    };

    const devProviderList: DevProvider[] = [
        {
            id: "vscode",
            icon: <img src="/static/images/devc/vscode.ico" width="128px" height="128px" />,
        },
        {
            id: "jupyter",
            icon: <img src="/static/images/devc/jupyter.ico" width="128px" height="128px" />,
        },
        {
            id: "rstudio",
            icon: <img src="/static/images/devc/rstudio.png" width="128px" height="128px" />,
        },
    ];


    useEffect(() => {
        if (["jupyter", "rstudio"].includes(runProviderId) && targetDir != "") {
            runOtherProvider().then(() => {
                setRunProviderId("");
                setTargetDir("");
            });
        }
    }, [runProviderId, targetDir]);

    return (
        <div>
            <List rowKey="id" dataSource={devProviderList}
                grid={{ gutter: 16 }} pagination={false}
                renderItem={item => (
                    <List.Item>
                        <Card title={item.id} bodyStyle={{ width: "148px", height: "148px", overflow: "hidden", padding: "10px 10px" }}
                            style={{ cursor: props.hasDocker ? "pointer" : undefined }} headStyle={{ fontSize: "16px", fontWeight: 700, backgroundColor: "#eee" }}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (props.hasDocker == true) {
                                    setRunProviderId(item.id as "" | "vscode" | "jupyter" | "rstudio");
                                    setTargetDir("");
                                    selTargetDir();
                                }
                            }}>
                            {item.icon}
                        </Card>
                    </List.Item>
                )} />
            {runProviderId == "vscode" && targetDir != "" && (
                <LaunchRepoModal repo={{
                    id: "vscode:" + md5(targetDir),
                    name: targetDir,
                    path: targetDir,
                }} onClose={() => {
                    setRunProviderId("");
                    setTargetDir("");
                }} />
            )}
        </div>
    );
};

export default DevContextList;