import React from 'react';
import { renderRoutes } from 'react-router-config';
import type { IRouteConfig } from '@/routes';
import style from './style.module.less';
import { ErrorBoundary } from '@/components/ErrorBoundary';


const GroupLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
    return (
        <ErrorBoundary>
            <div className={style.groupLayout}>
                {renderRoutes(route.routes)}
            </div>
        </ErrorBoundary>
    );
};

export default GroupLayout;