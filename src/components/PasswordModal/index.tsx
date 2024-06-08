//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { change_passwd } from '@/api/user';
import { useStores } from '@/hooks';
import { request } from '@/utils/request';
import type { ModalProps } from 'antd';
import { Button, Form, Input, message } from 'antd';
import type { FC } from 'react';
import React, { useState } from 'react';
import ActionModal from '../ActionModal';
import s from './index.module.less';

type PasswordModalProps = Omit<ModalProps, 'onCancel' | 'okText' | 'cancelText'> & {
  visible: boolean;
  onCancel: (boo: boolean) => void;
  onSuccess?: () => void;
};

const PasswordModal: FC<PasswordModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  ...props
}) => {
  const [disabled, setDisabled] = useState(true);
  const userStore = useStores('userStore');

  const submit = async (values: { old_passwd: string; password: string; repetition: string }) => {
    try {
      await request(change_passwd(userStore.sessionId, values.old_passwd, values.repetition));
      message.success('密码修改成功');
      onCancel(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <ActionModal
      maskClosable={false}
      width={416}
      open={visible}
      title="修改密码"
      onCancel={() => onCancel(false)}
      {...props}
    >
      <Form
        className={s.password_modal_form}
        onFinish={(values) => {
          submit(values);
        }}
      >

        <Form.Item
          name="old_passwd"
          label="旧密码"
          rules={[{ required: true, message: '旧密码必填' }]}
        >
          <Input.Password allowClear placeholder="请输入旧密码" />
        </Form.Item>

        <Form.Item
          name="password"
          label="设置新密码"
          rules={[
            { required: true, message: '新密码必填' },
            {
              validator: (rule, value) => {
                if (!value) {
                  return Promise.resolve();
                }
                const reg = /^(\w|-|@|&|%|\.){6,12}$/;
                if (!reg.test(value)) {
                  return Promise.reject('仅支持6-12位英文、数字、符号(_|-|@|&|%|.)的组合');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password allowClear placeholder="请输入6-12位数字/字母/符号，区分大" />
        </Form.Item>

        <Form.Item
          name="repetition"
          label="重复新密码"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: '重复新密码必填',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  setDisabled(false);
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致，请检查'));
              },
            }),
          ]}
        >
          <Input.Password allowClear placeholder="请输入6-12位数字/字母/符号，区分大" />
        </Form.Item>

        <Form.Item className={s.btn_wrap}>
          <Button type="primary" htmlType="submit" className={s.btn} disabled={disabled}>
            确定修改
          </Button>
        </Form.Item>
      </Form>
    </ActionModal>
  );
};

export default PasswordModal;
