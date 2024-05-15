//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { get_head_info, list_config, list_git_filter, list_repo, remove_repo } from '@/api/local_repo';
import { makeAutoObservable, runInAction } from 'mobx';
import type { LocalRepoInfo, HeadInfo } from "@/api/local_repo";
import { message } from 'antd';

export interface LocalRepoExtInfo {
    id: string;
    repoInfo: LocalRepoInfo;
    headInfo: HeadInfo;
    filterList: string[];
}

export default class LocalRepoStore {
    constructor() {
        makeAutoObservable(this);
    }

    private _hasGitConfig = false;

    get hasGitConfig() {
        return this._hasGitConfig;
    }

    private _repoExtList: LocalRepoExtInfo[] = [];

    get repoExtList() {
        return this._repoExtList;
    }

    async checkGitConfig() {
        let name = "";
        let email = "";
        const cfgItemList = await list_config();
        for (const cfgItem of cfgItemList) {
            if (cfgItem.name == "user.name") {
                name = cfgItem.value;
            } else if (cfgItem.name == "user.email") {
                email = cfgItem.value;
            }
        }
        runInAction(() => {
            this._hasGitConfig = (name != "" && email != "")
        })
    };


    async loadRepoList() {
        try {
            const res = await list_repo();
            const tmpList = [] as LocalRepoExtInfo[];
            for (const repo of res) {
                try {
                    const headInfo = await get_head_info(repo.path);
                    const filterList = await list_git_filter(repo.path);
                    tmpList.push({
                        id: repo.id,
                        repoInfo: repo,
                        headInfo: headInfo,
                        filterList: filterList,
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

    async init() {
        await this.checkGitConfig();
        await this.loadRepoList();
    }
}
