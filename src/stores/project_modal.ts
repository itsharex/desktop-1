//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { type ISSUE_TYPE, ISSUE_TYPE_TASK } from '@/api/project_issue';
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

    //创建需求相关
    private _createRequirement = false;

    get createRequirement() {
        return this._createRequirement;
    }

    set createRequirement(val: boolean) {
        runInAction(() => {
            this._createRequirement = val;
        });
    }

    // 工单详情相关
    private _issueId = "";
    private _issueType = ISSUE_TYPE_TASK;
    private _issueTab: "detail" | "subtask" | "mydep" | "depme" | "event" | "comment" = "detail";

    get issueId() {
        return this._issueId;
    }
    get issueType() {
        return this._issueType;
    }

    setIssueIdAndType(issueId: string, issueType: ISSUE_TYPE) {
        runInAction(() => {
            this._issueId = issueId;
            this._issueType = issueType;
        });
    }

    get issueTab() {
        return this._issueTab;
    }

    set issueTab(val: "detail" | "subtask" | "mydep" | "depme" | "event" | "comment") {
        runInAction(() => {
            this._issueTab = val;
        });
    }

    //创建工单相关
    private _createIssue = false;
    private _createIssueType = ISSUE_TYPE_TASK;
    private _createIssueLinkSpritId = "";

    setCreateIssue(show: boolean, issueType: ISSUE_TYPE, linkSpritId: string) {
        runInAction(() => {
            this._createIssue = show;
            this._createIssueType = issueType;
            this._createIssueLinkSpritId = linkSpritId;
        });
    }

    get createIssue() {
        return this._createIssue;
    }

    get createIssueType() {
        return this._createIssueType;
    }

    get createIssueLinkSpritId() {
        return this._createIssueLinkSpritId;
    }

    //知识点提示
    private _ideaKeyword = "";

    get ideaKeyword() {
        return this._ideaKeyword;
    }

    set ideaKeyword(val: string) {
        runInAction(() => {
            this._ideaKeyword = val;
        });
    }

    //创建公告
    private _createBulletin = false;

    get createBulletin() {
        return this._createBulletin;
    }

    set createBulletin(val: boolean) {
        runInAction(() => {
            this._createBulletin = val;
        });
    }

    //显示公告
    private _bulletinId = "";

    get bulletinId() {
        return this._bulletinId;
    }

    set bulletinId(val: string) {
        runInAction(() => {
            this._bulletinId = val;
        });
    }
}