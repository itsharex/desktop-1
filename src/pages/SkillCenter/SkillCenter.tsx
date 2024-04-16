import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, message, Modal, Popover, Space } from "antd";
import SkillCateList from "./components/SkillCateList";
import SkillTree from "./components/SkillTree";
import { useStores } from "@/hooks";
import { MoreOutlined } from "@ant-design/icons";
import EditLearnRecordModal from "./components/EditLearnRecordModal";
import { request } from "@/utils/request";
import { remove_learn_record } from "@/api/skill_learn";
import PointLearnRecordList from "./components/PointLearnRecordList";

const SkillCenter = () => {
    const userStore = useStores("userStore");
    const skillCenterStore = useStores('skillCenterStore');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [learnDataVersion, setLearnDataVersion] = useState(0);

    const removeLearnRecord = async () => {
        await request(remove_learn_record({
            session_id: userStore.sessionId,
            cate_id: skillCenterStore.curCateId,
            point_id: skillCenterStore.curPointId,
        }));
        await skillCenterStore.onUpdatePoint(skillCenterStore.curPointId);
        await userStore.updateLearnState(userStore.sessionId);
        setShowRemoveModal(false);
        message.info("删除学习记录成功");
        setLearnDataVersion(oldValue => oldValue + 1);
    };

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
                    bodyStyle={{ height: "calc(100vh - 176px)", overflowY: "scroll", padding: "0px 10px" }}
                    extra={
                        <div style={{ paddingRight: "20px" }}>
                            {(skillCenterStore.curPoint?.has_learn ?? false) == false && (
                                <Button type="primary" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowAddModal(true);
                                }} >我已学会</Button>
                            )}

                            {(skillCenterStore.curPoint?.has_learn ?? false) == true && (
                                <Space>
                                    <Button type="link" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowUpdateModal(true);
                                    }}>查看我的学习记录</Button>
                                    <Popover trigger="click" placement="bottom" content={
                                        <div>
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
                        </div>
                    }>
                    <PointLearnRecordList cateId={skillCenterStore.curCateId} pointId={skillCenterStore.curPointId} dataVersion={learnDataVersion} />
                </Card>
            )}

            {showAddModal == true && (
                <EditLearnRecordModal cateId={skillCenterStore.curCateId} pointId={skillCenterStore.curPointId} update={false}
                    onCancel={() => setShowAddModal(false)} onOk={() => {
                        setShowAddModal(false);
                        setLearnDataVersion(oldValue => oldValue + 1);
                        skillCenterStore.onUpdatePoint(skillCenterStore.curPointId);
                    }} />
            )}
            {showUpdateModal == true && (
                <EditLearnRecordModal cateId={skillCenterStore.curCateId} pointId={skillCenterStore.curPointId} update={true}
                    onCancel={() => setShowUpdateModal(false)}
                    onOk={() => {
                        setShowUpdateModal(false);
                        setLearnDataVersion(oldValue => oldValue + 1);
                    }} />
            )}
            {showRemoveModal == true && (
                <Modal open title="删除学习记录"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeLearnRecord();
                    }}>
                    是否删除当前技能点的学习记录?
                </Modal>
            )}
        </div>
    );
};

export default observer(SkillCenter);