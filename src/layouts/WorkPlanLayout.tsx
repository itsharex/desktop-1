//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { observer } from 'mobx-react';
import React from 'react';
import type { IRouteConfig } from '@/routes';
import { useLocation } from 'react-router-dom';
import WorkPlan from '@/pages/WorkPlan';
import { APP_PROJECT_WORK_PLAN_PATH } from '@/utils/constant';
import style from './style.module.less';
import { renderRoutes } from 'react-router-config';
import { useStores } from '@/hooks';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const WorkPlanLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
  const projectStore = useStores('projectStore');
  const { pathname } = useLocation();

  const calcWidth = () => {
    let subWidth = 260;
    if (projectStore.showChatAndComment) {
      subWidth += 400;
    }
    return `calc(100vw - ${subWidth}px)`;
  };

  return (
    <ErrorBoundary>
      <div style={{ width: calcWidth() }}>
        <WorkPlan />
        {pathname != APP_PROJECT_WORK_PLAN_PATH && (
          <div className={style.toolsModel}>{renderRoutes(route.routes)}</div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default observer(WorkPlanLayout);