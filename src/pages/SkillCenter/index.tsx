//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from "react";
import s from "./index.module.less";
import { observer } from 'mobx-react';
import { Tabs } from "antd";
import SkillCenter from "./SkillCenter";
import MyLearnRecordList from "./components/MyLearnRecordList";

const SkillCenterPage = () => {
    const [activeKey, setActiveKey] = useState<"myLearn" | "skillCenter">("skillCenter");

    return (
        <div className={s.tabs_wrap}>
            <Tabs activeKey={activeKey}
                type='card'
                onChange={key => setActiveKey(key as "myLearn" | "skillCenter")}>
                <Tabs.TabPane tab={<h2>技能大全</h2>} key="skillCenter">
                    {activeKey == "skillCenter" && (
                        <div className={s.content_wrap}>
                            <SkillCenter />
                        </div>
                    )}
                </Tabs.TabPane>
                <Tabs.TabPane tab={<h2>我的学习记录</h2>} key="myLearn">
                    {activeKey == "myLearn" && (
                        <div className={s.content_wrap} style={{ overflowY: "scroll" }}>
                            <MyLearnRecordList />
                        </div>
                    )}
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};

export default observer(SkillCenterPage);