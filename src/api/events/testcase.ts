//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { PluginEvent } from '../events';
import type { LinkInfo } from '@/stores/linkAux';
import { LinkNoneInfo, LinkSpritInfo, LinkTestCaseInfo } from '@/stores/linkAux';

export type CreateCaseEvent = {
    case_id: string;
    case_title: string;
};

function get_create_case_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: CreateCaseEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 创建测试用例`),
        new LinkTestCaseInfo(inner.case_title, ev.project_id, inner.case_id),
    ];
}

export type UpdateCaseEvent = {
    case_id: string;
    old_case_title: string;
    new_case_title: string;
};

function get_update_case_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UpdateCaseEvent,
): LinkInfo[] {
    const retList = [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新测试用例`),
        new LinkTestCaseInfo(inner.new_case_title, ev.project_id, inner.case_id),
    ];
    if (inner.old_case_title != inner.new_case_title) {
        retList.push(new LinkNoneInfo(`(原标题 ${inner.old_case_title})`));
    }
    return retList;
}

export type RemoveCaseEvent = {
    case_id: string;
    case_title: string;
};

function get_remove_case_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: RemoveCaseEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 把 测试用例 ${inner.case_title} 移至回收站`),
    ];
}

export type LinkSpritEvent = {
    case_id: string;
    case_title: string;
    sprit_id: string;
    sprit_title: string;
};

function get_link_sprit_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: LinkSpritEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 关联 测试用例`),
        new LinkTestCaseInfo(inner.case_title, ev.project_id, inner.case_id),
        new LinkNoneInfo("和工作计划"),
        new LinkSpritInfo(inner.sprit_title, ev.project_id, inner.sprit_id),
    ];
}

export type UnlinkSpritEvent = {
    case_id: string;
    case_title: string;
    sprit_id: string;
    sprit_title: string;
};

function get_unlink_sprit_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: UnlinkSpritEvent,
): LinkInfo[] {
    return [
        new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 取消关联 测试用例`),
        new LinkTestCaseInfo(inner.case_title, ev.project_id, inner.case_id),
        new LinkNoneInfo("和工作计划"),
        new LinkSpritInfo(inner.sprit_title, ev.project_id, inner.sprit_id),
    ];
}

export class AllTestCaseEvent {
    CreateCaseEvent?: CreateCaseEvent;
    UpdateCaseEvent?: UpdateCaseEvent;
    RemoveCaseEvent?: RemoveCaseEvent;
    LinkSpritEvent?: LinkSpritEvent;
    UnlinkSpritEvent?: UnlinkSpritEvent;
}

export function get_testcase_simple_content(
    ev: PluginEvent,
    skip_prj_name: boolean,
    inner: AllTestCaseEvent,
): LinkInfo[] {
    if (inner.CreateCaseEvent !== undefined) {
        return get_create_case_simple_content(ev, skip_prj_name, inner.CreateCaseEvent);
    } else if (inner.UpdateCaseEvent !== undefined) {
        return get_update_case_simple_content(ev, skip_prj_name, inner.UpdateCaseEvent);
    } else if (inner.RemoveCaseEvent !== undefined) {
        return get_remove_case_simple_content(ev, skip_prj_name, inner.RemoveCaseEvent);
    } else if (inner.LinkSpritEvent !== undefined) {
        return get_link_sprit_simple_content(ev, skip_prj_name, inner.LinkSpritEvent);
    } else if (inner.UnlinkSpritEvent !== undefined) {
        return get_unlink_sprit_simple_content(ev, skip_prj_name, inner.UnlinkSpritEvent);
    }
    return [new LinkNoneInfo('未知事件')];
}