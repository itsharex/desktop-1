//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { observer } from 'mobx-react';
import React from 'react';
import type { IRouteConfig } from '@/routes';
import { useLocation } from 'react-router-dom';
import { APP_PROJECT_HOME_PATH } from '@/utils/constant';
import style from './style.module.less';
import { renderRoutes } from 'react-router-config';
import ProjectHome from '@/pages/Project/Home';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const HomeLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary>
      <>
        <ProjectHome />
        {pathname != APP_PROJECT_HOME_PATH && (
          <div className={style.toolsModel}>{renderRoutes(route.routes)}</div>
        )}
      </>
    </ErrorBoundary>
  );
};

export default observer(HomeLayout);