import React from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import ContentList from "./ContentList";
import WorkPlanList from "./WorkPlanList";
import DocList from "./DocList";
import BoardList from "./BoardList";
import PagesList from "./PagesList";
import FileList from "./FileList";
import ApiCollList from "./ApiCollList";
import { MAIN_CONTENT_API_COLL_LIST, MAIN_CONTENT_BOARD_LIST, MAIN_CONTENT_CONTENT_LIST, MAIN_CONTENT_DOC_LIST, MAIN_CONTENT_FILE_LIST, MAIN_CONTENT_PAGES_LIST, MAIN_CONTENT_SPRIT_LIST } from "@/api/project";


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
            {projectStore.projectHome.homeType == MAIN_CONTENT_FILE_LIST && (
                <FileList />
            )}
            {projectStore.projectHome.homeType == MAIN_CONTENT_API_COLL_LIST && (
                <ApiCollList />
            )}
        </>
    );
};

export default observer(HomeIndex);