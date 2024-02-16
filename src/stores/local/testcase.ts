import type { CaseInfo, FolderOrCaseInfo } from "@/api/project_testcase";
import { get_folder, get_case } from "@/api/project_testcase";
import { makeAutoObservable, runInAction } from "mobx";
import { listen, type UnlistenFn, type Event } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';
import { request } from "@/utils/request";

export class LocalTestcaseStore {
    constructor(sessionId: string, projectId: string, spritId: string) {
        this._sessionId = sessionId;
        this._projectId = projectId;
        this._spritId = spritId;
        makeAutoObservable(this);
        listen<NoticeType.AllNotice>('notice', (ev) => {
            this.processEvent(ev);
        }).then(unlistenFn => this._unlistenFn = unlistenFn);
    }

    private _sessionId: string;
    private _projectId: string;
    private _spritId: string;
    private _unlistenFn: UnlistenFn | null = null;

    private _itemList = [] as FolderOrCaseInfo[];

    unlisten() {
        if (this._unlistenFn != null) {
            this._unlistenFn();
        }
    }

    private async processEvent(ev: Event<NoticeType.AllNotice>) {
        if (ev.payload.TestcaseNotice !== undefined) {
            if (ev.payload.TestcaseNotice.UpdateFolderNotice !== undefined) {
                const folderId = ev.payload.TestcaseNotice.UpdateFolderNotice.folder_id;
                if (this._itemList.find(item => item.id == folderId) !== undefined) {
                    const res = await request(get_folder({
                        session_id: this._sessionId,
                        project_id: this._projectId,
                        folder_id: folderId,
                    }));
                    const tmpList = this._itemList.slice();
                    const index = tmpList.findIndex(item => item.id == folderId);
                    if (index != -1) {
                        tmpList[index] = {
                            id: res.folder_info.folder_id,
                            dataType: "folder",
                            dataValue: res.folder_info,
                        };
                        this.itemList = tmpList;
                    }
                }
            } else if (ev.payload.TestcaseNotice.UpdateCaseNotice !== undefined) {
                const caseId = ev.payload.TestcaseNotice.UpdateCaseNotice.case_id;
                if (this._itemList.find(item => item.id == caseId) !== undefined) {
                    const res = await request(get_case({
                        session_id: this._sessionId,
                        project_id: this._projectId,
                        case_id: caseId,
                        sprit_id: this._spritId,
                    }));
                    const tmpList = this._itemList.slice();
                    const index = tmpList.findIndex(item => item.id == caseId);
                    if (index != -1) {
                        tmpList[index] = {
                            id: res.case_detail.case_info.case_id,
                            dataType: "case",
                            dataValue: res.case_detail.case_info,
                        };
                        this.itemList = tmpList;
                    }
                }
            } else if (ev.payload.TestcaseNotice.RemoveFolderNotice !== undefined) {
                const folderId = ev.payload.TestcaseNotice.RemoveFolderNotice.folder_id;
                const tmpList = this._itemList.filter(item => item.id != folderId);
                this.itemList = tmpList;
            } else if (ev.payload.TestcaseNotice.RemoveCaseNotice !== undefined) {
                const caseId = ev.payload.TestcaseNotice.RemoveCaseNotice.case_id;
                const tmpList = this._itemList.filter(item => item.id != caseId);
                this.itemList = tmpList;
            } else if (ev.payload.TestcaseNotice.LinkSpritNotice !== undefined && ev.payload.TestcaseNotice.LinkSpritNotice.sprit_id == this._spritId) {
                const caseId = ev.payload.TestcaseNotice.LinkSpritNotice.case_id;
                const res = await request(get_case({
                    session_id: this._sessionId,
                    project_id: this._projectId,
                    case_id: caseId,
                    sprit_id: this._spritId,
                }));
                const tmpList = this._itemList.slice();
                const index = tmpList.findIndex(item => item.id == caseId);
                if (index != -1) {
                    tmpList[index] = {
                        id: res.case_detail.case_info.case_id,
                        dataType: "case",
                        dataValue: res.case_detail.case_info,
                    };
                    this.itemList = tmpList;
                } else {
                    tmpList.unshift({
                        id: res.case_detail.case_info.case_id,
                        dataType: "case",
                        dataValue: res.case_detail.case_info,
                    });
                    this.itemList = tmpList;
                }
            } else if (ev.payload.TestcaseNotice.UnlinkSpritNotice !== undefined && ev.payload.TestcaseNotice.UnlinkSpritNotice.sprit_id == this._spritId) {
                const caseId = ev.payload.TestcaseNotice.UnlinkSpritNotice.case_id;
                const tmpList = this._itemList.filter(item => item.id != caseId);
                this.itemList = tmpList;
            }
        }
    }

    get itemList() {
        return this._itemList;
    }

    set itemList(val: FolderOrCaseInfo[]) {
        runInAction(() => {
            this._itemList = val;
        });
    }

    setWatch(folderOrEntryId: string, myWatch: boolean) {
        const tmpList = this._itemList.slice();
        const index = tmpList.findIndex(item => item.id == folderOrEntryId);
        if (index != -1 && tmpList[index].dataType == "case") {
            (tmpList[index].dataValue as CaseInfo).my_watch = myWatch;
            this.itemList = tmpList;
        }
    }
}