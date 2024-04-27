//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { makeAutoObservable, runInAction } from 'mobx';
import type { TocInfo } from '@/components/Editor/extensions/index';

export default class EditorStore {
    constructor() {
        makeAutoObservable(this);
    }

    private _tocList: TocInfo[] = [];

    get tocList(): TocInfo[] {
        return this._tocList;
    }

    set tocList(val: TocInfo[]) {
        runInAction(() => {
            this._tocList = val;
        });
    }
}