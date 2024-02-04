import { makeAutoObservable, runInAction } from 'mobx';

export class ProjectModalStore {
    constructor() {
        makeAutoObservable(this);
    }

    //测试用例相关
    private _testCaseId = "";
    private _testCaseTab: "detail" | "result" | "comment" = "detail";
    private _testCaseLinkSpritId = "";

    get testCaseId() {
        return this._testCaseId;
    }

    set testCaseId(val: string) {
        runInAction(() => {
            this._testCaseId = val;
        });
    }

    get testCaseTab() {
        return this._testCaseTab;
    }

    set testCaseTab(val: "detail" | "result" | "comment") {
        runInAction(() => {
            this._testCaseTab = val;
        });
    }

    get testCaseLinkSpritId() {
        return this._testCaseLinkSpritId;
    }

    set testCaseLinkSpritId(val: string) {
        runInAction(() => {
            this._testCaseLinkSpritId = val;
        });
    }
}