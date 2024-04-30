//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { FC } from 'react';
import React from 'react';
import s from './card.module.less';

type CardProps = {
  children?: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  childStyle?: React.CSSProperties;
  extraContent?: React.ReactNode;
};

const Card: FC<CardProps> = ({ className, childStyle, ...props }) => {
  return (
    <div className={`${s.card_wrap} ${className}`}>
      {props.title && <h1 style={{ position: "relative" }}>{props.title} {props.extraContent && props.extraContent}</h1>}
      <div style={{ ...childStyle }}>{props.children}</div>
    </div>
  );
};

export default Card;
