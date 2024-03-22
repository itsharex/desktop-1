import type { RootStore } from './index';
import { makeAutoObservable, runInAction } from 'mobx';
import type { OrgInfo, DepartMentInfo } from "@/api/org";
import type { MemberInfo } from "@/api/org_mebmer";
import { list_depart_ment, list_org, get_depart_ment } from "@/api/org";
import { list_member, get_member } from "@/api/org_mebmer";
import { request } from '@/utils/request';
import type { History } from 'history';

export default class OrgStore {
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }
    rootStore: RootStore;

    //当前组织
    private _curOrgId = "";
    private _orgList: OrgInfo[] = [];

    //当前组织部门列表
    private _departMentList: DepartMentInfo[] = [];
    //当前组织成员列表
    private _memberList: MemberInfo[] = [];

    get curOrgId(): string {
        return this._curOrgId;
    }

    get orgList(): OrgInfo[] {
        return this._orgList;
    }

    get curOrg(): OrgInfo | undefined {
        return this._orgList.find(item => item.org_id == this._curOrgId);
    }

    get departMentList(): DepartMentInfo[] {
        return this._departMentList;
    }

    get memberList(): MemberInfo[] {
        return this._memberList;
    }

    async setCurOrgId(val: string) {
        const oldOrgId = this._curOrgId;
        if (val == oldOrgId) {
            return;
        }
        runInAction(() => {
            this._curOrgId = val;
        });
        if (val != "" && val != oldOrgId) {
            runInAction(() => {
                this._departMentList = [];
                this._memberList = [];
            })
            await this.loadDepartMentList();
            await this.loadMemberList();
        }
    }

    private async loadDepartMentList() {
        if (this._curOrgId == "") {
            return;
        }
        const res = await request(list_depart_ment({
            session_id: this.rootStore.userStore.sessionId,
            org_id: this._curOrgId,
        }));
        runInAction(() => {
            this._departMentList = res.depart_ment_list;
        });
    }

    private async loadMemberList() {
        if (this._curOrgId == "") {
            return;
        }
        const res = await request(list_member({
            session_id: this.rootStore.userStore.sessionId,
            org_id: this._curOrgId,
        }));
        runInAction(() => {
            this._memberList = res.member_list;
        });
    }

    async initLoadOrgList() {
        const res = await request(list_org({
            session_id: this.rootStore.userStore.sessionId,
        }));
        runInAction(() => {
            this._orgList = res.org_list;
        });
    }

    async onJoin(orgId: string, memberUserId: string) {
        if (this._orgList.find(item => item.org_id == orgId) == undefined) {
            await this.initLoadOrgList();
        }
        if (this._curOrgId != orgId) {
            return;
        }
        const res = await request(get_member({
            session_id: this.rootStore.userStore.sessionId,
            org_id: orgId,
            member_user_id: memberUserId,
        }));
        const tmpList = this._memberList.slice();
        const index = tmpList.findIndex(item => item.member_user_id == memberUserId);
        if (index == -1) {
            tmpList.unshift(res.member);
        } else {
            tmpList[index] = res.member;
        }
        runInAction(() => {
            this._memberList = tmpList;
        });
    }

    async onLeave(orgId: string, memberUserId: string, history: History) {
        if (memberUserId == this.rootStore.userStore.userInfo.userId) { //当前用户退出组织
            if (this._curOrgId == orgId) {
                await this.setCurOrgId("");
            }
            const tmpList = this._orgList.filter(item => item.org_id != orgId);
            runInAction(() => {
                this._orgList = tmpList;
            });
            if (this._curOrgId == orgId) {
                //TODO
                return;
            }
        }
        if (this._curOrgId != orgId) {
            return;
        }
        const tmpList = this._memberList.filter(item => item.member_user_id != memberUserId);
        runInAction(() => {
            this._memberList = tmpList;
        });
    }

    async onUpdateDepartMent(orgId: string, departMentId: string) {
        if (this._curOrgId != orgId) {
            return;
        }
        const res = await request(get_depart_ment({
            session_id: this.rootStore.userStore.sessionId,
            org_id: orgId,
            depart_ment_id: departMentId,
        }));
        const tmpList = this._departMentList.slice();
        const index = tmpList.findIndex(item => item.depart_ment_id == departMentId);
        if (index == -1) {
            tmpList.unshift(res.depart_ment_info);
        } else {
            tmpList[index] = res.depart_ment_info;
        }
        runInAction(() => {
            this._departMentList = tmpList;
        });
    }

    async onRemoveDepartMent(orgId: string, departMentId: string) {
        if (this._curOrgId != orgId) {
            return;
        }
        const tmpList = this._departMentList.filter(item => item.depart_ment_id != departMentId);
        runInAction(() => {
            this._departMentList = tmpList;
        });
    }

    async onUpdateMember(orgId: string, memberUserId: string) {
        if (this._curOrgId != orgId) {
            return;
        }
        const res = await request(get_member({
            session_id: this.rootStore.userStore.sessionId,
            org_id: orgId,
            member_user_id: memberUserId,
        }));

        const tmpList = this._memberList.slice();
        const index = tmpList.findIndex(item => item.member_user_id == memberUserId);
        if (index == -1) {
            tmpList.unshift(res.member);
        } else {
            tmpList[index] = res.member;
        }
        runInAction(() => {
            this._memberList = tmpList;
        });
    }

    private _showInviteMember = false;

    get showInviteMember(): boolean {
        return this._showInviteMember;
    }

    set showInviteMember(val: boolean) {
        runInAction(() => {
            this._showInviteMember = val;
        });
    }
} 