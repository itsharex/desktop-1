//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { get_head_info, list_git_filter, list_repo, remove_repo,list_remote as list_local_remote } from '@/api/local_repo';
import { makeAutoObservable, runInAction } from 'mobx';
import type { LocalRepoInfo, HeadInfo, LocalRepoRemoteInfo } from "@/api/local_repo";
import { message } from 'antd';
import { exists as exists_path } from '@tauri-apps/api/fs';
import { check_git_env } from "@/api/git_wrap";
import type { GitEnvCheckResult } from "@/api/git_wrap";

export interface LocalRepoExtInfo {
    id: string;
    repoInfo: LocalRepoInfo;
    headInfo: HeadInfo;
    filterList: string[];
    remoteList: LocalRepoRemoteInfo[];
}

export default class LocalRepoStore {
    constructor() {
        makeAutoObservable(this);
    }

    private _checkResult: GitEnvCheckResult | null = null;

    get checkResult() {
        return this._checkResult;
    }

    private _repoExtList: LocalRepoExtInfo[] = [];

    get repoExtList() {
        return this._repoExtList;
    }

    async loadRepoList() {
        try {
            const res = await list_repo();
            const tmpList = [] as LocalRepoExtInfo[];
            for (const repo of res) {
                try {
                    const exist = await exists_path(repo.path);
                    if (!exist) {
                        await remove_repo(repo.id);
                        continue;
                    }
                    const headInfo = await get_head_info(repo.path);
                    const filterList = await list_git_filter(repo.path);
                    const remoteList = await list_local_remote(repo.path);
                    tmpList.push({
                        id: repo.id,
                        repoInfo: repo,
                        headInfo: headInfo,
                        filterList: filterList,
                        remoteList: remoteList,
                    });
                } catch (e) {
                    console.log(e);
                }
            }
            runInAction(() => {
                this._repoExtList = tmpList;
            });
        } catch (e) {
            console.log(e);
            message.error(`${e}`);
        }
    };

    async onUpdateRepo(repoId: string) {
        const tmpList = this._repoExtList.slice();
        const index = tmpList.findIndex(item => item.id == repoId);
        if (index == -1) {
            return;
        }
        try {
            const headInfo = await get_head_info(tmpList[index].repoInfo.path);
            const filterList = await list_git_filter(tmpList[index].repoInfo.path);
            tmpList[index].headInfo = headInfo;
            tmpList[index].filterList = filterList;
            runInAction(() => {
                this._repoExtList = tmpList;
            });
        } catch (e) {
            console.log(e);
        }
    }

    async removeRepo(repoId: string) {
        await remove_repo(repoId);
        await this.loadRepoList();
    }

    async checkGitEnv() {
        const res = await check_git_env();
        runInAction(() => {
            this._checkResult = res;
        });
    }

    async init() {
        await this.checkGitEnv();
        await this.loadRepoList();
    }
}
