//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { RequirementInfo } from "@/api/project_requirement";
import { get_requirement } from "@/api/project_requirement";
import { makeAutoObservable, runInAction } from "mobx";
import { listen, type UnlistenFn, type Event } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';
import { request } from "@/utils/request";


export class LocalRequirementStore {
    constructor(sessionId: string, projectId: string) {
        this._sessionId = sessionId;
        this._projectId = projectId;
        makeAutoObservable(this);
        listen<NoticeType.AllNotice>('notice', (ev) => {
            this.processEvent(ev);
        }).then(unlistenFn => this._unlistenFn = unlistenFn);
    }

    private _sessionId: string;
    private _projectId: string;
    private _unlistenFn: UnlistenFn | null = null;

    private _itemList = [] as RequirementInfo[];

    unlisten() {
        if (this._unlistenFn != null) {
            this._unlistenFn();
        }
    }

    private async processEvent(ev: Event<NoticeType.AllNotice>) {
        if (ev.payload.RequirementNotice !== undefined) {
            if (ev.payload.RequirementNotice.UpdateRequirementNotice !== undefined && ev.payload.RequirementNotice.UpdateRequirementNotice.project_id == this._projectId) {
                const requirementId = ev.payload.RequirementNotice.UpdateRequirementNotice.requirement_id;
                if (this._itemList.find(item => item.requirement_id == requirementId) !== undefined) {
                    const res = await request(get_requirement({
                        session_id: this._sessionId,
                        project_id: this._projectId,
                        requirement_id: requirementId,
                    }));
                    const tmpList = this._itemList.slice();
                    const index = tmpList.findIndex(item => item.requirement_id == requirementId);
                    if (index != -1) {
                        tmpList[index] = res.requirement;
                        this.itemList = tmpList;
                    }
                }
            } else if (ev.payload.RequirementNotice.RemoveRequirementNotice !== undefined && ev.payload.RequirementNotice.RemoveRequirementNotice.project_id == this._projectId) {
                const requirementId = ev.payload.RequirementNotice.RemoveRequirementNotice.requirement_id;
                const tmpList = this._itemList.filter(item => item.requirement_id != requirementId);
                this.itemList = tmpList;
            }
        }
    }

    get itemList() {
        return this._itemList;
    }

    set itemList(val: RequirementInfo[]) {
        runInAction(() => {
            this._itemList = val;
        });
    }

    setWatch(requirementId: string, myWatch: boolean) {
        const tmpList = this._itemList.slice();
        const index = tmpList.findIndex(item => item.requirement_id == requirementId);
        if (index != -1) {
            tmpList[index].my_watch = myWatch;
            this.itemList = tmpList;
        }
    }

}