import React, { useEffect, useState } from "react";
import s from './Panel.module.less';
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrop } from 'react-dnd';
import type { IssueInfo, ISSUE_STATE, PROCESS_STAGE } from "@/api/project_issue";
import {
    ISSUE_STATE_PLAN, ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK, ISSUE_STATE_CLOSE, change_state,
    PROCESS_STAGE_TODO, PROCESS_STAGE_DOING, PROCESS_STAGE_DONE, update_process_stage
} from "@/api/project_issue";
import { Card } from "antd";
import { request } from "@/utils/request";
import KanbanCard, { DND_ITEM_TYPE } from "./KanbanCard";
import { ISSUE_STATE_COLOR_ENUM } from "@/utils/constant";

const filterIssueList = (taskList: IssueInfo[], bugList: IssueInfo[], state: ISSUE_STATE, memberId: string) => {
    const retList: IssueInfo[] = [];
    taskList.forEach(item => {
        if (item.state == state) {
            if (memberId == "") {
                retList.push(item);
            } else {
                if (item.exec_user_id == memberId || item.check_user_id == memberId) {
                    retList.push(item);
                }
            }
        }
    });
    bugList.forEach(item => {
        if (item.state == state) {
            if (memberId == "") {
                retList.push(item);
            } else {
                if (item.exec_user_id == memberId || item.check_user_id == memberId) {
                    retList.push(item);
                }
            }
        }
    });
    console.log(taskList, bugList, memberId);
    retList.sort((a: IssueInfo, b: IssueInfo) => b.update_time - a.update_time);
    return retList;
}

interface KanbanPanelProps {
    memberId: string;
}

interface ProcessPanelProps {
    memberId: string;
    stage: PROCESS_STAGE;
}


const PlanIssueColumn = observer((props: KanbanPanelProps) => {
    const spritStore = useStores('spritStore');
    const [issueList, setIssueList] = useState<IssueInfo[]>();

    useEffect(() => {
        setIssueList(filterIssueList(spritStore.taskList, spritStore.bugList, ISSUE_STATE_PLAN, props.memberId));
    }, [spritStore.taskList, spritStore.bugList, props.memberId]);

    return (
        <div className={s.kanban_column}>
            <Card title={`规划中(${issueList?.length ?? 0})`} style={{ border: "2px solid #e4e4e8", borderBottom: "none", width: "250px" }}
                headStyle={{ fontSize: "18px", fontWeight: 700, backgroundColor: `rgb(${ISSUE_STATE_COLOR_ENUM.规划中颜色} / 80%)`, textAlign: "center" }}
                bodyStyle={{ height: "calc(100vh - 310px)", backgroundColor: "#e4e4e8", overflow: "scroll" }}>
                {issueList?.map(item => (
                    <KanbanCard issue={item} key={item.issue_id} />
                ))}
            </Card>
        </div>
    );
});

