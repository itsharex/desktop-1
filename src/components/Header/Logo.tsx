//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Avatar } from 'antd';
import React from 'react';


const Logo: React.FC<{ size: number }> = ({ size = 120 }) => (
  <Avatar size={size} src="" />
);

export default Logo;
