import type { RootStore } from './index';
import { makeAutoObservable, runInAction } from 'mobx';
import type { IssueInfo, ISSUE_TYPE } from '@/api/project_issue';
import { SORT_KEY_UPDATE_TIME, SORT_TYPE_DSC } from '@/api/project_issue';
import { ISSUE_TYPE_BUG, ISSUE_TYPE_TASK, list as list_issue, get as get_issue } from '@/api/project_issue';
import { request } from '@/utils/request';
import type { CaseInfo } from "@/api/project_testcase";
import { list_by_sprit } from "@/api/project_testcase";

export interface SpritStatus {
    taskCount: number;
    bugCount: number;
    missTimeTaskCount: number;
    missProgressTaskCount: number;
    missTimeBugCount: number;
    missProgressBugCount: number;
    missExecTaskCount: number;
    missExecBugCount: number;
}

export default class SpritStore {
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }
    rootStore: RootStore;

    private _spritTab = "";
    private _curSpritVersion: number = 0;
    private _taskList: IssueInfo[] = [];
    private _bugList: IssueInfo[] = [];
    private _caseList: CaseInfo[] = [];

    get spritTab(): string {
        return this._spritTab;
    }

    set spritTab(val: string) {
        runInAction(() => {
            this._spritTab = val;
        });
    }

    get taskList(): IssueInfo[] {
        return this._taskList;
    }

    get bugList(): IssueInfo[] {
        return this._bugList;
    }

    get caseList(): CaseInfo[] {
        return this._caseList;
    }

    get curSpritVersion(): number {
        return this._curSpritVersion;
    }

    incCurSpritVersion() {
        runInAction(() => {
            this._curSpritVersion += 1;
        });
    }

    async loadCurSprit() {
        runInAction(() => {
            this._taskList = [];
            this._bugList = [];
            this._caseList = [];
        });
        await this.loadIssue(ISSUE_TYPE_TASK);
        await this.loadIssue(ISSUE_TYPE_BUG);
    }

    private async loadIssue(issueType: ISSUE_TYPE) {
        if (this.rootStore.entryStore.curEntry == null) {
            return;
        }
        const res = await request(list_issue({
            session_id: this.rootStore.userStore.sessionId,
            project_id: this.rootStore.projectStore.curProjectId,
            list_param: {
                filter_by_issue_type: true,
                issue_type: issueType,
                filter_by_state: false,
                state_list: [],
                filter_by_create_user_id: false,
                create_user_id_list: [],
                filter_by_assgin_user_id: false,
                assgin_user_id_list: [],
                assgin_user_type: 0,
                filter_by_sprit_id: true,
                sprit_id_list: [this.rootStore.entryStore.curEntry.entry_id],
                filter_by_create_time: false,
                from_create_time: 0,
                to_create_time: 0,
                filter_by_update_time: false,
                from_update_time: 0,
                to_update_time: 0,
                filter_by_title_keyword: false,
                title_keyword: "",
                filter_by_tag_id_list: false,
                tag_id_list: [],
                filter_by_watch: false,
                ///任务相关
                filter_by_task_priority: false,
                task_priority_list: [],
                ///缺陷相关
                filter_by_software_version: false,
                software_version_list: [],
                filter_by_bug_priority: false,
                bug_priority_list: [],
                filter_by_bug_level: false,
                bug_level_list: [],
            },
            sort_type: SORT_TYPE_DSC,
            sort_key: SORT_KEY_UPDATE_TIME,
            offset: 0,
            limit: 999,
        }));
        //按issue index倒序
        const infoList = res.info_list.sort((a, b) => b.issue_index - a.issue_index);
        runInAction(() => {
            if (issueType == ISSUE_TYPE_TASK) {
                this._taskList = infoList;
            } else if (issueType == ISSUE_TYPE_BUG) {
                this._bugList = infoList;
            }
        });
    }

    addIssueList(issueList: IssueInfo[]) {
        if (issueList.length == 0) {
            return;
        }
        const tmpTaskList = this._taskList.slice();
        const tmpBugList = this._bugList.slice();
        for (const issue of issueList) {
            if ((issue.issue_type == ISSUE_TYPE_TASK) && (tmpTaskList.findIndex(item => item.issue_id == issue.issue_id) == -1)) {
                tmpTaskList.unshift(issue);
            } else if ((issue.issue_type == ISSUE_TYPE_BUG) && (tmpBugList.findIndex(item => item.issue_id == issue.issue_id) == -1)) {
                tmpBugList.unshift(issue);
            }
        }
        tmpTaskList.sort((a, b) => b.issue_index - a.issue_index);
        tmpBugList.sort((a, b) => b.issue_index - a.issue_index);
        runInAction(() => {
            this._taskList = tmpTaskList;
            this._bugList = tmpBugList;
        });
    }

    removeIssue(issueId: string) {
        const tmpTaskList = this._taskList.filter(item => item.issue_id != issueId);
        const tmpBugList = this._bugList.filter(item => item.issue_id != issueId);
        runInAction(() => {
            this._taskList = tmpTaskList;
            this._bugList = tmpBugList;
        });
    }

    async onNewIssue(issueId: string) {
        const res = await request(get_issue(this.rootStore.userStore.sessionId, this.rootStore.projectStore.curProjectId, issueId));
        if (res.info.issue_type == ISSUE_TYPE_TASK) {
            const tmpList = this._taskList.slice();
            const index = tmpList.findIndex(item => item.issue_id == issueId);
            if (index != -1) {
                tmpList[index] = res.info;
            } else {
                tmpList.unshift(res.info);
            }
            runInAction(() => {
                this._taskList = tmpList;
            });
        } else if (res.info.issue_type == ISSUE_TYPE_BUG) {
            const tmpList = this._bugList.slice();
            const index = tmpList.findIndex(item => item.issue_id == issueId);
            if (index != -1) {
                tmpList[index] = res.info;
            } else {
                tmpList.unshift(res.info);
            }
            runInAction(() => {
                this._bugList = tmpList;
            })
        }
    }

    async updateIssue(issueId: string) {
        const res = await request(get_issue(this.rootStore.userStore.sessionId, this.rootStore.projectStore.curProjectId, issueId));
        const taskIndex = this._taskList.findIndex(item => item.issue_id == issueId);
        const bugIndex = this._bugList.findIndex(item => item.issue_id == issueId);
        if (taskIndex == -1 && bugIndex == -1) {
            return;
        }
        runInAction(() => {
            if (taskIndex != -1) {
                const tmpList = this._taskList.slice();
                tmpList[taskIndex] = res.info;
                this._taskList = tmpList;
            }
            if (bugIndex != -1) {
                const tmpList = this._bugList.slice();
                tmpList[bugIndex] = res.info;
                this._bugList = tmpList;
            }
        });
    }

    async loadCaseList() {
        if (this.rootStore.entryStore.curEntry == null) {
            return;
        }
        const res = await request(list_by_sprit({
            session_id: this.rootStore.userStore.sessionId,
            project_id: this.rootStore.projectStore.curProjectId,
            sprit_id: this.rootStore.entryStore.curEntry.entry_id,
        }));
        runInAction(() => {
            this._caseList = res.case_list;
        });
    }

    get spritStatus(): SpritStatus {
        const status = {
            taskCount: this._taskList.length,
            bugCount: this._bugList.length,
            missTimeTaskCount: 0,
            missProgressTaskCount: 0,
            missTimeBugCount: 0,
            missProgressBugCount: 0,
            missExecTaskCount: 0,
            missExecBugCount: 0,
        };
        for (const bug of this._bugList) {
            if (bug.exec_user_id == "") {
                status.missExecBugCount += 1;
            }
            if (bug.has_start_time == false || bug.has_end_time == false) {
                status.missTimeBugCount += 1;
            }
            if (bug.has_estimate_minutes == false || bug.has_remain_minutes == false) {
                status.missProgressBugCount += 1;
            }
        }
        for (const task of this._taskList) {
            if (task.exec_user_id == "") {
                status.missExecTaskCount += 1;
            }
            if (task.has_start_time == false || task.has_end_time == false) {
                status.missTimeTaskCount += 1;
            }
            if (task.has_estimate_minutes == false || task.has_remain_minutes == false) {
                status.missProgressTaskCount += 1;
            }
        }
        return status;
    }
}