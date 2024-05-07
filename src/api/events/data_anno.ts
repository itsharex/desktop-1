//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { PluginEvent } from '../events';
import type { LinkInfo } from '@/stores/linkAux';
import { LinkNoneInfo } from '@/stores/linkAux';


export type AddAnnoMemberEvent = {
  anno_project_id: string;
  anno_project_name: string;
  member_user_id: string;
  member_display_name: string;
};

function get_add_anno_member_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: AddAnnoMemberEvent,
): LinkInfo[] {
  return [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 在标注项目 ${inner.anno_project_name} 中添加成员 ${inner.member_display_name}`),
  ];
}

export type RemoveAnnoMemberEvent = {
  anno_project_id: string;
  anno_project_name: string;
  member_user_id: string;
  member_display_name: string;
};

function get_remove_anno_member_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: RemoveAnnoMemberEvent,
): LinkInfo[] {
  return [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 从标注项目 ${inner.anno_project_name} 中删除成员 ${inner.member_display_name}`),
  ];
}

export class AllDataAnnoEvent {
  AddAnnoMemberEvent?: AddAnnoMemberEvent;
  RemoveAnnoMemberEvent?: RemoveAnnoMemberEvent;
}

export function get_data_anno_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: AllDataAnnoEvent,
): LinkInfo[] {
  if (inner.AddAnnoMemberEvent !== undefined) {
    return get_add_anno_member_simple_content(ev, skip_prj_name, inner.AddAnnoMemberEvent);
  } else if (inner.RemoveAnnoMemberEvent !== undefined) {
    return get_remove_anno_member_simple_content(ev, skip_prj_name, inner.RemoveAnnoMemberEvent);
  }
  return [new LinkNoneInfo('未知事件')];
}