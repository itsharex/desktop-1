//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { ButtonProps } from 'antd';
import { Button } from 'antd';
// import type {  ButtonProps } from 'antd/lib/button';
import type { FC } from 'react';
import React from 'react';
type BtnProps = ButtonProps;

const Btn: FC<BtnProps> = (props) => {
  return (
    <Button
      type="primary"
      {...props}
      style={{
        borderRadius: '8px',
        minWidth: '80px',
        ...props.style,
      }}
    >
      {props.children}
    </Button>
  );
};

export default Btn;
