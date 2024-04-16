import React, { useEffect } from "react";
import { observer } from 'mobx-react';
import { Card } from "antd";
import SkillCateList from "./components/SkillCateList";
import SkillTree from "./components/SkillTree";
import { useStores } from "@/hooks";

const SkillCenter = () => {
    const skillCenterStore = useStores('skillCenterStore');


    useEffect(() => {
        skillCenterStore.initData();
    }, []);

    return (
        <div style={{ display: "flex" }}>
            <Card title="技能列表" style={{ width: "150px", borderRight: "1px solid #e4e4e8" }} bordered={false}
                headStyle={{ fontSize: "16px", fontWeight: 700, backgroundColor: "#f7f7f7" }}
                bodyStyle={{ height: "calc(100vh - 176px)", overflowY: "scroll", padding: "0px 0px" }}>
                <SkillCateList />
            </Card>
            <Card title="技能图谱" style={{ flex: 1 }} bordered={false}
                headStyle={{ fontSize: "16px", fontWeight: 700, backgroundColor: "#f7f7f7" }}
                bodyStyle={{ height: "calc(100vh - 176px)", overflowY: "scroll", padding: "0px 0px" }}>
                <SkillTree />
            </Card>
        </div>
    );
};

export default observer(SkillCenter);