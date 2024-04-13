import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Popover, Space } from "antd";
import SkillCateList from "./components/SkillCateList";
import SkillTree from "./components/SkillTree";
import { useStores } from "@/hooks";
import { MoreOutlined } from "@ant-design/icons";

const SkillCenter = () => {
    const skillCenterStore = useStores('skillCenterStore');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

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
            {skillCenterStore.curPointId != "" && (
                <Card title="技能详情" style={{ flex: 1, borderLeft: "1px solid #e4e4e8" }} bordered={false}
                    headStyle={{ fontSize: "16px", fontWeight: 700, backgroundColor: "#f7f7f7" }}
                    bodyStyle={{ height: "calc(100vh - 176px)", overflowY: "scroll", padding: "0px 0px" }}
                    extra={
                        <>
                            {(skillCenterStore.curPoint?.has_learn ?? false) == false && (
                                <Button type="primary" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowAddModal(true);
                                }}>增加学习记录</Button>
                            )}

                            {(skillCenterStore.curPoint?.has_learn ?? false) == true && (
                                <Space>
                                    <Button type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowUpdateModal(true);
                                    }}>查看我的学习记录</Button>
                                    <Popover trigger="click" placement="bottom" content={
                                        <div style={{ padding: "10px 10px" }}>
                                            <Button type="link" danger onClick={e => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setShowRemoveModal(true); 
                                            }}>删除学习记录</Button>
                                        </div>
                                    }>
                                        <MoreOutlined />
                                    </Popover>
                                </Space>
                            )}
                        </>
                    }>
                    xx
                </Card>
            )}

            {showAddModal == true && ""}
            {showUpdateModal == true && ""}
            {showRemoveModal == true && ""}
        </div>
    );
};

export default observer(SkillCenter);