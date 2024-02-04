import { makeAutoObservable, runInAction } from 'mobx';

export class ProjectModalStore {
    constructor() {
        makeAutoObservable(this);
    }

    //测试用例详情相关
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

    //创建测试用例相关
    private _createTestCase = false;
    private _createTestCaseParentFolderId = "";
    private _createTestCaseEnableFolder = false;

    async setCreateTestCase(show: boolean, parentFolderId: string, enableFolder: boolean) {
        runInAction(() => {
            this._createTestCase = show;
            this._createTestCaseParentFolderId = parentFolderId;
            this._createTestCaseEnableFolder = enableFolder;
        });
    }

    get createTestCase() {
        return this._createTestCase;
    }

    get createTestCaseParentFolderId() {
        return this._createTestCaseParentFolderId;
    }

    get createTestCaseEnableFolder() {
        return this._createTestCaseEnableFolder;
    }

    //需求详情相关
    private _requirementId = "";
    private _requirementTab: "detail" | "issue" | "fourq" | "kano" | "event" | "comment" = "detail";

    get requirementId() {
        return this._requirementId;
    }

    set requirementId(val: string) {
        runInAction(() => {
            this._requirementId = val;
        });
    }

    get requirementTab() {
        return this._requirementTab;
    }

    set requirementTab(val: "detail" | "issue" | "fourq" | "kano" | "event" | "comment") {
        runInAction(() => {
            this._requirementTab = val;
        });
    }
}