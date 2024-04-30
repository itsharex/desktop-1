//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import { useStores } from "@/hooks";
import { observer } from 'mobx-react';
import DeploymentListPanel from "./DeploymentListPanel";
import StatefulsetListPanel from "./StatefulsetListPanel";

const K8sPage = () => {
    const cloudStore = useStores('cloudStore');

    return (
        <div>
            {cloudStore.curNameSpace != "" && (
                <div style={{ height: "calc(100vh - 166px)", overflowY: "scroll" }}>
                    <DeploymentListPanel />
                    <StatefulsetListPanel />
                </div>
            )}
        </div>
    );
};

export default observer(K8sPage);