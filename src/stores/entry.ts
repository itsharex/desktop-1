import type { RootStore } from './index';
import { makeAutoObservable, runInAction } from 'mobx';
import type { EntryInfo, ENTRY_TYPE, EntryOrFolderInfo } from "@/api/project_entry";
import { get as get_entry, get_folder } from "@/api/project_entry";
import { request } from '@/utils/request';
import { WATCH_TARGET_ENTRY, unwatch, watch } from '@/api/project_watch';

export default class EntryStore {
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }
    rootStore: RootStore;

    private _curEntry: EntryInfo | null = null;
    private _editEntryId = "";
    private _entryOrFolderList: EntryOrFolderInfo[] = [];
    private _sysEntryList: EntryInfo[] = [];
    private _createEntryType: ENTRY_TYPE | null = null;
    private _curFolderId = "";

    reset() {
        runInAction(() => {
            this._curEntry = null;
            this._editEntryId = "";
            this._createEntryType = null;
        });
    }

    get curFolderId() {
        return this._curFolderId;
    }

    set curFolderId(val: string) {
        runInAction(() => {
            this._curFolderId = val;
        });
    }

    get curEntry(): EntryInfo | null {
        return this._curEntry;
    }

    set curEntry(val: EntryInfo | null) {
        runInAction(() => {
            this._curEntry = val;
        });
    }

    get editEntryId(): string {
        return this._editEntryId;
    }

    set editEntryId(val: string) {
        runInAction(() => {
            this._editEntryId = val;
        });
    }

    get entryOrFolderList(): EntryOrFolderInfo[] {
        return this._entryOrFolderList;
    }

    set entryOrFolderList(val: EntryOrFolderInfo[]) {
        runInAction(() => {
            this._entryOrFolderList = val;
        });
    }

    get sysEntryList(): EntryInfo[] {
        return this._sysEntryList;
    }

    set sysEntryList(val: EntryInfo[]) {
        runInAction(() => {
            this._sysEntryList = val;
        });
    }

    get createEntryType(): ENTRY_TYPE | null {
        return this._createEntryType;
    }

    set createEntryType(val: ENTRY_TYPE | null) {
        runInAction(() => {
            this._createEntryType = val;
        });
    }

    async loadEntry(entryId: string) {
        const res = await request(get_entry({
            session_id: this.rootStore.userStore.sessionId,
            project_id: this.rootStore.projectStore.curProjectId,
            entry_id: entryId,
        }));

        runInAction(() => {
            this._curEntry = res.entry;
        });
    }

    async onUpdateEntry(entryId: string) {
        const res = await request(get_entry({
            session_id: this.rootStore.userStore.sessionId,
            project_id: this.rootStore.projectStore.curProjectId,
            entry_id: entryId,
        }));
        runInAction(() => {
            if (entryId == (this._curEntry?.entry_id ?? "")) {
                this._curEntry = res.entry;
            }
            const tmpList = this._entryOrFolderList.slice();
            const index = tmpList.findIndex(item => item.id == entryId);
            if (index != -1) {
                tmpList[index] = {
                    id: res.entry.entry_id,
                    is_folder: false,
                    value: res.entry,
                };
                this._entryOrFolderList = tmpList;
            }

            const tmpList2 = this._sysEntryList.slice();
            const index2 = tmpList2.findIndex(item => item.entry_id == entryId);
            if (index2 != -1) {
                tmpList2[index2] = res.entry;
                this._sysEntryList = tmpList2;
            }
        });
    }

    async onRemoveEntry(entryId: string) {
        runInAction(() => {
            if (entryId == (this._curEntry?.entry_id ?? "")) {
                this._curEntry = null;
            }
            const tmpList = this._entryOrFolderList.filter(item => item.id != entryId);
            this._entryOrFolderList = tmpList;
        });
    }

    async onUpdateFolder(folderId: string) {
        const res = await request(get_folder({
            session_id: this.rootStore.userStore.sessionId,
            project_id: this.rootStore.projectStore.curProjectId,
            folder_id: folderId,
        }));
        runInAction(() => {
            const tmpList = this._entryOrFolderList.slice();
            const index = tmpList.findIndex(item => item.id == folderId);
            if (index != -1) {
                tmpList[index] = {
                    id: res.folder.folder_id,
                    is_folder: true,
                    value: res.folder,
                };
                this._entryOrFolderList = tmpList;
            }
        });
    }

    async onRemoveFolder(folderId: string) {
        runInAction(() => {
            const tmpList = this._entryOrFolderList.filter(item => item.id != folderId);
            this._entryOrFolderList = tmpList;
        });
    }

    async unwatchEntry(entryId: string) {
        await request(unwatch({
            session_id: this.rootStore.userStore.sessionId,
            project_id: this.rootStore.projectStore.curProjectId,
            target_type: WATCH_TARGET_ENTRY,
            target_id: entryId,
        }));
        await this.onUpdateEntry(entryId);
    }

    async watchEntry(entryId: string) {
        await request(watch({
            session_id: this.rootStore.userStore.sessionId,
            project_id: this.rootStore.projectStore.curProjectId,
            target_type: WATCH_TARGET_ENTRY,
            target_id: entryId,
        }));
        await this.onUpdateEntry(entryId);
    }
}