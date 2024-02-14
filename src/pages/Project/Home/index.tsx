import React from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import ContentList from "./ContentList";
import { PROJECT_HOME_TYPE } from "@/utils/constant";
import WorkPlanList from "./WorkPlanList";
import DocList from "./DocList";
import BoardList from "./BoardList";
import PagesList from "./PagesList";

const HomeIndex = () => {
    const projectStore = useStores('projectStore');

    return (
        <>
            {projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT && (
                <ContentList />
            )}
            {projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_WORK_PLAN_LIST && (
                <WorkPlanList />
            )}
            {projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_DOC_LIST && (
                <DocList />
            )}
            {projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_BOARD_LIST && (
                <BoardList />
            )}
            {projectStore.projectHome.homeType == PROJECT_HOME_TYPE.PROJECT_HOME_PAGES_LIST && (
                <PagesList />
            )}
        </>
    );
};

export default observer(HomeIndex);