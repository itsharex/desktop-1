import { request } from "@/utils/request";
import { join as join_org } from "@/api/org_mebmer";
import { join as join_project } from '@/api/project_member';
import { message } from "antd";
import type ProjectStore from "@/stores/project";
import type OrgStore from "@/stores/org";
import { MAIN_CONTENT_CONTENT_LIST } from "@/api/project";
import { APP_ORG_PATH, APP_PROJECT_HOME_PATH } from "@/utils/constant";
import type { History } from 'history';
import UserStore from "@/stores/user";
import { update_feature } from "@/api/user";
import { sleep } from "@/utils/time";

const joinOrg = async (inviteCode: string, userStore: UserStore, projectStore: ProjectStore, orgStore: OrgStore, history: History) => {
    const res = await request(join_org({
        session_id: userStore.sessionId,
        invite_code: inviteCode,
    }));
    message.success('加入成功');
    if (userStore.userInfo.featureInfo.enable_org == false) {
        const feature = {
            enable_project: userStore.userInfo.featureInfo.enable_project,
            enable_org: true,
            enable_skill_center: userStore.userInfo.featureInfo.enable_skill_center,
        };
        await request(update_feature({
            session_id: userStore.sessionId,
            feature: feature,
        }));
        userStore.updateFeature(feature);
        sleep(200);
    }
    await orgStore.onJoin(res.org_id, userStore.userInfo.userId);
    projectStore.setCurProjectId("");
    //跳转到团队详情页面
    orgStore.setCurOrgId(res.org_id);
    history.push(APP_ORG_PATH);
};

const joinProject = async (inviteCode: string, userStore: UserStore, projectStore: ProjectStore, orgStore: OrgStore, history: History) => {
    const res = await request(join_project(userStore.sessionId, inviteCode));
    message.success('加入成功');
    if (userStore.userInfo.featureInfo.enable_project == false) {
        const feature = {
            enable_project: true,
            enable_org: userStore.userInfo.featureInfo.enable_org,
            enable_skill_center: userStore.userInfo.featureInfo.enable_skill_center,
        };
        await request(update_feature({
            session_id: userStore.sessionId,
            feature: feature,
        }));
        userStore.updateFeature(feature);
        sleep(200);
    }
    await projectStore.updateProject(res.project_id);
    projectStore.setCurProjectId(res.project_id).then(() => {
        projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
        history.push(APP_PROJECT_HOME_PATH);
        projectStore.showProjectSetting = null;
    });
    orgStore.setCurOrgId("");
}

export async function joinOrgOrProject(inviteCode: string, userStore: UserStore, projectStore: ProjectStore, orgStore: OrgStore, history: History) {
    if (inviteCode.startsWith("ORG")) {
        await joinOrg(inviteCode, userStore, projectStore, orgStore, history);
    } else {
        await joinProject(inviteCode, userStore, projectStore, orgStore, history);
    }
}