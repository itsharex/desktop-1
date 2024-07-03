//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import { Button, Modal } from "antd";

const TIPS = [
    "登录后，可使用项目和团队管理功能。",
    "在vscode里面安装linksass扩展后，可在vscode里面查看任务/缺陷，访问知识库和打开微应用。",
    "本地仓库除了可以增加本地已存在的Git仓库，也可以克隆远程Git仓库。",
    "通过本地仓库的统计数据功能，对Git提交情况进行分析。",
    "登录后，可以关联本地仓库和项目。",
    "在项目中，可以使用快捷键简化操作，通过快捷键alt+h获取快捷键列表。",
    "在项目中，可以设置项目风险检测规则，可以对重复打开任务/缺陷，任务/缺陷依赖过多，任务/缺陷反复打开进行预警。",
    "在SSH密钥管理中，可以生成SSH密钥对。",
    "在团队中，可以关闭日报/周报/个人目标这些功能。",
    "在本地安装Docker引擎后，本地仓库支持快速构建开发环境。",
    "在项目中，可以通过事件订阅功能，把工作事件发布到钉钉，企业微信和飞书。",
    "本地仓库中，可以直接查看Git仓库工作目录中文件的内容。",
    "通过微应用，可以快捷的访问主流数据库和Linux服务器。",
    "通过Docker模板可以快速启动Docker Compose配置文件。",
    "在项目工作计划中，支持列表/看板模式，也支持甘特图，燃尽图，项目总结等功能。",
    "在项目需求管理中，可以通过四象限分析和KANO分析来确定需求的优先级。",
    "任务/缺陷可以作为标签形式，浮动在桌面上。",
    "在项目中，可以接入主流代码仓库的webhook，并把Git事件关联到内部成员。",
    "在项目中，被删除的数据可以通过回收站进行恢复。",
    "在团队中，可以创建讨论组，方便团队成员沟通。",
    "在项目中，知识点关键词可在沟通和文档中被高亮显示。",
    "在项目中，您可以直接邀请团队成员加入。",
];

export interface TipsModalProps {
    onCancel: () => void;
}

const TipsModal = (props: TipsModalProps) => {
    const [tipIndex, setTipIndex] = useState(Math.floor(Math.random() * TIPS.length));

    return (
        <Modal open title="使用技巧" footer={null}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}>
            <div style={{ height: "60px", overflowY: "scroll", fontSize: "16px", fontWeight: 500 }}>
                {TIPS[tipIndex]}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="link" onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setTipIndex(Math.floor(Math.random() * TIPS.length));
                }} style={{ fontSize: "16px" }}>换一条</Button>
            </div>
        </Modal>
    );
};

export default TipsModal;