const ProcessIssueColumn = observer((props: ProcessPanelProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const spritStore = useStores('spritStore');
    const [issueList, setIssueList] = useState<IssueInfo[]>();

    const setProcess = async (issue: IssueInfo) => {
        if (issue.exec_user_id == "") {
            return;
        }
        if (issue.state == ISSUE_STATE_PROCESS) {
            await request(update_process_stage({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                issue_id: issue.issue_id,
                process_stage: props.stage,
            }));
        } else {
            await request(change_state({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                issue_id: issue.issue_id,
                state: ISSUE_STATE_PROCESS,
            }));
        }

        await spritStore.updateIssue(issue.issue_id);
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: DND_ITEM_TYPE,
        drop: (item: IssueInfo) => setProcess(item),
        canDrop: (item: IssueInfo) => {
            if (item.exec_user_id != "") {
                if (item.state == ISSUE_STATE_PROCESS && item.exec_user_id == userStore.userInfo.userId) {
                    return true
                } else if (item.user_issue_perm.next_state_list.includes(ISSUE_STATE_PROCESS) && props.stage == PROCESS_STAGE_TODO) {
                    return true;
                }
            }
            return false;
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const getPanelName = () => {
        if (props.stage == PROCESS_STAGE_TODO) {
            return "未开始";
        } else if (props.stage == PROCESS_STAGE_DOING) {
            return "执行中";
        } else if (props.stage == PROCESS_STAGE_DONE) {
            return "待检查";
        }
        return "";
    };

    useEffect(() => {
        setIssueList(filterIssueList(spritStore.taskList, spritStore.bugList, ISSUE_STATE_PROCESS, props.memberId).filter(item => item.process_stage == props.stage));
    }, [spritStore.taskList, spritStore.bugList, props.memberId]);

    return (
        <div className={s.kanban_column} ref={drop}>
            <Card title={`${getPanelName()}(${issueList?.length ?? 0})`} style={{ backgroundColor: isOver ? "#e4e4e8" : "inherit", border: "2px solid #e4e4e8", borderBottom: "none", width: "250px" }}
                headStyle={{ fontSize: "18px", fontWeight: 700, backgroundColor: `rgb(${ISSUE_STATE_COLOR_ENUM.处理颜色} / 80%)`, textAlign: "center" }}
                bodyStyle={{ height: "calc(100vh - 310px)", backgroundColor: "#e4e4e8", overflowY: "scroll" }}>
                {issueList?.map(item => (
                    <KanbanCard issue={item} key={item.issue_id} />
                ))}
            </Card>
        </div>
    );
});

const CheckIssueColumn = observer((props: KanbanPanelProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const spritStore = useStores('spritStore');
    const [issueList, setIssueList] = useState<IssueInfo[]>();

    const setCheck = async (issue: IssueInfo) => {
        if (issue.check_user_id == "") {
            return;
        }
        await request(change_state({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id: issue.issue_id,
            state: ISSUE_STATE_CHECK,
        }));
        await spritStore.updateIssue(issue.issue_id);
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: DND_ITEM_TYPE,
        drop: (item: IssueInfo) => setCheck(item),
        canDrop: (item: IssueInfo) => item.check_user_id != "" && item.user_issue_perm.next_state_list.includes(ISSUE_STATE_CHECK),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    useEffect(() => {
        setIssueList(filterIssueList(spritStore.taskList, spritStore.bugList, ISSUE_STATE_CHECK, props.memberId));
    }, [spritStore.taskList, spritStore.bugList, props.memberId]);

    return (
        <div className={s.kanban_column} ref={drop}>
            <Card title={`检查中(${issueList?.length ?? 0})`} style={{ backgroundColor: isOver ? "#e4e4e8" : "inherit", border: "2px solid #e4e4e8", borderBottom: "none", width: "250px" }}
                headStyle={{ fontSize: "18px", fontWeight: 700, backgroundColor: `rgb(${ISSUE_STATE_COLOR_ENUM.验收颜色} / 80%)`, textAlign: "center" }}
                bodyStyle={{ height: "calc(100vh - 310px)", backgroundColor: "#e4e4e8", overflow: "scroll" }}>
                {issueList?.map(item => (
                    <KanbanCard issue={item} key={item.issue_id} />
                ))}
            </Card>
        </div>
    );
});

const CloseIssueColumn = observer((props: KanbanPanelProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const spritStore = useStores('spritStore');
    const [issueList, setIssueList] = useState<IssueInfo[]>();

    const setClose = async (issue: IssueInfo) => {
        await request(change_state({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            issue_id: issue.issue_id,
            state: ISSUE_STATE_CLOSE,
        }));
        await spritStore.updateIssue(issue.issue_id);
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: DND_ITEM_TYPE,
        drop: (item: IssueInfo) => setClose(item),
        canDrop: (item: IssueInfo) => item.user_issue_perm.next_state_list.includes(ISSUE_STATE_CLOSE),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    useEffect(() => {
        setIssueList(filterIssueList(spritStore.taskList, spritStore.bugList, ISSUE_STATE_CLOSE, props.memberId));
    }, [spritStore.taskList, spritStore.bugList, props.memberId]);

    return (
        <div className={s.kanban_column} ref={drop}>
            <Card title={`完成(${issueList?.length ?? 0})`} style={{ backgroundColor: isOver ? "#e4e4e8" : "inherit", border: "2px solid #e4e4e8", borderBottom: "none", width: "250px" }}
                headStyle={{ fontSize: "18px", fontWeight: 700, backgroundColor: `rgb(${ISSUE_STATE_COLOR_ENUM.关闭颜色} / 80%)`, textAlign: "center" }}
                bodyStyle={{ height: "calc(100vh - 310px)", backgroundColor: "#e4e4e8", overflow: "scroll" }}>
                {issueList?.map(item => (
                    <KanbanCard issue={item} key={item.issue_id} />
                ))}
            </Card>
        </div>
    );
});

const KanbanPanel = (props: KanbanPanelProps) => {

    const spritStore = useStores('spritStore');

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={s.kanban_column_list}>
                {props.memberId == "" && filterIssueList(spritStore.taskList, spritStore.bugList, ISSUE_STATE_PLAN, props.memberId).length > 0 && (
                    <PlanIssueColumn memberId={props.memberId} />
                )}
                <ProcessIssueColumn memberId={props.memberId} stage={PROCESS_STAGE_TODO} />
                <ProcessIssueColumn memberId={props.memberId} stage={PROCESS_STAGE_DOING} />
                <ProcessIssueColumn memberId={props.memberId} stage={PROCESS_STAGE_DONE} />
                <CheckIssueColumn memberId={props.memberId} />
                <CloseIssueColumn memberId={props.memberId} />
            </div>
        </DndProvider>
    );
};


export default observer(KanbanPanel);