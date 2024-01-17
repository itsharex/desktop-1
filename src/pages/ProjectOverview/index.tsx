import React, { useEffect } from "react";
import { observer } from 'mobx-react';
import s from './index.module.less';
import ProjectInfoPanel from "./components/ProjectInfoPanel";
import { Collapse, Popover } from "antd";
import MemberInfoPanel from "./components/MemberInfoPanel";
import BulletinListPanel from "./components/BulletinListPanel";
import { useStores } from "@/hooks";
import ProjectFsList from "./components/ProjectFsList";
import { InfoCircleOutlined } from "@ant-design/icons";


const ProjectOverview = () => {
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');

    useEffect(() => {
        return () => {
            memberStore.showDetailMemberId = "";
        };
    }, []);

    return (
        <div className={s.overview_wrap}>
            {(projectStore.curProject?.setting.hide_project_info ?? false) == false && memberStore.showDetailMemberId == "" && <ProjectInfoPanel />}
            {(projectStore.curProject?.setting.hide_bulletin ?? false) == false && memberStore.showDetailMemberId == "" && <BulletinListPanel />}
            <MemberInfoPanel />

            {memberStore.showDetailMemberId == "" && (
                <Collapse bordered={true} className={s.other_wrap}>
                    <Collapse.Panel key="storage" header={<h1 className={s.head}>项目存储</h1>} extra={
                        <Popover placement="left" trigger="hover" content={
                            <div style={{ padding: "10px 10px" }}>
                                <p>只会回收没有任何引用关系的文件。</p>
                                <p>一周内创建的文件不管是否被引用，都不会回收。</p>
                            </div>
                        }>
                            <InfoCircleOutlined />
                        </Popover>
                    }>
                        <ProjectFsList />
                    </Collapse.Panel>
                </Collapse>
            )}
        </div>
    );
};

export default observer(ProjectOverview);