import type { RootStore } from './index';
import { makeAutoObservable, runInAction } from 'mobx';
import type { SkillCateInfo, SkillFolderInfo, SkillPointInfo } from "@/api/skill_center";
import { list_skill_cate, list_skill_folder, list_skill_point, get_skill_point } from "@/api/skill_center";
import { request } from '@/utils/request';

export default class SkillCenterStore {
    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }
    rootStore: RootStore;

    private _curCateId = "";
    private _curPointId = "";
    private _cateList: SkillCateInfo[] = [];
    private _folderList: SkillFolderInfo[] = [];
    private _pointList: SkillPointInfo[] = [];

    get curCateId() {
        return this._curCateId;
    }

    get curPointId() {
        return this._curPointId;
    }

    get curPoint() {
        return this._pointList.find(item => item.point_id == this._curPointId);
    }

    set curPointId(val: string) {
        if (this._pointList.map(item => item.point_id).includes(val)) {
            runInAction(() => {
                this._curPointId = val;
            });
        }
    }

    get cateList() {
        return this._cateList;
    }

    get folderList() {
        return this._folderList;
    }

    get pointList() {
        return this._pointList;
    }

    async initData() {
        runInAction(() => {
            this._curCateId = "";
            this._curPointId = "";
            this._cateList = [];
            this._folderList = [];
            this._pointList = [];
        });
        const res = await request(list_skill_cate({
            session_id: this.rootStore.userStore.sessionId,
            filter_publish: true,
            publish: true,
        }));
        if (res.cate_list.length == 0) {
            return;
        }
        const cateId = res.cate_list[0].cate_id;
        runInAction(() => {
            this._curCateId = cateId;
            this._cateList = res.cate_list;
        });

        await this.loadFolderList(cateId);
        await this.loadPointList(cateId);
    }

    async setCurCateId(val: string) {
        if (this._cateList.map(item => item.cate_id).includes(val) == false) {
            return;
        }
        console.log("yyyyyyy", val);
        runInAction(() => {
            this._curCateId = val;
            this._curPointId = "";
            this._folderList = [];
            this._pointList = [];
        });

        await this.loadFolderList(val);
        await this.loadPointList(val);
    }

    async loadFolderList(cateId: string) {
        const res = await request(list_skill_folder({
            session_id: this.rootStore.userStore.sessionId,
            cate_id: cateId,
            filter_by_parent_folder_id: false,
            parent_folder_id: "",
        }));
        runInAction(() => {
            this._folderList = res.folder_list;
        });
    }

    async loadPointList(cateId: string) {
        const res = await request(list_skill_point({
            session_id: this.rootStore.userStore.sessionId,
            cate_id: cateId,
            filter_by_parent_folder_id: false,
            parent_folder_id: "",
        }));
        runInAction(() => {
            this._pointList = res.point_list;
        });
    }

    async onUpdatePoint(pointId: string) {
        const tmpList = this._pointList.slice();
        const index = tmpList.findIndex(item => item.point_id == pointId);
        if (index == -1) {
            return;
        }

        const res = await request(get_skill_point({
            session_id: this.rootStore.userStore.sessionId,
            cate_id: this._curCateId,
            point_id: pointId,
        }));
        tmpList[index] = res.point_info;
        runInAction(() => {
            this._pointList = tmpList;
        });
    }
}