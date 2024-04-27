//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { useStores } from "@/hooks";
import { List } from "antd";
import React, { useEffect } from "react";
import { observer } from 'mobx-react';
import StatefulsetCard from "./components/StatefulsetCard";

const StatefulsetListPanel = () => {
    const cloudStore = useStores('cloudStore');

    useEffect(() => {
        cloudStore.loadStatefulsetList().then(() => cloudStore.loadStatefulsetPermList());
    }, [cloudStore.curNameSpace]);

    return (
        <List dataSource={cloudStore.statefulsetList} renderItem={item => (
            <List.Item key={item.metadata?.name ?? ""} style={{ border: "none" }}>
                <StatefulsetCard statefulset={item} />
            </List.Item>
        )} />
    );
};

export default observer(StatefulsetListPanel);