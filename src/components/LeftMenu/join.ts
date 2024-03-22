import { request } from "@/utils/request";
import { join as join_org } from "@/api/org_mebmer";
import { join as join_project } from '@/api/project_member';
import { message } from "antd";
import type ProjectStore from "@/stores/project";
import type OrgStore from "@/stores/org";
import { MAIN_CONTENT_CONTENT_LIST } from "@/api/project";
import { APP_PROJECT_HOME_PATH, PROJECT_SETTING_TAB } from "@/utils/constant";
import type { History } from 'history';

const joinOrg = async (sessionId: string, inviteCode: string, userId: string, projectStore: ProjectStore, orgStore: OrgStore, history: History) => {
    const res = await request(join_org({
        session_id: sessionId,
        invite_code: inviteCode,
    }));
    message.success('加入成功');
    await orgStore.onJoin(res.org_id, userId);
    projectStore.setCurProjectId("");
    //TODO 跳转到团队详情页面
};

const joinProject = async (sessionId: string, inviteCode: string, userId: string, projectStore: ProjectStore, orgStore: OrgStore, history: History) => {
    const res = await request(join_project(sessionId, inviteCode));
    message.success('加入成功');
    await projectStore.updateProject(res.project_id);
    projectStore.setCurProjectId(res.project_id).then(() => {
        projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
        history.push(APP_PROJECT_HOME_PATH);
        projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_ALARM;
    });
    orgStore.setCurOrgId("");
}

export async function joinOrgOrProject(sessionId: string, inviteCode: string, userId: string, projectStore: ProjectStore, orgStore: OrgStore, history: History) {
    if (inviteCode.startsWith("ORG")) {
        await joinOrg(sessionId, inviteCode, userId, projectStore, orgStore, history);
    } else {
        await joinProject(sessionId, inviteCode, userId, projectStore, orgStore, history);
    }
}