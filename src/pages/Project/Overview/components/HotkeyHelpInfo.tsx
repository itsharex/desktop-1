//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Descriptions } from "antd";
import React from "react";

const HotkeyHelpInfo = () => {
    return (
        <Descriptions bordered labelStyle={{ width: "100px" }} column={1}>
            <Descriptions.Item label="alt+0">跳转到 内容面板</Descriptions.Item>
            <Descriptions.Item label="alt+1">跳转到 工作计划</Descriptions.Item>
            <Descriptions.Item label="alt+2">跳转到 项目文档</Descriptions.Item>
            <Descriptions.Item label="alt+3">跳转到 信息面板</Descriptions.Item>
            <Descriptions.Item label="alt+4">跳转到 静态网页</Descriptions.Item>
            <Descriptions.Item label="alt+5">跳转到 项目文件</Descriptions.Item>
            <Descriptions.Item label="alt+6">跳转到 接口集合</Descriptions.Item>
            <Descriptions.Item label="alt+9">跳转到 我的工作</Descriptions.Item>
            <Descriptions.Item label="alt+c">打开/关闭 项目沟通</Descriptions.Item>
            <Descriptions.Item label="alt+i">查看 项目知识点</Descriptions.Item>
            <Descriptions.Item label="alt+r">查看 项目需求列表</Descriptions.Item>
            <Descriptions.Item label="alt+t">查看 所有任务</Descriptions.Item>
            <Descriptions.Item label="alt+b">查看 所有缺陷</Descriptions.Item>
            <Descriptions.Item label="alt+e">查看 工作记录</Descriptions.Item>
            <Descriptions.Item label="alt+h">显示/隐藏 快捷键帮助</Descriptions.Item>

            <Descriptions.Item label="ctrl+n w">创建 工作计划</Descriptions.Item>
            <Descriptions.Item label="ctrl+n d">创建 项目文档</Descriptions.Item>
            <Descriptions.Item label="ctrl+n o">创建 信息面板</Descriptions.Item>
            <Descriptions.Item label="ctrl+n p">创建 静态网页</Descriptions.Item>
            <Descriptions.Item label="ctrl+n f">创建 文件</Descriptions.Item>
            <Descriptions.Item label="ctrl+n r">创建 需求</Descriptions.Item>
            <Descriptions.Item label="ctrl+n t">创建 任务</Descriptions.Item>
            <Descriptions.Item label="ctrl+n b">创建 缺陷</Descriptions.Item>
        </Descriptions>
    );
};

export default HotkeyHelpInfo;