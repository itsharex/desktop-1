//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { ISSUE_TYPE, IssueInfo } from "@/api/project_issue";
import { get as get_issue } from "@/api/project_issue";
import { makeAutoObservable, runInAction } from "mobx";
import { listen, type UnlistenFn, type Event } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';
import { request } from "@/utils/request";

export class LocalIssueStore {
    constructor(sessionId: string, projectId: string, spritId: string, issueType: ISSUE_TYPE | null = null) {
        this._sessionId = sessionId;
        this._projectId = projectId;
        this._spritId = spritId;
        this._issueType = issueType;
        makeAutoObservable(this);
        listen<NoticeType.AllNotice>('notice', (ev) => {
            this.processEvent(ev);
        }).then(unlistenFn => this._unlistenFn = unlistenFn);
    }

    private _sessionId: string;
    private _projectId: string;
    private _spritId: string;
    private _issueType: ISSUE_TYPE | null;
    private _unlistenFn: UnlistenFn | null = null;

    private _itemList = [] as IssueInfo[];

    unlisten() {
        if (this._unlistenFn != null) {
            this._unlistenFn();
        }
    }

    private async processEvent(ev: Event<NoticeType.AllNotice>) {
        if (ev.payload.IssueNotice !== undefined) {
            if (ev.payload.IssueNotice.UpdateIssueNotice !== undefined) {
                const issueId = ev.payload.IssueNotice.UpdateIssueNotice.issue_id;
                if (this._itemList.find(item => item.issue_id == issueId) !== undefined) {
                    const res = await request(get_issue(this._sessionId, this._projectId, issueId));
                    const tmpList = this._itemList.slice();
                    const index = tmpList.findIndex(item => item.issue_id == issueId);
                    if (index != -1) {
                        tmpList[index] = res.info;
                        this.itemList = tmpList;
                    }
                }
            } else if (ev.payload.IssueNotice.RemoveIssueNotice !== undefined) {
                const issueId = ev.payload.IssueNotice.RemoveIssueNotice.issue_id;
                const tmpList = this._itemList.filter(item => item.issue_id != issueId);
                this.itemList = tmpList;
            } else if (ev.payload.IssueNotice.SetSpritNotice !== undefined && this._spritId != "") {
                const issueId = ev.payload.IssueNotice.SetSpritNotice.issue_id;
                if (ev.payload.IssueNotice.SetSpritNotice.old_sprit_id == this._spritId && ev.payload.IssueNotice.SetSpritNotice.new_sprit_id != this._spritId) {
                    const tmpList = this._itemList.filter(item => item.issue_id != issueId);
                    this.itemList = tmpList;
                } else if (ev.payload.IssueNotice.SetSpritNotice.old_sprit_id != this._spritId && ev.payload.IssueNotice.SetSpritNotice.new_sprit_id == this._spritId) {
                    const res = await request(get_issue(this._sessionId, this._projectId, issueId));
                    if (this._issueType != null && this._issueType != res.info.issue_type) {
                        return;
                    }
                    const tmpList = this._itemList.slice();
                    tmpList.unshift(res.info);
                    this.itemList = tmpList;
                }
            }
        }
    }

    get itemList() {
        return this._itemList;
    }

    set itemList(val: IssueInfo[]) {
        runInAction(() => {
            this._itemList = val;
        });
    }

    setWatch(issueId: string, myWatch: boolean) {
        const tmpList = this._itemList.slice();
        const index = tmpList.findIndex(item => item.issue_id == issueId);
        if (index != -1) {
            tmpList[index].my_watch = myWatch;
            this.itemList = tmpList;
        }
    }
}