
import React from "react";
import { observer } from 'mobx-react';
import CardWrap from "@/components/CardWrap";
import { Button, Card, Descriptions } from "antd";
import { useStores } from "@/hooks";
import { ReadOnlyEditor } from "@/components/Editor";
import ProjectFsList from "./components/ProjectFsList";
import { PROJECT_SETTING_TAB } from "@/utils/constant";

const ProjectOverview = () => {
    const projectStore = useStores('projectStore');

    return (
        <CardWrap title='项目信息' halfContent>
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
                    <Descriptions bordered labelStyle={{ width: "100px" }} column={1}>
                        <Descriptions.Item label="alt+0">跳转到 内容面板</Descriptions.Item>
                        <Descriptions.Item label="alt+1">跳转到 工作计划</Descriptions.Item>
                        <Descriptions.Item label="alt+2">跳转到 项目文档</Descriptions.Item>
                        <Descriptions.Item label="alt+3">跳转到 信息面板</Descriptions.Item>
                        <Descriptions.Item label="alt+4">跳转到 静态网页</Descriptions.Item>
                        <Descriptions.Item label="alt+9">跳转到 我的工作</Descriptions.Item>
                        <Descriptions.Item label="alt+c">打开/关闭 项目沟通</Descriptions.Item>
                        <Descriptions.Item label="alt+f">进入/退出 专注模式</Descriptions.Item>
                        <Descriptions.Item label="alt+r">查看 项目需求列表</Descriptions.Item>
                        <Descriptions.Item label="alt+t">查看 所有任务</Descriptions.Item>
                        <Descriptions.Item label="alt+b">查看 所有缺陷</Descriptions.Item>
                        <Descriptions.Item label="alt+e">查看 工作记录</Descriptions.Item>

                        <Descriptions.Item label="ctrl+n w">创建 工作计划</Descriptions.Item>
                        <Descriptions.Item label="ctrl+n d">创建 项目文档</Descriptions.Item>
                        <Descriptions.Item label="ctrl+n o">创建 信息面板</Descriptions.Item>
                        <Descriptions.Item label="ctrl+n p">创建 静态网页</Descriptions.Item>
                        <Descriptions.Item label="ctrl+n f">创建 文件</Descriptions.Item>
                        <Descriptions.Item label="ctrl+n r">创建 需求</Descriptions.Item>
                        <Descriptions.Item label="ctrl+n t">创建 任务</Descriptions.Item>
                        <Descriptions.Item label="ctrl+n b">创建 缺陷</Descriptions.Item>
                    </Descriptions>
                </Card>
                <ProjectFsList />
            </div>
        </CardWrap>
    );
};

export default observer(ProjectOverview);