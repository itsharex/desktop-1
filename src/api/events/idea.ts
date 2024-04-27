//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { PluginEvent } from '../events';
import { LinkIdeaPageInfo } from '@/stores/linkAux';
import type { LinkInfo } from '@/stores/linkAux';
import { LinkNoneInfo } from '@/stores/linkAux';

import { APPRAISE_AGREE } from '../project_idea';


export type CreateIdeaEvent = {
  idea_id: string;
  title: string;
  keyword_list: string[];
};

function get_create_idea_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: CreateIdeaEvent,
): LinkInfo[] {
  const retList = [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 创建 知识点`),
    new LinkIdeaPageInfo(inner.title, ev.project_id, "", [], inner.idea_id),
  ];
  if (inner.keyword_list.length > 0) {
    retList.push(new LinkNoneInfo("关键词列表"));
    inner.keyword_list.forEach(keyword => {
      retList.push(new LinkIdeaPageInfo(keyword, ev.project_id, "", [keyword]));
    })
  }
  return retList;
}

export type UpdateIdeaContentEvent = {
  idea_id: string;
  old_title: string;
  new_title: string;
}

function get_update_idea_content_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: UpdateIdeaContentEvent,
): LinkInfo[] {
  return [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新 知识点`),
    new LinkIdeaPageInfo(inner.new_title, ev.project_id, "", [], inner.idea_id),
    new LinkNoneInfo(`内容 原标题 ${inner.old_title}`),
  ];
}

export type UpdateIdeaKeywordEvent = {
  idea_id: string;
  title: string;
  old_keyword_list: string[];
  new_keyword_list: string[];
}

function get_update_idea_keyword_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: UpdateIdeaKeywordEvent,
): LinkInfo[] {
  const retList = [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 更新 知识点`),
    new LinkIdeaPageInfo(inner.title, ev.project_id, "", [], inner.idea_id),
    new LinkNoneInfo("关键词"),
  ];
  retList.push(new LinkNoneInfo("新关键词"));
  inner.new_keyword_list.forEach(keyword => {
    new LinkIdeaPageInfo(keyword, ev.project_id, "", [keyword]);
  });
  retList.push(new LinkNoneInfo("原关键词"));
  inner.old_keyword_list.forEach(keyword => {
    new LinkIdeaPageInfo(keyword, ev.project_id, "", [keyword]);
  });
  return retList;
}

export type RemoveIdeaEvent = {
  idea_id: string;
  title: string;
};

function get_remove_idea_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: RemoveIdeaEvent,
): LinkInfo[] {
  return [new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 把 知识点 ${inner.title} 移至回收站`)];
}

export type SetAppraiseEvent = {
  idea_id: string;
  title: string;
  appriase_type: number;
}

function get_set_appraise_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: SetAppraiseEvent,
): LinkInfo[] {
  return [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} ${inner.appriase_type == APPRAISE_AGREE ? "赞同" : "不赞同"} 知识点`),
    new LinkIdeaPageInfo(inner.title, ev.project_id, "", [], inner.idea_id),
  ];
}

export type CancelAppraiseEvent = {
  idea_id: string;
  title: string;
  appriase_type: number;
};

function get_cancel_appraise_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: CancelAppraiseEvent,
): LinkInfo[] {
  return [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 取消标记 知识点`),
    new LinkIdeaPageInfo(inner.title, ev.project_id, "", [], inner.idea_id),
  ];
}

export type ImportIdeaEvent = {
  idea_group_id: string;
  name: string;
  count: number;
};

function get_import_idea_simple_content(ev: PluginEvent,
  skip_prj_name: boolean,
  inner: ImportIdeaEvent,
): LinkInfo[] {
  return [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 导入知识点`),
    new LinkIdeaPageInfo(inner.name, ev.project_id, inner.idea_group_id, []),
    new LinkNoneInfo(`共导入${inner.count}条。`),
  ];
}

export type ClearGroupEvent = {
  idea_group_id: string;
  title: string;
};

function get_clear_group_simple_content(ev: PluginEvent,
  skip_prj_name: boolean,
  inner: ClearGroupEvent,
): LinkInfo[] {
  return [
    new LinkNoneInfo(`${skip_prj_name ? '' : ev.project_name} 清空知识点分组 `),
    new LinkIdeaPageInfo(inner.title, ev.project_id, inner.idea_group_id, []),
  ];
}

export class AllIdeaEvent {
  CreateIdeaEvent?: CreateIdeaEvent;
  UpdateIdeaContentEvent?: UpdateIdeaContentEvent;
  UpdateIdeaKeywordEvent?: UpdateIdeaKeywordEvent;
  RemoveIdeaEvent?: RemoveIdeaEvent;
  SetAppraiseEvent?: SetAppraiseEvent;
  CancelAppraiseEvent?: CancelAppraiseEvent;
  ImportIdeaEvent?: ImportIdeaEvent;
  ClearGroupEvent?: ClearGroupEvent;
};
export function get_idea_simple_content(
  ev: PluginEvent,
  skip_prj_name: boolean,
  inner: AllIdeaEvent,
): LinkInfo[] {
  if (inner.CreateIdeaEvent !== undefined) {
    return get_create_idea_simple_content(ev, skip_prj_name, inner.CreateIdeaEvent);
  } else if (inner.UpdateIdeaContentEvent !== undefined) {
    return get_update_idea_content_simple_content(ev, skip_prj_name, inner.UpdateIdeaContentEvent);
  } else if (inner.UpdateIdeaKeywordEvent !== undefined) {
    return get_update_idea_keyword_simple_content(ev, skip_prj_name, inner.UpdateIdeaKeywordEvent);
  } else if (inner.RemoveIdeaEvent !== undefined) {
    return get_remove_idea_simple_content(ev, skip_prj_name, inner.RemoveIdeaEvent);
  } else if (inner.SetAppraiseEvent !== undefined) {
    return get_set_appraise_simple_content(ev, skip_prj_name, inner.SetAppraiseEvent);
  } else if (inner.CancelAppraiseEvent !== undefined) {
    return get_cancel_appraise_simple_content(ev, skip_prj_name, inner.CancelAppraiseEvent);
  } else if (inner.ImportIdeaEvent !== undefined) {
    return get_import_idea_simple_content(ev, skip_prj_name, inner.ImportIdeaEvent);
  } else if (inner.ClearGroupEvent !== undefined) {
    return get_clear_group_simple_content(ev, skip_prj_name, inner.ClearGroupEvent);
  } else {
    return [new LinkNoneInfo('未知事件')];
  }
}