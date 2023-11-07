import { invoke } from '@tauri-apps/api/tauri';

export type ExtraMenuItem = {
  name: string;
  url: string;
  menu_id: string;
  weight: number;
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
  can_invite: boolean;
  can_register: boolean;
  enable_admin: boolean;
  enable_pub_app_store: boolean;
  enable_pub_docker_template: boolean;
  enable_pub_search: boolean;
  app_store_fs_id: string;
  docker_template_fs_id: string;
  pub_search_fs_id: string;
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
  return invoke<GetCfgResponse>('plugin:client_cfg_api|get_cfg', {
    request: {},
  });
}

export async function add_server(addr: string): Promise<void> {
  return invoke<void>('plugin:client_cfg_api|add_server', {
    addr,
  });
}

export async function remove_server(addr: string): Promise<void> {
  return invoke<void>('plugin:client_cfg_api|remove_server', {
    addr,
  });
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