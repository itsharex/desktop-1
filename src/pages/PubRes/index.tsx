//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useMemo, useState } from 'react';
import s from "./index.module.less";
import { Tabs } from 'antd';
import { AppstoreOutlined, BulbOutlined, GlobalOutlined, SearchOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { PUB_RES_PATH } from '@/utils/constant';
import AppStorePanel from './components/AppStorePanel';
import { useStores } from '@/hooks';
import DockerSvg from '@/assets/svg/docker.svg?react';
import DockerTemplatePanel from './components/DockerTemplatePanel';
import PubSearchPanel from './components/PubSearchPanel';
import { observer } from 'mobx-react';
import AppStoreDetail from './components/AppStoreDetail';
import DockerTemplateDetail from './components/DockerTemplateDetail';
import IdeaListPanel from './components/IdeaListPanel';
import SoftWareListPanel from './components/SoftWareListPanel';


const PubRes = () => {
    const location = useLocation();
    const history = useHistory();

    const appStore = useStores('appStore');
    const projectStore = useStores('projectStore');
    const orgStore = useStores('orgStore');
    const pubResStore = useStores('pubResStore');

    const urlParams = new URLSearchParams(location.search);
    let tab = urlParams.get('tab') ?? "";
    if (tab == "") {
        tab = "appStore";
    }

    const [activeKey, setActiveKey] = useState(tab);

    useMemo(() => {
        projectStore.setCurProjectId('');
        orgStore.setCurOrgId("");
    }, []);

    return (
        <div className={s.tabs_wrap}>
            <Tabs activeKey={activeKey}
                type='card'
                onChange={key => {
                    setActiveKey(key);
                    history.push(`${PUB_RES_PATH}?tab=${key}`);
                }}>

                <Tabs.TabPane tab={<h2><AppstoreOutlined />&nbsp;应用市场</h2>} key="appStore">
                    {activeKey == "appStore" && (
                        <div className={s.content_wrap}>
                            {pubResStore.showAppId == "" && <AppStorePanel />}
                            {pubResStore.showAppId != "" && <AppStoreDetail />}
                        </div>
                    )}
                </Tabs.TabPane>

                <Tabs.TabPane tab={<h2><AppstoreOutlined />&nbsp;常用软件</h2>} key="swStore">
                    {activeKey == "swStore" && (
                        <div className={s.content_wrap}>
                            <SoftWareListPanel />
                        </div>
                    )}
                </Tabs.TabPane>

                <Tabs.TabPane tab={<h2><BulbOutlined />&nbsp;知识点仓库</h2>} key="ideaStore">
                    {activeKey == "ideaStore" && (
                        <div className={s.content_wrap}>
                            <IdeaListPanel />
                        </div>
                    )}
                </Tabs.TabPane>

                <Tabs.TabPane tab={<h2><span style={{ display: "inline-block", verticalAlign: "-3px" }}><DockerSvg style={{ width: "16px", height: "16px" }} /></span>&nbsp;Docker模板</h2>} key="dockerTemplate">
                    {activeKey == "dockerTemplate" && (
                        <div className={s.content_wrap}>
                            {pubResStore.dockerAppId == "" && <DockerTemplatePanel />}
                            {pubResStore.dockerAppId != "" && <DockerTemplateDetail />}
                        </div>
                    )}
                </Tabs.TabPane>

                <Tabs.TabPane tab={<h2><SearchOutlined />&nbsp;聚合搜索</h2>} key="pubSearch">
                    {activeKey == "pubSearch" && (
                        <div className={s.content_wrap}>
                            <PubSearchPanel />
                        </div>
                    )}
                </Tabs.TabPane>

                {appStore.clientCfg?.item_list.filter(item=>item.main_menu == false).map(item => (
                    <Tabs.TabPane tab={<h2><GlobalOutlined />&nbsp;{item.name}</h2>} key={item.menu_id}>
                        {activeKey == item.menu_id && (
                            <div className={s.content_wrap}>
                                <iframe src={item.url} width="100%" height="100%" allow='*'/>
                            </div>
                        )}
                    </Tabs.TabPane>
                ))}
            </Tabs>
        </div>
    );
};

export default observer(PubRes);