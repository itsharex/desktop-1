import React from 'react';
import { Layout } from 'antd';
import { observer } from 'mobx-react';
import type { IRouteConfig } from '@/routes';
import style from './style.module.less';
import Header from '../components/Header';
import { renderRoutes } from 'react-router-config';
import AdminNav from '@/pages/Admin/AdminNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';



const AdminLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
    return (
        <Layout>
            <AdminNav />
            <Layout>
                <Header />
                <ErrorBoundary>
                    <Layout.Content className={style.basicContent} style={{ border: "1px solid #e4e4e8" }}>
                        {renderRoutes(route.routes)}
                    </Layout.Content>
                </ErrorBoundary>
            </Layout>
        </Layout>
    );
};

export default observer(AdminLayout);