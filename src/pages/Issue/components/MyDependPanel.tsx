import React, { useState, useEffect } from "react";
import { observer } from 'mobx-react';
import { Card, Table, message } from 'antd';
import { LinkSelect } from "@/components/Editor/components";
import type { LinkInfo } from '@/stores/linkAux';
import { LINK_TARGET_TYPE, LinkTaskInfo, LinkBugInfo } from '@/stores/linkAux';
import { request } from '@/utils/request';
import type { IssueInfo } from '@/api/project_issue';
import { ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, add_dependence, list_my_depend, remove_dependence } from '@/api/project_issue';
import type { ColumnsType } from 'antd/lib/table';
import { useStores } from "@/hooks";
import { get_issue_type_str } from '@/api/event_type';
import { renderState, renderTitle } from "./dependComon";
import Button from "@/components/Button";
import { useHistory } from "react-router-dom";
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';


interface MyDependPanelProps {
    issueId: string;
    canOptDependence: boolean;
    inModal: boolean;
}

export const MyDependPanel: React.FC<MyDependPanelProps> = observer((props) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [issueList, setIssueList] = useState<IssueInfo[]>([]);
    const [showSelectLink, setShowSelectLink] = useState(false);


    const loadIssue = async () => {
        const res = await request(list_my_depend({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id: props.issueId,
        }));
        if (res) {
            setIssueList(res.issue_list);
        }
    };

    const addDependIssue = async (dependIssueId: string) => {
        const index = issueList.findIndex(item => item.issue_id == dependIssueId);
        if (index != -1) {
            setShowSelectLink(false);
            return;
        }
        const res = await request(add_dependence({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id: props.issueId,
            depend_issue_id: dependIssueId,
        }));
        if (res) {
            message.info("设置依赖工单成功");
            setShowSelectLink(false);
        }
    };

    const removeDependIssue = async (dependIssueId: string) => {
        const res = await request(remove_dependence({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id: props.issueId,
            depend_issue_id: dependIssueId,
        }));
        if (res) {
            message.info("取消依赖工单成功");
            const itemList = issueList.filter(item => item.issue_id != dependIssueId);
            setIssueList(itemList);
        }
    };

    const issueColums: ColumnsType<IssueInfo> = [
        {
            title: 'ID',
            dataIndex: 'issue_index',
            ellipsis: true,
            width: 60,
        },
        {
            title: '类别',
            dataIndex: 'issue_type',
            width: 60,
            render: (v: number) => {
                return get_issue_type_str(v);
            },
        },
        {
            title: '名称',
            ellipsis: true,
            dataIndex: ['basic_info', 'title'],
            width: 150,
            render: (_, row: IssueInfo) => renderTitle(row, props.inModal, () => {
                if (row.issue_type == ISSUE_TYPE_TASK) {
                    linkAuxStore.goToLink(new LinkTaskInfo("", row.project_id, row.issue_id), history);
                } else if (row.issue_type == ISSUE_TYPE_BUG) {
                    linkAuxStore.goToLink(new LinkBugInfo("", row.project_id, row.issue_id), history);
                }
            }),
        },
        {
            title: '阶段',
            dataIndex: 'state',
            width: 100,
            align: 'center',
            render: (val: number) => renderState(val),
        },
        {
            title: '操作',
            width: 80,
            render: (_, record: IssueInfo) => {
                return (
                    <Button
                        type="link"
                        disabled={projectStore.isClosed || !props.canOptDependence}
                        style={{ minWidth: 0, padding: "0px 0px" }}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeDependIssue(record.issue_id);
                        }}>取消依赖</Button>
                );
            }
        }
    ];

    useEffect(() => {
        loadIssue();
    }, [props.issueId])

    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            const notice = ev.payload;
            if (notice.IssueNotice?.UpdateIssueDepNotice != undefined && notice.IssueNotice.UpdateIssueDepNotice.issue_id == props.issueId) {
                loadIssue();
            }
        });
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, [props.issueId]);

    return (
        <Card bordered={false}
            bodyStyle={{ maxHeight: "calc(100vh - 370px)", overflowY: "scroll" }}
            extra={
                <Button
                    type={props.inModal ? "primary" : "link"}
                    disabled={projectStore.isClosed || !props.canOptDependence}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowSelectLink(true);
                    }}>新增依赖工单</Button>
            }>
            <Table rowKey={'issue_id'} dataSource={issueList} columns={issueColums} pagination={false} />
            {showSelectLink == true && (
                <LinkSelect
                    title="选择依赖任务/缺陷"
                    showDoc={false}
                    showRequirement={false}
                    showTask={true}
                    showBug={true}
                    showTestcase={false}
                    showExterne={false}
                    showApiColl={false}
                    showBoard={false}
                    showSprit={false}
                    onOk={(link: LinkInfo) => {
                        let dependIssueId = "";
                        if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_TASK) {
                            const taskLink = link as LinkTaskInfo;
                            dependIssueId = taskLink.issueId;
                        } else if (link.linkTargeType == LINK_TARGET_TYPE.LINK_TARGET_BUG) {
                            const bugLink = link as LinkBugInfo;
                            dependIssueId = bugLink.issueId;
                        }
                        addDependIssue(dependIssueId);
                    }}
                    onCancel={() => setShowSelectLink(false)}
                />
            )}
        </Card>
    );
});