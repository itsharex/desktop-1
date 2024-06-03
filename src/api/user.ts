//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { invoke } from '@tauri-apps/api/tauri';

export type USER_STATE = number;

export const USER_STATE_NORMAL: USER_STATE = 0;     //正常状态
export const USER_STATE_FORBIDDEN: USER_STATE = 1;  //冻结账户

export type USER_TYPE = number;
export const USER_TYPE_INTERNAL: USER_TYPE = 0;  //内部用户
export const USER_TYPE_ATOM_GIT: USER_TYPE = 1;  // atomgit用户
export const USER_TYPE_GITEE: USER_TYPE = 2;  // atomgit用户
export const USER_TYPE_JIHU_LAB: USER_TYPE = 3;  // jihulab用户


export type BasicUserInfo = {
  display_name: string;
  logo_uri: string;
};

export type FeatureInfo = {
  enable_project: boolean;
  enable_org: boolean;
  enable_skill_center: boolean;
}

export type UserInfo = {
  user_id: string;
  user_name: string;
  basic_info: BasicUserInfo;
  feature: FeatureInfo;
  create_time: number;
  update_time: number;
  user_fs_id: string;
  user_state: USER_STATE;
  user_type: USER_TYPE;
  test_account: boolean;
};

export type LoginResponse = {
  code: number;
  err_msg: string;
  session_id: string;
  user_info: UserInfo;
  notice_url: string;
  notice_key: string;
  extra_token: string;
};

export type LogoutResponse = {
  code: number;
  err_msg: string;
};

export type UpdateResponse = {
  code: number;
  err_msg: string;
};

export type ChangePasswdResponse = {
  code: number;
  err_msg: string;
};

type CheckSessionResponse = {
  code: number;
  err_msg: string;
  valid: boolean;
};

export type UpdateFeatureRequest = {
  session_id: string;
  feature: FeatureInfo;
};

export type UpdateFeatureResponse = {
  code: number;
  err_msg: string;
};

/* 用户登录，登录后
 * 1. 自动进行会话保活
 * 2. 启动对应用户的通知推送功能
 */
export async function login(user_name: string, passwd: string, user_type: USER_TYPE): Promise<LoginResponse> {
  const cmd = 'plugin:user_api|login';
  const request = {
    user_name,
    passwd,
    user_type,
  };
  console.log(`%c${cmd}`, 'color:#0f0;', request);
  return invoke<LoginResponse>(cmd, {
    request,
  });
}

/* 用户登出
 * 1. 停止相关用户的会话保活
 * 2. 停止对应用户的通知推送功能
 */
export async function logout(session_id: string): Promise<LogoutResponse> {
  const cmd = 'plugin:user_api|logout';
  const request = {
    session_id,
  };
  console.log(`%c${cmd}`, 'color:#0f0;', request);

  return invoke<LogoutResponse>('plugin:user_api|logout', {
    request,
  });
}

//更新用户信息
export async function update(
  session_id: string,
  basic_info: BasicUserInfo,
): Promise<UpdateResponse> {
  const cmd = 'plugin:user_api|update';
  const request = {
    session_id,
    basic_info,
  };
  console.log(`%c${cmd}`, 'color:#0f0;', request);
  return invoke<UpdateResponse>(cmd, {
    request,
  });
}

//更新用户feature
export async function update_feature(request: UpdateFeatureRequest): Promise<UpdateFeatureResponse> {
  const cmd = 'plugin:user_api|update_feature';
  console.log(`%c${cmd}`, 'color:#0f0;', request);
  return invoke<UpdateResponse>(cmd, {
    request,
  });
}

//修改密码
export async function change_passwd(
  session_id: string,
  old_passwd: string,
  new_passwd: string,
): Promise<ChangePasswdResponse> {
  const cmd = 'plugin:user_api|change_passwd';
  const request = {
    session_id,
    old_passwd,
    new_passwd,
  };
  console.log(`%c${cmd}`, 'color:#0f0;', request);
  return invoke<ChangePasswdResponse>(cmd, {
    request,
  });
}

//检查会话是否有效
export async function check_session(session_id: string): Promise<CheckSessionResponse> {
  const cmd = 'plugin:user_api|check_session';
  const request = {
    session_id,
  };
  console.log(`%c${cmd}`, 'color:#0f0;', request);

  return invoke<CheckSessionResponse>(cmd, {
    request,
  });
}

//获取session
export async function get_session(): Promise<string> {
  return invoke<string>('plugin:user_api|get_session', {})
}

//获取用户ID
export async function get_user_id(): Promise<string> {
  return invoke<string>('plugin:user_api|get_user_id', {})
}