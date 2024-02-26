import React from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import ContentList from "./ContentList";
import WorkPlanList from "./WorkPlanList";
import DocList from "./DocList";
import BoardList from "./BoardList";
import PagesList from "./PagesList";
import { MAIN_CONTENT_BOARD_LIST, MAIN_CONTENT_CONTENT_LIST, MAIN_CONTENT_DOC_LIST, MAIN_CONTENT_PAGES_LIST, MAIN_CONTENT_SPRIT_LIST } from "@/api/project";

const HomeIndex = () => {
    const projectStore = useStores('projectStore');

    return (
        <>
            {projectStore.projectHome.homeType == MAIN_CONTENT_CONTENT_LIST && (
                <ContentList />
            )}
            {projectStore.projectHome.homeType == MAIN_CONTENT_SPRIT_LIST && (
                <WorkPlanList />
            )}
            {projectStore.projectHome.homeType == MAIN_CONTENT_DOC_LIST && (
                <DocList />
            )}
            {projectStore.projectHome.homeType == MAIN_CONTENT_BOARD_LIST && (
                <BoardList />
            )}
            {projectStore.projectHome.homeType == MAIN_CONTENT_PAGES_LIST && (
                <PagesList />
            )}
        </>
    );
};

export default observer(HomeIndex);