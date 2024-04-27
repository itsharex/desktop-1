//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from 'react';
import type { TASK_PRIORITY, BUG_LEVEL, BUG_PRIORITY } from '@/api/project_issue'

const RenderSelectOpt = (item: {
  label: string;
  value?: TASK_PRIORITY | BUG_LEVEL | BUG_PRIORITY;
  color: string;
}) => {
  return item ? (
    <div
      style={{
        color: item?.color,
        // display: 'flex',
        alignItems: 'center',
        height: '100%',
        margin: '0 auto',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          background: `${item?.color}`,
          borderRadius: ' 50%',
          marginRight: '5px',
        }}
      />
      {item?.label}
    </div>
  ) : (
    '-'
  );
};

export default RenderSelectOpt;
