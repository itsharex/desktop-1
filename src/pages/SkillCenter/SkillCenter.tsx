//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Card, Tabs } from "antd";
import SkillCateList from "./components/SkillCateList";
import SkillTree from "./components/SkillTree";
import { useStores } from "@/hooks";
import ResourceList from "./components/ResourceList";
import QuestionList from "./components/QuestionList";

const SkillCenter = () => {
    const skillCenterStore = useStores('skillCenterStore');

    const [activeKey, setActiveKey] = useState<"skill" | "resource" | "question">("skill");

    useEffect(() => {
        skillCenterStore.initData();
    }, []);

    useEffect(() => {
        setActiveKey("skill");
    }, [skillCenterStore.curCateId]);

    return (
        <div style={{ display: "flex", backgroundColor: "white", height: "100%", border: "1px solid #e4e4e8" }}>
            <Card title="技能列表" style={{ width: "150px", borderRight: "1px solid #e4e4e8" }} bordered={false}
                headStyle={{ fontSize: "16px", fontWeight: 700 }}
                bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll", padding: "0px 0px" }}>
                <SkillCateList />
            </Card>
            <Tabs activeKey={activeKey} onChange={key => setActiveKey(key as "skill" | "resource" | "question")}
                tabPosition="top" type="card" tabBarStyle={{ fontSize: "20px", fontWeight: 800 }}
                style={{ flex: 1 }}
                items={[
                    {
                        label: <span>技能图谱</span>,
                        key: "skill",
                        children: (
                            <div style={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}>
                                {activeKey == "skill" && (
                                    <SkillTree />
                                )}
                            </div>
                        ),
                    },
                    {
                        label: <span>相关资源</span>,
                        key: "resource",
                        children: (
                            <div style={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}>
                                {activeKey == "resource" && (
                                    <ResourceList />
                                )}
                            </div>
                        )
                    },
                    {
                        label: <span>课后练习</span>,
                        key: "question",
                        children: (
                            <div style={{ height: "calc(100vh - 90px)", overflowY: "scroll" }}>
                                {activeKey == "question" && (
                                    <QuestionList />
                                )}
                            </div>
                        ),
                    },
                ]} />
        </div>
    );
};

export default observer(SkillCenter);