//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { CommandResult, ContainerInfo } from "./components/types";
import ResolveContainer from "./components/ResolveContainer";
import StartContainer from "./components/StartContainer";
import BuildImage from "./components/BuildImage";
import { Command } from '@tauri-apps/api/shell';
import { message } from "antd";

const DevcPrepare = () => {
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const repoId = urlParams.get("repoId") ?? "";
    const repoPath = urlParams.get("repoPath") ?? "";
    const devType = urlParams.get("type") ?? "vscode";

    const [imageExist, setImageExist] = useState<boolean | null>(null);
    const [containerInfo, setContainerInfo] = useState<ContainerInfo | null>(null);

    const checkImageExist = async () => {
        let image = "";
        if (devType == "vscode") {
            image = "ccr.ccs.tencentyun.com/linksaas/code-server:latest";
        } else if (devType == "jupyter") {
            image = "ccr.ccs.tencentyun.com/linksaas/jupyterhub:latest"
        } else if (devType == "rstudio") {
            image = "ccr.ccs.tencentyun.com/linksaas/rstudio:latest";
        }
        const cmd = Command.sidecar("bin/devc", ["image", "exist", image]);
        const output = await cmd.execute();
        const result = JSON.parse(output.stdout) as CommandResult;
        console.log(result);
        if (result.success) {
            setImageExist(result.data ?? false);
        } else {
            message.error("未安装/启动Docker");
        }
    };

    useEffect(() => {
        if (imageExist == null) {
            checkImageExist()
        }
    }, [imageExist]);


    return (
        <>
            {imageExist == false && (<BuildImage onOk={() => checkImageExist()} devType={devType} />)}
            {imageExist == true && (
                <>
                    {containerInfo == null && (<ResolveContainer repoId={repoId} repoPath={repoPath} devType={devType} onOk={info => setContainerInfo(info)} />)}
                    {containerInfo != null && (<StartContainer containerId={containerInfo.containerId} serverPort={containerInfo.serverPort} />)}
                </>
            )}
        </>
    )
};

export default DevcPrepare;