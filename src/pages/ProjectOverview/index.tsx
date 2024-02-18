import React from "react";
import s from './index.module.less';
import ProjectInfoPanel from "./components/ProjectInfoPanel";
import { Collapse, Popover } from "antd";
import ProjectFsList from "./components/ProjectFsList";
import { InfoCircleOutlined } from "@ant-design/icons";


const ProjectOverview = () => {

    return (
        <div className={s.overview_wrap}>
            <ProjectInfoPanel />

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

        </div>
    );
};

export default ProjectOverview;