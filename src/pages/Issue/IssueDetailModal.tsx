import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Modal, Tabs } from "antd";
import { useStores } from "@/hooks";
import type { IssueInfo } from "@/api/project_issue";
import { ISSUE_TYPE_TASK, get as get_issue } from "@/api/project_issue";
import type { Tab } from "rc-tabs/lib/interface";
import CommentTab from "@/components/CommentEntry/CommentTab";
import { COMMENT_TARGET_BUG, COMMENT_TARGET_TASK } from "@/api/project_comment";
import CommentInModal from "@/components/CommentEntry/CommentInModal";
import EventListPanel from "./components/EventListPanel";
import { request } from "@/utils/request";
import { SubIssuePanel } from "./components/SubIssuePanel";
import { MyDependPanel } from "./components/MyDependPanel";
import { DependMePanel } from "./components/DependMePanel";
import DetailPanel from "./components/DetailPanel";

const SubIssuePanelWrap = observer(() => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [issueInfo, setIssueInfo] = useState<IssueInfo | null>(null);

    const loadIssueInfo = async () => {
        const res = await request(get_issue(userStore.sessionId, projectStore.curProjectId, projectStore.projectModal.issueId));
        setIssueInfo(res.info);
    };

    useEffect(() => {
        if (projectStore.projectModal.issueId == "") {
            setIssueInfo(null);
        } else {
            loadIssueInfo();
        }
    }, [projectStore.projectModal.issueId]);
    return (
        <>
            {issueInfo != null && (
                <SubIssuePanel issueId={projectStore.projectModal.issueId} canOptSubIssue={issueInfo.user_issue_perm.can_opt_sub_issue} inModal />
            )}
        </>
    );
});

const MyDependPanelWrap = observer(() => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [issueInfo, setIssueInfo] = useState<IssueInfo | null>(null);

    const loadIssueInfo = async () => {
        const res = await request(get_issue(userStore.sessionId, projectStore.curProjectId, projectStore.projectModal.issueId));
        setIssueInfo(res.info);
    };

    useEffect(() => {
        if (projectStore.projectModal.issueId == "") {
            setIssueInfo(null);
        } else {
            loadIssueInfo();
        }
    }, [projectStore.projectModal.issueId]);
    return (
        <>
            {issueInfo != null && (
                <MyDependPanel issueId={projectStore.projectModal.issueId} canOptDependence={issueInfo.user_issue_perm.can_opt_dependence} inModal />
            )}
        </>
    );
});

const IssueDetailModal = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [commentDataVersion, setCommentDataVersion] = useState(0);

    useEffect(() => {
        if (projectStore.projectModal.issueTab == "comment") {
            setTimeout(() => {
                setCommentDataVersion(oldValue => oldValue + 1);
            }, 500);
        }
    }, [projectStore.projectModal.issueTab]);

    const calcTabItems = (): Tab[] => {
        const items: Tab[] = [
            {
                key: "detail",
                label: `${projectStore.projectModal.issueType == ISSUE_TYPE_TASK ? "任务" : "缺陷"}详情`,
                children: (
                    <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                        {projectStore.projectModal.issueTab == "detail" && (
                            <DetailPanel />
                        )}
                    </div>
                ),
            },
        ];
        if (projectStore.projectModal.issueType == ISSUE_TYPE_TASK) {
            items.push({
                key: "subtask",
                label: "子任务",
                children: (
                    <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                        {projectStore.projectModal.issueTab == "subtask" && (
                            <SubIssuePanelWrap />
                        )}
                    </div>
                ),
            });
            items.push({
                key: "mydep",
                label: "我的依赖",
                children: (
                    <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                        {projectStore.projectModal.issueTab == "mydep" && (
                            <MyDependPanelWrap />
                        )}
                    </div>
                ),
            });
            items.push({
                key: "depme",
                label: "依赖我的",
                children: (
                    <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                        {projectStore.projectModal.issueTab == "depme" && (
                            <DependMePanel issueId={projectStore.projectModal.issueId} inModal />
                        )}
                    </div>
                ),
            });
        }
        items.push({
            key: "event",
            label: "操作历史",
            children: (
                <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                    {projectStore.projectModal.issueTab == "event" && (
                        <EventListPanel />
                    )}
                </div>
            ),
        });
        items.push({
            key: "comment",
            label: <CommentTab targetType={projectStore.projectModal.issueType == ISSUE_TYPE_TASK ? COMMENT_TARGET_TASK : COMMENT_TARGET_BUG} targetId={projectStore.projectModal.issueId} dataVersion={commentDataVersion} />,
            children: (
                <div style={{ height: "calc(100vh - 340px)", overflowY: "scroll", paddingRight: "10px" }}>
                    <CommentInModal projectId={projectStore.curProjectId} targetType={projectStore.projectModal.issueType == ISSUE_TYPE_TASK ? COMMENT_TARGET_TASK : COMMENT_TARGET_BUG} targetId={projectStore.projectModal.issueId}
                        myUserId={userStore.sessionId} myAdmin={projectStore.isAdmin} />
                </div>
            ),
        });
        return items;
    };

    return (
        <Modal open title={`查看${projectStore.projectModal.issueType == ISSUE_TYPE_TASK ? "任务" : "缺陷"}`}
            width="800px" footer={null}
            bodyStyle={{ height: "calc(100vh - 300px)", padding: "0px 10px", overflowY: "hidden" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.setIssueIdAndType("", 0);
            }}>
            <Tabs activeKey={projectStore.projectModal.issueTab}
                onChange={key => projectStore.projectModal.issueTab = (key as "detail" | "subtask" | "mydep" | "depme" | "event" | "comment")}
                tabPosition="left" size="large"
                type="card" items={calcTabItems()} />
        </Modal>
    );
};

export default observer(IssueDetailModal);