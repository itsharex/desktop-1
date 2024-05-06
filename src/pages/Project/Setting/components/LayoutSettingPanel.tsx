//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import type { PanelProps } from "./common";
import { Button, Card, Checkbox, Form, Space, message } from "antd";
import { useStores } from "@/hooks";
import { update_setting } from "@/api/project";
import { request } from "@/utils/request";

const LayoutSettingPanel = (props: PanelProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [enableEntryDoc, setEnableEntryDoc] = useState(projectStore.curProject?.setting.enable_entry_doc ?? false);
    const [enableEntryPages, setEnableEntryPages] = useState(projectStore.curProject?.setting.enable_entry_pages ?? false);
    const [enableEntryBoard, setEnableEntryBoard] = useState(projectStore.curProject?.setting.enable_entry_board ?? false);
    const [enableEntryFile, setEnableEntryFile] = useState(projectStore.curProject?.setting.enable_entry_file ?? false);
    const [enableEntryApiColl, setEnableEntryApiColl] = useState(projectStore.curProject?.setting.enable_entry_api_coll ?? false);
    const [enableEntryDataAnno, setEnableEntryDataAnno] = useState(projectStore.curProject?.setting.enable_entry_data_anno ?? false);
    const [hasChange, setHasChange] = useState(false);


    const resetConfig = () => {
        setEnableEntryDoc(projectStore.curProject?.setting.enable_entry_doc ?? false);
        setEnableEntryPages(projectStore.curProject?.setting.enable_entry_pages ?? false);
        setEnableEntryBoard(projectStore.curProject?.setting.enable_entry_board ?? false);
        setEnableEntryFile(projectStore.curProject?.setting.enable_entry_file ?? false);
        setEnableEntryApiColl(projectStore.curProject?.setting.enable_entry_api_coll ?? false);
        setEnableEntryDataAnno(projectStore.curProject?.setting.enable_entry_data_anno ?? false);
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
                enable_entry_doc: enableEntryDoc,
                enable_entry_pages: enableEntryPages,
                enable_entry_board: enableEntryBoard,
                enable_entry_file: enableEntryFile,
                enable_entry_api_coll: enableEntryApiColl,
                enable_entry_data_anno: enableEntryDataAnno,
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
            <Form labelCol={{ span: 3 }} >
                <Form.Item label="内容类型">
                    <Space direction="vertical">
                        <Checkbox checked={enableEntryDoc} onChange={e => {
                            e.stopPropagation();
                            setEnableEntryDoc(e.target.checked);
                            setHasChange(true);
                        }}>项目文档</Checkbox>
                        <Checkbox checked={enableEntryBoard} onChange={e => {
                            e.stopPropagation();
                            setEnableEntryBoard(e.target.checked);
                            setHasChange(true);
                        }}>信息面板</Checkbox>
                        <Checkbox checked={enableEntryPages} onChange={e => {
                            e.stopPropagation();
                            setEnableEntryPages(e.target.checked);
                            setHasChange(true);
                        }}>静态网页</Checkbox>
                        <Checkbox checked={enableEntryFile} onChange={e => {
                            e.stopPropagation();
                            setEnableEntryFile(e.target.checked);
                            setHasChange(true);
                        }}>项目文件</Checkbox>
                        <Checkbox checked={enableEntryApiColl} onChange={e => {
                            e.stopPropagation();
                            setEnableEntryApiColl(e.target.checked);
                            setHasChange(true);
                        }}>接口集合</Checkbox>
                        <Checkbox checked={enableEntryDataAnno} onChange={e => {
                            e.stopPropagation();
                            setEnableEntryDataAnno(e.target.checked);
                            setHasChange(true);
                        }}>数据标注</Checkbox>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default observer(LayoutSettingPanel);