import { LogoutOutlined } from "@ant-design/icons";
import { Collapse, Layout, Menu } from "antd";
import React, { useEffect, useState } from "react";
import s from './AdminNav.module.less';
import type { AdminPermInfo } from '@/api/admin_auth';
import { get_admin_perm } from '@/api/admin_auth';
import { useHistory, useLocation } from "react-router-dom";
import {
    ADMIN_PATH_APPSTORE_APP_SUFFIX,
    ADMIN_PATH_APPSTORE_CATE_SUFFIX,
    ADMIN_PATH_BOOKSTORE_BOOK_SUFFIX,
    ADMIN_PATH_BOOKSTORE_CATE_SUFFIX,
    ADMIN_PATH_CLIENT_AD_SUFFIX,
    ADMIN_PATH_CLIENT_MENU_SUFFIX,
    ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX,
    ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX,
    ADMIN_PATH_ORG_LIST_SUFFIX, ADMIN_PATH_PROJECT_CREATE_SUFFIX, ADMIN_PATH_PROJECT_DETAIL_SUFFIX,
    ADMIN_PATH_PROJECT_LIST_SUFFIX, ADMIN_PATH_PUB_SEARCH_CATE_SUFFIX, ADMIN_PATH_PUB_SEARCH_SITE_SUFFIX, ADMIN_PATH_RSS_CRAWLER_SUFFIX, ADMIN_PATH_USER_CREATE_SUFFIX, ADMIN_PATH_USER_DETAIL_SUFFIX,
    ADMIN_PATH_USER_LIST_SUFFIX, USER_LOGIN_PATH
} from "@/utils/constant";
import { useStores } from "@/hooks";
import { runInAction } from "mobx";

