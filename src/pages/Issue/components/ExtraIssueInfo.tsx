import React from "react";
import { Tabs } from 'antd';
import { SubIssuePanel } from "./SubIssuePanel";
import { MyDependPanel } from "./MyDependPanel";
import { DependMePanel } from "./DependMePanel";



interface ExtraIssueInfoProps {
    issueId: string;
    canOptSubIssue: boolean;
    canOptDependence: boolean;
}

export const ExtraIssueInfo: React.FC<ExtraIssueInfoProps> = (props) => {
    return (
        <div style={{ backgroundColor: "white" }}>
            <Tabs defaultActiveKey="sub" type="card" tabPosition="left" size="large">
                <Tabs.TabPane tab="子任务" key="sub">
                    <SubIssuePanel issueId={props.issueId} canOptSubIssue={props.canOptSubIssue} inModal={false} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="我的依赖" key="myDepend">
                    <MyDependPanel issueId={props.issueId} canOptDependence={props.canOptDependence} inModal={false} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="依赖我的" key="dependMe">
                    <DependMePanel issueId={props.issueId} inModal={false} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};