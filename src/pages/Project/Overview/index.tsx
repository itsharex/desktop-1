
import React from "react";
import { observer } from 'mobx-react';
import CardWrap from "@/components/CardWrap";
import { Button, Card, Descriptions, Popover, Space, message } from "antd";
import { useStores } from "@/hooks";
import { ReadOnlyEditor } from "@/components/Editor";
import ProjectFsList from "./components/ProjectFsList";
import { PROJECT_SETTING_TAB } from "@/utils/constant";
import HotkeyHelpInfo from "./components/HotkeyHelpInfo";
import { InfoCircleOutlined } from "@ant-design/icons";
import { writeText } from '@tauri-apps/api/clipboard';

const ProjectOverview = () => {
    const projectStore = useStores('projectStore');

    return (
        <CardWrap title={
            <Space>
                项目信息
                <Popover trigger="hover" placement="bottom" content={
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="项目ID">
                            <Space>
                                {projectStore.curProjectId}
                                <Button type="link" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    writeText(projectStore.curProjectId);
                                    message.info("复制成功");
                                }}>复制</Button>
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                }>
                    <InfoCircleOutlined />
                </Popover>
            </Space>} halfContent>
            <div style={{ padding: "10px 10px" }}>
                <Card title="项目简介"
                    headStyle={{ backgroundColor: "#eee", fontSize: "16px", fontWeight: 600 }} style={{ marginBottom: "10px" }}
                    extra={
                        <>
                            {projectStore.isAdmin && !projectStore.isClosed && (
                                <Button type="link" onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_DESC;
                                }}>编辑</Button>
                            )}
                        </>
                    }>
                    <ReadOnlyEditor content={projectStore.curProject?.basic_info.project_desc ?? ""} />
                </Card>
                <Card title="快捷键" headStyle={{ backgroundColor: "#eee", fontSize: "16px", fontWeight: 600 }} style={{ marginBottom: "10px" }}
                    bodyStyle={{ padding: "0px 0px" }}>
                    <HotkeyHelpInfo />
                </Card>
                <ProjectFsList />
            </div>
        </CardWrap>
    );
};

export default observer(ProjectOverview);