const AdminNav = () => {
    const location = useLocation();
    const history = useHistory();

    const userStore = useStores('userStore');

    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [userSelectedKeys, setUserSelectedKeys] = useState<string[]>([]);
    const [projectSelectedKeys, setProjectSelectedKeys] = useState<string[]>([]);
    const [orgSelectedKeys, setOrgSelectedKeys] = useState<string[]>([]);
    const [clientCfgSelectedKeys, setClientCfgSelectedKeys] = useState<string[]>([]);
    const [appstoreSelectedKeys, setAppstoreSelectedKeys] = useState<string[]>([]);
    const [bookstoreSelectedKeys, setBookstoreSelectedKeys] = useState<string[]>([]);
    const [dockerTemplateSelectedKeys, setDockerTemplateSelectedKeys] = useState<string[]>([]);
    const [rssSelectedKeys, setRssSelectedKeys] = useState<string[]>([]);
    const [pubSearchSelectedKeys, setPubSearchSelectedKeys] = useState<string[]>([]);

    useEffect(() => {
        setUserSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_USER_LIST_SUFFIX || location.pathname == ADMIN_PATH_USER_DETAIL_SUFFIX) {
            setUserSelectedKeys(["user_list"]);
        } else if (location.pathname == ADMIN_PATH_USER_CREATE_SUFFIX) {
            setUserSelectedKeys(["user_create"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setProjectSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_PROJECT_LIST_SUFFIX || location.pathname == ADMIN_PATH_PROJECT_DETAIL_SUFFIX) {
            setProjectSelectedKeys(["prj_list"]);
        } else if (location.pathname == ADMIN_PATH_PROJECT_CREATE_SUFFIX) {
            setProjectSelectedKeys(["prj_create"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setOrgSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_ORG_LIST_SUFFIX) {
            setOrgSelectedKeys(["org_list"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setClientCfgSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_CLIENT_MENU_SUFFIX) {
            setClientCfgSelectedKeys(["menu_admin"]);
        } else if (location.pathname == ADMIN_PATH_CLIENT_AD_SUFFIX) {
            setClientCfgSelectedKeys(["ad_admin"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setAppstoreSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_APPSTORE_CATE_SUFFIX) {
            setAppstoreSelectedKeys(["app_cate"]);
        } else if (location.pathname == ADMIN_PATH_APPSTORE_APP_SUFFIX) {
            setAppstoreSelectedKeys(["app_app"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setBookstoreSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_BOOKSTORE_CATE_SUFFIX) {
            setBookstoreSelectedKeys(["book_cate"]);
        } else if (location.pathname == ADMIN_PATH_BOOKSTORE_BOOK_SUFFIX) {
            setBookstoreSelectedKeys(["book_book"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setDockerTemplateSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX) {
            setDockerTemplateSelectedKeys(["docker_template_cate"]);
        } else if (location.pathname == ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX) {
            setDockerTemplateSelectedKeys(["docker_template_app"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setRssSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_RSS_CRAWLER_SUFFIX) {
            setRssSelectedKeys(["rss_crawler"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        setPubSearchSelectedKeys([]);
        if (location.pathname == ADMIN_PATH_PUB_SEARCH_CATE_SUFFIX) {
            setPubSearchSelectedKeys(["pub_search_cate"]);
        } else if (location.pathname == ADMIN_PATH_PUB_SEARCH_SITE_SUFFIX) {
            setPubSearchSelectedKeys(["pub_search_site"]);
        }
    }, [location.pathname]);

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    return (
        <Layout.Sider>
            <div className={s.head_wrap}>
                <h1>管理后台</h1>
                <div className={s.logout_wrap}>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        runInAction(() => {
                            userStore.adminSessionId = "";
                        });
                        history.push(USER_LOGIN_PATH);
                    }}><LogoutOutlined />&nbsp;&nbsp;退出</a>
                </div>
            </div>
            <Collapse defaultActiveKey={["user", "org", "project", "clientCfg", "appstore", "bookstore", "dockerTemplate", "rss", "pubSearch"]}
                style={{ height: "calc(100vh - 132px)", overflowY: "scroll", paddingBottom: "10px" }}>
                <Collapse.Panel header="用户管理" key="user">
                    <Menu selectedKeys={userSelectedKeys} items={[
                        {
                            label: "查看用户",
                            key: "user_list",
                            disabled: !(permInfo?.user_perm.read ?? false),
                        },
                        {
                            label: "新增用户",
                            key: "user_create",
                            disabled: !(permInfo?.user_perm.create ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "user_list") {
                                    history.push(ADMIN_PATH_USER_LIST_SUFFIX);
                                } else if (e.selectedKeys[0] == "user_create") {
                                    history.push(ADMIN_PATH_USER_CREATE_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
                <Collapse.Panel header="组织结构管理" key="org">
                    <Menu selectedKeys={orgSelectedKeys} items={[
                        {
                            label: "查看组织结构",
                            key: "org_list",
                            disabled: !(permInfo?.org_perm.read),
                        }
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "org_list") {
                                    history.push(ADMIN_PATH_ORG_LIST_SUFFIX);
                                }
                            }
                        }}
                    />
                </Collapse.Panel>
                <Collapse.Panel header="项目管理" key="project">
                    <Menu selectedKeys={projectSelectedKeys} items={[
                        {
                            label: "查看项目",
                            key: "prj_list",
                            disabled: !(permInfo?.project_perm.read ?? false),
                        },
                        {
                            label: "新增项目",
                            key: "prj_create",
                            disabled: !(permInfo?.project_perm ?? false),
                        }
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "prj_list") {
                                    history.push(ADMIN_PATH_PROJECT_LIST_SUFFIX);
                                } else if (e.selectedKeys[0] == "prj_create") {
                                    history.push(ADMIN_PATH_PROJECT_CREATE_SUFFIX);
                                }
                            }
                        }}
                    />
                </Collapse.Panel>
                <Collapse.Panel header="应用管理" key="appstore">
                    <Menu selectedKeys={appstoreSelectedKeys} items={[
                        {
                            label: "管理类别",
                            key: "app_cate",
                            disabled: !(permInfo?.app_store_perm.read ?? false),
                        },
                        {
                            label: "管理应用",
                            key: "app_app",
                            disabled: !(permInfo?.app_store_perm.read ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "app_cate") {
                                    history.push(ADMIN_PATH_APPSTORE_CATE_SUFFIX);
                                } else if (e.selectedKeys[0] == "app_app") {
                                    history.push(ADMIN_PATH_APPSTORE_APP_SUFFIX);
                                }
                            }
                        }}
                    />
                </Collapse.Panel>
                <Collapse.Panel header="书籍管理" key="bookstore">
                    <Menu selectedKeys={bookstoreSelectedKeys} items={[
                        {
                            label: "管理类别",
                            key: "book_cate",
                            disabled: !(permInfo?.book_store_perm.read ?? false),
                        },
                        {
                            label: "管理书籍",
                            key: "book_book",
                            disabled: !(permInfo?.book_store_perm.read ?? false),
                        }
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "book_cate") {
                                    history.push(ADMIN_PATH_BOOKSTORE_CATE_SUFFIX);
                                } else if (e.selectedKeys[0] == "book_book") {
                                    history.push(ADMIN_PATH_BOOKSTORE_BOOK_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
                <Collapse.Panel header="Docker模板管理" key="dockerTemplate">
                    <Menu selectedKeys={dockerTemplateSelectedKeys} items={[
                        {
                            label: "管理类别",
                            key: "docker_template_cate",
                            disabled: !(permInfo?.docker_template_perm.read ?? false),
                        },
                        {
                            label: "管理模板",
                            key: "docker_template_app",
                            disabled: !(permInfo?.docker_template_perm.read ?? false),
                        }
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "docker_template_cate") {
                                    history.push(ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX);
                                } else if (e.selectedKeys[0] == "docker_template_app") {
                                    history.push(ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
                <Collapse.Panel header="资讯订阅管理" key="rss">
                    <Menu selectedKeys={rssSelectedKeys} items={[
                        {
                            label: "资讯爬虫",
                            key: "rss_crawler",
                            disabled: !(permInfo?.rss_perm.read ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "rss_crawler") {
                                    history.push(ADMIN_PATH_RSS_CRAWLER_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
                <Collapse.Panel header="聚合搜索管理" key="pubSearch">
                    <Menu selectedKeys={pubSearchSelectedKeys} items={[
                        {
                            label: "搜索站点类别",
                            key: "pub_search_cate",
                            disabled: !(permInfo?.pub_search_perm.read ?? false),
                        },
                        {
                            label: "搜索站点",
                            key: "pub_search_site",
                            disabled: !(permInfo?.pub_search_perm.read ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "pub_search_cate") {
                                    history.push(ADMIN_PATH_PUB_SEARCH_CATE_SUFFIX);
                                } else if (e.selectedKeys[0] == "pub_search_site") {
                                    history.push(ADMIN_PATH_PUB_SEARCH_SITE_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
                <Collapse.Panel header="界面管理" key="clientCfg">
                    <Menu selectedKeys={clientCfgSelectedKeys} items={[
                        {
                            label: "额外菜单",
                            key: "menu_admin",
                            disabled: !(permInfo?.menu_perm.read ?? false),
                        },
                        {
                            label: "广告",
                            key: "ad_admin",
                            disabled: !(permInfo?.ad_perm.read ?? false),
                        },
                    ]}
                        style={{ borderRightWidth: "0px" }}
                        onSelect={e => {
                            if (e.selectedKeys.length == 1) {
                                if (e.selectedKeys[0] == "menu_admin") {
                                    history.push(ADMIN_PATH_CLIENT_MENU_SUFFIX);
                                } else if (e.selectedKeys[0] == "ad_admin") {
                                    history.push(ADMIN_PATH_CLIENT_AD_SUFFIX);
                                }
                            }
                        }} />
                </Collapse.Panel>
            </Collapse>
        </Layout.Sider>
    );
};

export default AdminNav;