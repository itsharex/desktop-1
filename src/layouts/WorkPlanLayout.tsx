import { observer } from 'mobx-react';
import React from 'react';
import type { IRouteConfig } from '@/routes';
import { useLocation } from 'react-router-dom';
import WorkPlan from '@/pages/WorkPlan';
import { APP_PROJECT_WORK_PLAN_PATH } from '@/utils/constant';
import style from './style.module.less';
import { renderRoutes } from 'react-router-config';
import { useStores } from '@/hooks';

const WorkPlanLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
  const projectStore = useStores('projectStore');
  const appStore = useStores('appStore');
  const { pathname } = useLocation();

  const calcWidth = () => {
    let subWidth = 60;
    if (projectStore.showChatAndComment) {
      subWidth += 300;
    }
    if (appStore.focusMode == false) {
      subWidth += 200;
    }
    return `calc(100vw - ${subWidth}px)`;
  };

  return (
    <div style={{ width: calcWidth()}}>
      <WorkPlan />
      {pathname != APP_PROJECT_WORK_PLAN_PATH && (
        <div className={style.toolsModel}>{renderRoutes(route.routes)}</div>
      )}
    </div>
  );
};

export default observer(WorkPlanLayout);