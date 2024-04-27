//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { PluginEvent } from '../events';
import type { LinkInfo } from '@/stores/linkAux';
import { LinkNoneInfo, LinkSpritInfo, LinkDocInfo, LinkBoardInfo } from '@/stores/linkAux';
import { ENTRY_TYPE_API_COLL, ENTRY_TYPE_BOARD, ENTRY_TYPE_DOC, ENTRY_TYPE_FILE, ENTRY_TYPE_PAGES, ENTRY_TYPE_SPRIT } from '../project_entry';


function gen_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    action_name: string,
    entry_id: string,
    entry_type: number,
    entry_title: string,
): LinkInfo[] {
    let typeName = "";
    if (entry_type == ENTRY_TYPE_SPRIT) {
        typeName = "工作计划";
    } else if (entry_type == ENTRY_TYPE_DOC) {
        typeName = "文档";
    } else if (entry_type == ENTRY_TYPE_PAGES) {
        typeName = "静态网页";
    } else if (entry_type == ENTRY_TYPE_BOARD) {
        typeName = "信息面板";
    } else if (entry_type == ENTRY_TYPE_FILE){
        typeName = "文件";
    } else if (entry_type == ENTRY_TYPE_API_COLL){
        typeName = "接口集合";
    } 
    const retList = [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} ${action_name} ${typeName}`),
    ];
    if (entry_type == ENTRY_TYPE_SPRIT) {
        retList.push(new LinkSpritInfo(entry_title, ev.project_id, entry_id));
    } else if (entry_type == ENTRY_TYPE_DOC) {
        retList.push(new LinkDocInfo(entry_title, ev.project_id, entry_id));
    } else if (entry_type == ENTRY_TYPE_BOARD) {
        retList.push(new LinkBoardInfo(entry_title, ev.project_id, entry_id));
    } else {
        retList.push(new LinkNoneInfo(entry_title));
    }
    return retList;
}
export type CreateEvent = {
    entry_id: string;
    entry_type: number;
    entry_title: string;
};

function get_create_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CreateEvent,
): LinkInfo[] {
    return gen_simple_content(ev, skip_prj_name, "创建",
        inner.entry_id, inner.entry_type, inner.entry_title);
}


export type RemoveEvent = {
    entry_id: string;
    entry_type: number;
    entry_title: string;
};

function get_remove_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CreateEvent,
): LinkInfo[] {
    return gen_simple_content(ev, skip_prj_name, "移至回收站",
        inner.entry_id, inner.entry_type, inner.entry_title);

}

export class AllEntryEvent {
    CreateEvent?: CreateEvent;
    RemoveEvent?: RemoveEvent;
}

export function get_entry_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: AllEntryEvent,
): LinkInfo[] {
    if (inner.CreateEvent !== undefined) {
        return get_create_simple_content(ev, skip_prj_name, inner.CreateEvent);
    } else if (inner.RemoveEvent !== undefined) {
        return get_remove_simple_content(ev, skip_prj_name, inner.RemoveEvent);
    }
    return [new LinkNoneInfo('未知事件')];
}