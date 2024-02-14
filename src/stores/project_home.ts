import { type ENTRY_TYPE, ENTRY_TYPE_NULL } from '@/api/project_entry';
import { PROJECT_HOME_TYPE } from '@/utils/constant';
import { makeAutoObservable, runInAction } from 'mobx';

export class ProjectHomeStore {
    constructor() {
        makeAutoObservable(this);
    }
    private _homeType = PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT;

    get homeType() {
        return this._homeType;
    }

    set homeType(val: PROJECT_HOME_TYPE) {
        if (val == this._homeType) {
            return;
        }
        runInAction(() => {
            this._homeType = val;
            if (val == PROJECT_HOME_TYPE.PROJECT_HOME_CONTENT) {
                this._contentCurPage = 0;
                this._contentTotalCount = 0;
                this._contentKeyword = "";
                this._contentTagIdList = [] as string[];
                this._contentEntryType = ENTRY_TYPE_NULL;
                this._contentFilterByWatch = false;
            } else {
                this._otherCurPage = 0;
                this._otherTotalCount = 0;
                this._otherKeyword = "";
                this._otherTagIdList = [] as string[];
                this._otherFilterByWatch = false;
                this._otherMarkRemove = false;
            }
        });
    }

    //内容面板相关
    private _contentActiveKey: "folder" | "list" | "close" = "folder";
    private _contentCurPage = 0;
    private _contentTotalCount = 0;
    private _contentKeyword = "";
    private _contentTagIdList = [] as string[];
    private _contentEntryType = ENTRY_TYPE_NULL;
    private _contentFilterByWatch = false;

    get contentActiveKey() {
        return this._contentActiveKey;
    }

    set contentActiveKey(val: "folder" | "list" | "close") {
        runInAction(() => {
            this._contentActiveKey = val;
            this._contentCurPage = 0;
            this._contentTotalCount = 0;
            this._contentKeyword = "";
            this._contentTagIdList = [];
            this._contentEntryType = ENTRY_TYPE_NULL;
            this._contentFilterByWatch = false;
        });
    }


    get contentCurPage() {
        return this._contentCurPage;
    }

    set contentCurPage(val: number) {
        runInAction(() => {
            this._contentCurPage = val;
        });
    }

    get contentTotalCount() {
        return this._contentTotalCount;
    }

    set contentTotalCount(val: number) {
        runInAction(() => {
            this._contentTotalCount = val;
        });
    }

    get contentKeyword() {
        return this._contentKeyword;
    }

    set contentKeyword(val: string) {
        runInAction(() => {
            this._contentKeyword = val;
        });
    }

    get contentTagIdList() {
        return this._contentTagIdList;
    }

    set contentTagIdList(val: string[]) {
        runInAction(() => {
            this._contentTagIdList = val;
        });
    }

    get contentEntryType() {
        return this._contentEntryType;
    }

    set contentEntryType(val: ENTRY_TYPE) {
        runInAction(() => {
            this._contentEntryType = val;
        });
    }

    get contentFilterByWatch() {
        return this._contentFilterByWatch;
    }

    set contentFilterByWatch(val: boolean) {
        runInAction(() => {
            this._contentFilterByWatch = val;
        });
    }

    //非内容面板
    private _otherCurPage = 0;
    private _otherTotalCount = 0;
    private _otherKeyword = "";
    private _otherTagIdList = [] as string[];
    private _otherFilterByWatch = false;
    private _otherMarkRemove = false;

    get otherCurPage() {
        return this._otherCurPage;
    }

    set otherCurPage(val: number) {
        runInAction(() => {
            this._otherCurPage = val;
        });
    }

    get otherTotalCount() {
        return this._otherTotalCount;
    }

    set otherTotalCount(val: number) {
        runInAction(() => {
            this._otherTotalCount = val;
        });
    }

    get otherKeyword() {
        return this._otherKeyword;
    }

    set otherKeyword(val: string) {
        runInAction(() => {
            this._otherKeyword = val;
        });
    }

    get otherTagIdList() {
        return this._otherTagIdList;
    }

    set otherTagIdList(val: string[]) {
        runInAction(() => {
            this._otherTagIdList = val;
        });
    }

    get otherFilterByWatch() {
        return this._otherFilterByWatch;
    }

    set otherFilterByWatch(val: boolean) {
        runInAction(() => {
            this._otherFilterByWatch = val;
        });
    }

    get otherMarkRemove() {
        return this._otherMarkRemove;
    }

    set otherMarkRemove(val: boolean) {
        runInAction(() => {
            this._otherMarkRemove = val;
        });
    }
}