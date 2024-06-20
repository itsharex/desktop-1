//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';
import moment from 'moment';

export type ExtraMenuItem = {
  name: string;
  url: string;
  menu_id: string;
  weight: number;
  main_menu: boolean;
  open_in_browser: boolean;
};

export type ServerCap = {
  project_doc: boolean;
  sprit: boolean;
  issue: boolean;
  project_setting: boolean;
};

export type GetCfgResponse = {
  item_list: ExtraMenuItem[];
  server_cap: ServerCap;
  pay_center_url: string;
  enable_admin: boolean;
  atom_git_client_id: string;
  gitee_client_id: string;
  jihulab_client_id: string;
  server_time: number;
  client_time: number; //本地属性，非服务端返回
  disable_login?: boolean;
};

export type ServerInfo = {
  name: string,
  system: boolean;
  addr: string;
  default_server: boolean;
};

export type ListServerResult = {
  server_list: ServerInfo[];
};

/*
 * 获取客户端的配置，包含如下内容：
 * * 在左侧显示的额外功能板块
 */
export async function get_cfg(): Promise<GetCfgResponse> {
  const res = await invoke<GetCfgResponse>('plugin:client_cfg_api|get_cfg', {
    request: {},
  });
  res.client_time = moment().valueOf();
  return res;
}

export async function set_default_server(addr: string): Promise<void> {
  return invoke<void>('plugin:client_cfg_api|set_default_server', {
    addr,
  });
}

export async function list_server(skip_system: boolean): Promise<ListServerResult> {
  return invoke<ListServerResult>('plugin:client_cfg_api|list_server', {
    skipSystem: skip_system,
  });
}

export async function save_server_list(serverList: ServerInfo[]): Promise<void> {
  return invoke<void>('plugin:client_cfg_api|save_server_list', {
    serverList: serverList,
  });
}

export async function get_global_server_addr(): Promise<string> {
  return invoke<string>('plugin:client_cfg_api|get_global_server_addr', {});
}

export async function set_global_server_addr(addr: string): Promise<void> {
  return invoke<void>('plugin:client_cfg_api|set_global_server_addr', { addr: addr });
}