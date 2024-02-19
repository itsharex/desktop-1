
import React from "react";
import { observer } from 'mobx-react';
import CardWrap from "@/components/CardWrap";
import { Button, Card } from "antd";
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
                                <Button type="link" onClick={e=>{
                                    e.stopPropagation();
                                    e.preventDefault();
                                    projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_DESC;
                                }}>编辑</Button>
                            )}
                        </>
                    }>
                    <ReadOnlyEditor content={projectStore.curProject?.basic_info.project_desc ?? ""} />
                </Card>
                <ProjectFsList />
            </div>
        </CardWrap>
    );
};

export default observer(ProjectOverview);