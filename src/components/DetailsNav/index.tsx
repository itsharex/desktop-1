//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { FC } from 'react';
import React from 'react';
import s from './index.module.less';
import leftArrow from '@/assets/image/leftArrow.png';
import { useHistory } from 'react-router-dom';

type DetailsNavProps = {
  title: React.ReactNode;
  children?: React.ReactNode;
};

const DetailsNav: FC<DetailsNavProps> = (props) => {
  const history = useHistory();
  return (
    <div className={s.details_nav_wrap}>
      <div className={s.title}>
        <a onClick={() => history.goBack()}><img src={leftArrow} alt="" /></a> <span>{props.title}</span>
      </div>
      <div className={s.child}>{props?.children}</div>
    </div>
  );
};

export default DetailsNav;
