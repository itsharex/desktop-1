import React from "react";
import { makeAutoObservable, runInAction } from 'mobx';
import type { ApiGroupInfo, ApiItemInfo } from "@/api/http_custom";
import { get_session, get_user_id } from "@/api/user";
import type { ApiCollInfo } from "@/api/api_collection";
import { get as get_coll_info } from "@/api/api_collection";
import { request } from "@/utils/request";
import { list_api_item, list_group, get_custom } from "@/api/http_custom";


class ApiStore {
    constructor() {
        makeAutoObservable(this);
    }

    private _projectId = "";
    private _apiCollId = "";
    private _remoteAddr = "";
    private _adminUser = false;

    get projectId(): string {
        return this._projectId;
    }
    set projectId(val: string) {
        runInAction(() => {
            this._projectId = val;
        });
    }

    get apiCollId(): string {
        return this._apiCollId;
    }

    set apiCollId(val: string) {
        runInAction(() => {
            this._apiCollId = val;
        });
    }

    get remoteAddr(): string {
        return this._remoteAddr;
    }

    set remoteAddr(val: string) {
        runInAction(() => {
            this._remoteAddr = val;
        });
    }

    get adminUser(): boolean {
        return this._adminUser;
    }

    set adminUser(val: boolean) {
        runInAction(() => {
            this._adminUser = val;
        });
    }

    //=========================================================

    private _curUserId = "";
    private _sessionId = "";

    get curUserId(): string {
        return this._curUserId;
    }

    get sessionId(): string {
        return this._sessionId;
    }

    async initUser() {
        const tmpUserId = await get_user_id();
        const tmpSessId = await get_session();
        runInAction(() => {
            this._curUserId = tmpUserId;
            this._sessionId = tmpSessId;
        });
    }

    //=======================================================
    private _apiCollInfo: ApiCollInfo | null = null;
    private _protocol = "https"

    get apiCollInfo(): ApiCollInfo | null {
        return this._apiCollInfo;
    }
    get protocol(): string {
        return this._protocol;
    }

    async loadApiCollInfo() {
        const res = await request(get_coll_info({
            session_id: this._sessionId,
            project_id: this._projectId,
            api_coll_id: this._apiCollId,
        }));
        const res2 = await request(get_custom({
            session_id: this._sessionId,
            project_id: this._projectId,
            api_coll_id: this._apiCollId,
        }));
        runInAction(() => {
            this._apiCollInfo = res.info;
            this._protocol = res2.extra_info.net_protocol;
        });
    }
    //==========================================================
    private _tabApiIdList: string[] = [];

    get tabApiIdList(): string[] {
        return this._tabApiIdList;
    }

    set tabApiIdList(val: string[]) {
        runInAction(() => {
            this._tabApiIdList = val;
            console.log(val);
        });
    }
    //==========================================================

    private _groupList: ApiGroupInfo[] = [];
    private _apiItemList: ApiItemInfo[] = [];

    get groupList(): ApiGroupInfo[] {
        return this._groupList;
    }

    get apiItemList(): ApiItemInfo[] {
        return this._apiItemList;
    }

    async loadGroupList() {
        const res = await request(list_group({
            session_id: this._sessionId,
            project_id: this._projectId,
            api_coll_id: this._apiCollId,
        }));
        runInAction(() => {
            this._groupList = res.group_list;
        });
    }

    async loadApiItemList() {
        const res = await request(list_api_item({
            session_id: this._sessionId,
            project_id: this._projectId,
            api_coll_id: this._apiCollId,
            filter_by_group_id: false,
            group_id: "",
        }));
        runInAction(() => {
            this._apiItemList = res.item_list;
        });
    }

    getApiItem(apiItemId: string): ApiItemInfo | null {
        const index = this._apiItemList.findIndex(item => item.api_item_id == apiItemId);
        if (index != -1) {
            return this._apiItemList[index];
        }
        return null;
    }
}

const stores = React.createContext({
    api: new ApiStore(),
});

export const useCustomStores = () => React.useContext(stores);

export default stores;
