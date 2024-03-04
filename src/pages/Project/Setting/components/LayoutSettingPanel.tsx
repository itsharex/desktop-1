import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { PanelProps } from "./common";
import { Button, Card, Form, Select, Space, message } from "antd";
import { useStores } from "@/hooks";
import { MAIN_CONTENT_API_COLL_LIST, MAIN_CONTENT_BOARD_LIST, MAIN_CONTENT_CONTENT_LIST, MAIN_CONTENT_DOC_LIST, MAIN_CONTENT_FILE_LIST, MAIN_CONTENT_MY_WORK, MAIN_CONTENT_PAGES_LIST, MAIN_CONTENT_SPRIT_LIST, update_setting } from "@/api/project";
import { request } from "@/utils/request";

const LayoutSettingPanel = (props: PanelProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [mainContent, setMainContent] = useState(projectStore.curProject?.setting.main_content ?? MAIN_CONTENT_CONTENT_LIST);
    const [hasChange, setHasChange] = useState(false);

    const resetConfig = () => {
        setMainContent(projectStore.curProject?.setting.main_content ?? MAIN_CONTENT_CONTENT_LIST);
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
                main_content: mainContent,
            },
        }));
        message.info("保存成功");
        await projectStore.updateProject(projectStore.curProjectId);
        setHasChange(false);
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
            <Form labelCol={{ span: 5 }} >
                <Form.Item label="默认内容入口">
                    <Select value={mainContent} onChange={value => {
                        setMainContent(value);
                        setHasChange(true);
                    }}>
                        <Select.Option value={MAIN_CONTENT_CONTENT_LIST}>内容面板</Select.Option>
                        <Select.Option value={MAIN_CONTENT_SPRIT_LIST}>工作计划</Select.Option>
                        <Select.Option value={MAIN_CONTENT_DOC_LIST}>项目文档</Select.Option>
                        <Select.Option value={MAIN_CONTENT_BOARD_LIST}>信息面板</Select.Option>
                        <Select.Option value={MAIN_CONTENT_PAGES_LIST}>静态网页</Select.Option>
                        <Select.Option value={MAIN_CONTENT_FILE_LIST}>项目文件</Select.Option>
                        <Select.Option value={MAIN_CONTENT_API_COLL_LIST}>接口集合</Select.Option>
                        <Select.Option value={MAIN_CONTENT_MY_WORK}>我的工作</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default observer(LayoutSettingPanel);