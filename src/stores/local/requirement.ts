import type { RequirementInfo } from "@/api/project_requirement";
import { get_requirement } from "@/api/project_requirement";
import { runInAction } from "mobx";
import { listen, type UnlistenFn, type Event } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';
import { request } from "@/utils/request";


export class LocalRequirementStore {
    constructor(sessionId: string, projectId: string) {
        this._sessionId = sessionId;
        this._projectId = projectId;
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
                const requirementId = (ev.payload.RequirementNotice?.UpdateRequirementNotice?.requirement_id ?? "");
                if (this._itemList.find(item => item.requirement_id == requirementId) !== undefined) {
                    const tmpList = this._itemList.slice();
                    const res = await request(get_requirement({
                        session_id: this._sessionId,
                        project_id: this._projectId,
                        requirement_id: requirementId,
                    }));
                    const index = tmpList.findIndex(item => item.requirement_id == requirementId);
                    if (index != -1) {
                        tmpList[index] = res.requirement;
                        this.itemList = tmpList;
                    }

                }
            } else if (ev.payload.RequirementNotice.RemoveRequirementNotice !== undefined && ev.payload.RequirementNotice.RemoveRequirementNotice.project_id == this._projectId) {
                const tmpList = this._itemList.filter(item => item.requirement_id != (ev.payload.RequirementNotice?.RemoveRequirementNotice?.requirement_id ?? ""));
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