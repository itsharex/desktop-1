
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Button, Card, Checkbox, Form, Space, message } from "antd";
import { useStores } from "@/hooks";
import { update_setting } from "@/api/project";
import { request } from "@/utils/request";
import { PROJECT_SETTING_TAB } from "@/utils/constant";
import type { PanelProps } from "./common";

const LayoutSettingPanel: React.FC<PanelProps> = (props) => {


    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');


    const [disableExtEvent, setDisableExtEvent] = useState(projectStore.curProject?.setting.disable_ext_event ?? false);


    const [hideProjectInfo, setHideProjectInfo] = useState(projectStore.curProject?.setting.hide_project_info ?? false);
    const [hideBulletin, setHideBulletin] = useState(projectStore.curProject?.setting.hide_bulletin ?? false);

    const [hasChange, setHasChange] = useState(false);

    const resetConfig = () => {
        setDisableExtEvent(projectStore.curProject?.setting.disable_ext_event ?? false);

        setHideProjectInfo(projectStore.curProject?.setting.hide_project_info ?? false);
        setHideBulletin(projectStore.curProject?.setting.hide_bulletin ?? false);
        setHasChange(false);
    };

    const updateConfig = async () => {
        if (projectStore.curProject == undefined) {
            return;
        }
        await request(update_setting({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            setting: {
                ...projectStore.curProject.setting,
                disable_ext_event: disableExtEvent,
                hide_project_info: hideProjectInfo,
                hide_bulletin: hideBulletin,
            },
        }));
        message.info("保存成功");
        await projectStore.updateProject(projectStore.curProjectId);
        setHasChange(false);

        projectStore.showProjectSetting = null;
        setTimeout(() => {
            projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_LAYOUT;
        }, 200);
    };

    useEffect(() => {
        props.onChange(hasChange);
    }, [hasChange]);

    return (
        <Card bordered={false} title={props.title} bodyStyle={{ height: "calc(100vh - 400px)", overflowY: "scroll" }}
            extra={
                <Space>
                    <Button disabled={!hasChange} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        resetConfig();
                    }}>取消</Button>
                    <Button type="primary" disabled={!hasChange} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        updateConfig();
                    }}>保存</Button>
                </Space>
            }>
            <Form labelCol={{ span: 5 }} disabled={projectStore.isClosed || !projectStore.isAdmin}>
                <Form.Item label="右侧工具栏">
                    <Space direction="vertical">
                        <Checkbox checked={disableExtEvent} onChange={e => {
                            e.stopPropagation();
                            setDisableExtEvent(e.target.checked);
                            setHasChange(true);
                        }}>关闭第三方接入入口</Checkbox>
                    </Space>
                </Form.Item>
                <Form.Item label="项目概览">
                    <Space direction="vertical">
                        <Checkbox checked={hideProjectInfo} onChange={e => {
                            e.stopPropagation();
                            setHideProjectInfo(e.target.checked);
                            setHasChange(true);
                        }}>隐藏项目详情</Checkbox>
                        <Checkbox checked={hideBulletin} onChange={e => {
                            e.stopPropagation();
                            setHideBulletin(e.target.checked);
                            setHasChange(true);
                        }}>隐藏项目公告</Checkbox>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default observer(LayoutSettingPanel);