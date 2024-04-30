//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Modal, Tabs } from "antd";
import { useStores } from "@/hooks";
import { COMMENT_TARGET_REQUIRE_MENT } from "@/api/project_comment";
import CommentTab from "@/components/CommentEntry/CommentTab";
import CommentInModal from "@/components/CommentEntry/CommentInModal";
import DetailPanel from "./components/DetailPanel";
import LinkIssuePanel from "./components/LinkIssuePanel";
import FourQPanel from "./components/FourQPanel";
import KanoPanel from "./components/KanoPanel";
import EventListPanel from "./components/EventListPanel";

const RequirementDetailModal = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [commentDataVersion, setCommentDataVersion] = useState(0);

    useEffect(() => {
        if (projectStore.projectModal.requirementTab == "comment") {
            setTimeout(() => {
                setCommentDataVersion(oldValue => oldValue + 1);
            }, 500);
        }
    }, [projectStore.projectModal.requirementTab]);

    return (
        <Modal open title="项目需求" footer={null}
            width="800px"
            bodyStyle={{ height: "calc(100vh - 300px)", padding: "0px 10px", overflowY: "hidden" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                projectStore.projectModal.requirementId = "";
                projectStore.projectModal.requirementTab = "detail";
            }}>
            <Tabs activeKey={projectStore.projectModal.requirementTab}
                onChange={key => projectStore.projectModal.requirementTab = (key as "detail" | "issue" | "fourq" | "kano" | "event" | "comment")}
                type="card" tabPosition="left" size="large"
                items={[
                    {
                        key: "detail",
                        label: "需求详情",
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                                {projectStore.projectModal.requirementTab == "detail" && (
                                    <DetailPanel />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "issue",
                        label: "相关任务",
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                                {projectStore.projectModal.requirementTab == "issue" && (
                                    <LinkIssuePanel requirementId={projectStore.projectModal.requirementId} inModal/>
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "fourq",
                        label: "四象限分析",
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                                {projectStore.projectModal.requirementTab == "fourq" && (
                                    <FourQPanel />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "kano",
                        label: "KANO分析",
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                                {projectStore.projectModal.requirementTab == "kano" && (
                                    <KanoPanel />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "event",
                        label: "操作历史",
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll" }}>
                                {projectStore.projectModal.requirementTab == "event" && (
                                    <EventListPanel />
                                )}
                            </div>
                        ),
                    },
                    {
                        key: "comment",
                        label: <CommentTab targetType={COMMENT_TARGET_REQUIRE_MENT} targetId={projectStore.projectModal.requirementId} dataVersion={commentDataVersion} />,
                        children: (
                            <div style={{ height: "calc(100vh - 320px)", overflowY: "scroll", paddingRight: "10px" }}>
                                <CommentInModal projectId={projectStore.curProjectId} targetType={COMMENT_TARGET_REQUIRE_MENT} targetId={projectStore.projectModal.requirementId}
                                    myUserId={userStore.sessionId} myAdmin={projectStore.isAdmin} />
                            </div>
                        ),
                    },
                ]} />
        </Modal>
    );
};

export default observer(RequirementDetailModal);