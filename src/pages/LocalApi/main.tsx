//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from "react";
import { Button, Card, ConfigProvider, message, Space } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { createRoot } from 'react-dom/client';
import 'moment/dist/locale/zh-cn';
import '@/styles/global.less';
import { BrowserRouter, useLocation } from "react-router-dom";
import 'swagger-ui-react/swagger-ui.css';
import SwaggerUI from 'swagger-ui-react';
import { PROTO } from "./proto";
import { writeText } from '@tauri-apps/api/clipboard';

const Swagger = () => {
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const portStr = urlParams.get("port") ?? "8001";
    const tokenStr = urlParams.get("token") ?? "";

    return (
        <Card title="本地接口" extra={
            <Space>
                访问令牌
                {tokenStr}
                <Button type="link" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    writeText(tokenStr).then(() => message.info("复制成功"));
                }}>复制</Button>
            </Space>
        } bodyStyle={{ height: "calc(100vh - 40px)", overflowY: "scroll" }}>
            <SwaggerUI spec={PROTO.replace("__PORT__", portStr)} />
        </Card>
    );
}

const App = () => {
    return (
        <ConfigProvider locale={zhCN}>
            <BrowserRouter>
                <Swagger />
            </BrowserRouter>
        </ConfigProvider>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);