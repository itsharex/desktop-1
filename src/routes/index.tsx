import React from 'react';
import { Redirect } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import ProjectLayout from '@/layouts/ProjectLayout';
import NoFond from '@/pages/NoFond';
import ProjectRecord from '@/pages/Project/Record/Record';
import ProjectAccess from '@/pages/Project/Access';
import ProjectAccessView from '@/pages/Project/Access/View';
import IssueList from '@/pages/Issue/IssueList';
import Workbench from '@/pages/Workbench';
import {
  ADMIN_PATH,
  ADMIN_PATH_CLIENT_MENU_SUFFIX,
  ADMIN_PATH_PROJECT_CREATE_SUFFIX,
  ADMIN_PATH_PROJECT_DETAIL_SUFFIX,
  ADMIN_PATH_PROJECT_LIST_SUFFIX,
  ADMIN_PATH_USER_CREATE_SUFFIX,
  ADMIN_PATH_USER_DETAIL_SUFFIX,
  ADMIN_PATH_USER_LIST_SUFFIX,
  APP_PROJECT_KB_DOC_PATH,
  APP_PROJECT_KB_PATH,
  WORKBENCH_PATH,
  ADMIN_PATH_APPSTORE_CATE_SUFFIX,
  ADMIN_PATH_APPSTORE_APP_SUFFIX,
  PUB_RES_PATH,
  APP_PROJECT_WORK_PLAN_PATH,
  ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX,
  ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX,
  APP_PROJECT_MY_WORK_PATH,
  APP_PROJECT_HOME_PATH,
  APP_PROJECT_MANAGER_PATH,
  APP_PROJECT_KB_BOARD_PATH,
  APP_PROJECT_PATH,
  ADMIN_PATH_DEV_CONTAINER_PKG_SUFFIX,
  ADMIN_PATH_IDEA_STORE_CATE_SUFFIX,
  ADMIN_PATH_IDEA_STORE_SUFFIX,
  ADMIN_PATH_IDEA_SUFFIX,
  APP_ORG_MANAGER_PATH,
  APP_ORG_PATH,
  ADMIN_PATH_WIDGET_SUFFIX,
  ADMIN_PATH_SOFTWARE_CATE_SUFFIX,
  ADMIN_PATH_SOFTWARE_SUFFIX,
  ADMIN_PATH_SKILL_CENTER_CATE_SUFFIX,
  ADMIN_PATH_SKILL_CENTER_POINT_SUFFIX,
} from '@/utils/constant';
import KnowledgeBaseLayout from '@/layouts/KnowledgeBaseLayout';
import ProjectDoc from '@/pages/KnowledgeBase/ProjectDoc';
import SubscribeList from '@/pages/Project/Record/SubscribeList';
import AdminLayout from '@/layouts/AdminLayout';
import UserList from '@/pages/Admin/UserAdmin/UserList';
import UserDetail from '@/pages/Admin/UserAdmin/UserDetail';
import CreateUser from '@/pages/Admin/UserAdmin/CreateUser';
import ProjectList from '@/pages/Admin/ProjectAdmin/ProjectList';
import ProjectDetail from '@/pages/Admin/ProjectAdmin/ProjectDetail';
import CreateProject from '@/pages/Admin/ProjectAdmin/CrateProject';
import MenuAdmin from '@/pages/Admin/ClientAdmin/MenuAdmin';
import RequirementList from '@/pages/Project/Requirement/RequirementList';
import AppCateList from '@/pages/Admin/AppAdmin/AppCateList';
import AppList from '@/pages/Admin/AppAdmin/AppList';
import IdeaPage from '@/pages/Idea/IdeaPage';
import PubRes from '@/pages/PubRes';
import WorkPlanLayout from '@/layouts/WorkPlanLayout';
import TemplateCateList from '@/pages/Admin/DockerTemplateAdmin/TemplateCateList';
import TemplateList from '@/pages/Admin/DockerTemplateAdmin/TemplateList';
import MyWorkLayout from '@/layouts/MyWorkLayout';
import HomeLayout from '@/layouts/HomeLayout';
import ProjectManager from '@/pages/ProjectManger';
import ProjectBoard from '@/pages/KnowledgeBase/ProjectBoard';
import CloudIndex from '@/pages/Project/Cloud/index';
import DevPkgList from '@/pages/Admin/DevContainerAdmin/DevPkgList';
import TestcaseList from '@/pages/Project/Testcase/TestcaseList';
import ProjectOverview from "@/pages/Project/Overview";
import IdeaStoreCateList from '@/pages/Admin/IdeaAdmin/IdeaStoreCateList';
import IdeaStoreList from '@/pages/Admin/IdeaAdmin/IdeaStoreList';
import IdeaList from '@/pages/Admin/IdeaAdmin/IdeaList';
import RecycleItemList from '@/pages/Project/Recycle/RecycleItemList';
import OrgManager from '@/pages/Org/OrgManager';
import OrgDetail from '@/pages/Org/OrgDetail';
import WidgetList from '@/pages/Admin/GitWidgetAdmin/WidgetList';
import SoftWareCateList from '@/pages/Admin/SoftWareAdmin/SoftWareCateList';
import SoftWareList from '@/pages/Admin/SoftWareAdmin/SoftWareList';
import SkillCateList from '@/pages/Admin/SkillCenterAdmin/SkillCateList';
import SkillPointList from '@/pages/Admin/SkillCenterAdmin/SkillPointList';

export interface IRouteConfig {
  // 路由路径
  path: string;
  // 路由组件
  component?: any;
  // 302 跳转
  redirect?: string;
  exact?: boolean;
  // 路由信息
  title: string;
  icon?: string;
  // 是否校验权限, false 为不校验, 不存在该属性或者为true 为校验, 子路由会继承父路由的 auth 属性
  auth?: boolean;
  routes?: IRouteConfig[];
  render?: any;
}

const getToolbarRoute = (prefix: string): IRouteConfig[] => {
  const routeList: IRouteConfig[] = [
    {
      path: prefix + "/idea",
      title: "项目知识点",
      component: IdeaPage,
    },
    {
      path: prefix + "/req",
      title: "需求列表",
      component: RequirementList,
      exact: true,
    },
    {
      path: prefix + '/task',
      title: '任务列表',
      component: IssueList,
      exact: true,
    },
    {
      path: prefix + '/bug',
      title: '缺陷列表',
      component: IssueList,
      exact: true,
    },
    {
      path: prefix + "/testcase",
      title: "测试用例",
      component: TestcaseList,
      exact: true,
    },
    {
      path: prefix + '/record',
      title: '工作记录',
      component: ProjectRecord,
      exact: true,
    },
    {
      path: prefix + "/record/subscribe",
      title: "工作记录订阅",
      component: SubscribeList,
      exact: true,
    },
    {
      path: prefix + '/access',
      title: '第三方接入',
      component: ProjectAccess,
      exact: true,
    },
    {
      path: prefix + '/access/view',
      title: '第三方接入详情',
      component: ProjectAccessView,
      exact: true,
    },
    {
      path: prefix + "/cloud",
      title: "研发环境",
      component: CloudIndex,
      exact: true,
    },
    {
      path: prefix + "/recycle",
      title: "回收站",
      component: RecycleItemList,
      exact: true,
    },
    {
      path: prefix + "/overview",
      title: "项目信息",
      component: ProjectOverview,
      exact: true,
    },
  ];
  return routeList;
};

const routesConfig: IRouteConfig[] = [
  {
    path: '/',
    title: '',
    exact: true,
    render: () => {
      return <Redirect to={WORKBENCH_PATH} />;
    },
  },
  {
    path: '/app',
    component: BasicLayout,
    title: '系统路由',
    // exact: true,
    routes: [
      {
        path: WORKBENCH_PATH,
        title: '工作台',
        component: Workbench,
        exact: true,
      },
      {
        path: APP_PROJECT_MANAGER_PATH,
        title: "项目管理",
        component: ProjectManager,
        exact: true,
      },
      {
        path: PUB_RES_PATH,
        title: "公共资源",
        component: PubRes,
        exact: true,
      },
      {
        path: APP_ORG_MANAGER_PATH,
        title: "团队管理",
        component: OrgManager,
        exact: true,
      },
      {
        path: APP_ORG_PATH,
        title: "团队详情",
        component: OrgDetail,
        exact: true,
      },
      {
        path: APP_PROJECT_PATH,
        title: '项目',
        component: ProjectLayout,
        routes: [
          {
            path: APP_PROJECT_HOME_PATH,
            title: "主面板入口",
            component: HomeLayout,
            routes: getToolbarRoute(APP_PROJECT_HOME_PATH),
          },
          {
            path: APP_PROJECT_WORK_PLAN_PATH,
            title: "工作计划",
            component: WorkPlanLayout,
            routes: getToolbarRoute(APP_PROJECT_WORK_PLAN_PATH),
          },
          {
            path: APP_PROJECT_KB_PATH,
            title: '知识库',
            component: KnowledgeBaseLayout,
            routes: [
              {
                path: APP_PROJECT_KB_DOC_PATH,
                title: "项目文档",
                component: ProjectDoc,
                routes: getToolbarRoute(APP_PROJECT_KB_DOC_PATH),
              },
              {
                path: APP_PROJECT_KB_BOARD_PATH,
                title: "信息面板",
                component: ProjectBoard,
                routes: getToolbarRoute(APP_PROJECT_KB_BOARD_PATH),
              }
            ],
          },
          {
            path: APP_PROJECT_MY_WORK_PATH,
            title: "我的工作",
            component: MyWorkLayout,
            routes: getToolbarRoute(APP_PROJECT_MY_WORK_PATH),
          }
        ],
      },
    ],
  },
  {
    path: ADMIN_PATH,
    title: "管理界面",
    component: AdminLayout,
    routes: [
      {
        path: ADMIN_PATH_USER_LIST_SUFFIX,
        title: "用户列表",
        component: UserList,
        exact: true,
      },
      {
        path: ADMIN_PATH_USER_DETAIL_SUFFIX,
        title: "用户详情",
        component: UserDetail,
        exact: true,
      },
      {
        path: ADMIN_PATH_USER_CREATE_SUFFIX,
        title: "创建用户",
        component: CreateUser,
        exact: true,
      },
      {
        path: ADMIN_PATH_PROJECT_LIST_SUFFIX,
        title: "项目列表",
        component: ProjectList,
        exact: true,
      },
      {
        path: ADMIN_PATH_PROJECT_DETAIL_SUFFIX,
        title: "项目详情",
        component: ProjectDetail,
        exact: true,
      },
      {
        path: ADMIN_PATH_PROJECT_CREATE_SUFFIX,
        title: "创建项目",
        component: CreateProject,
        exact: true,
      },
      {
        path: ADMIN_PATH_CLIENT_MENU_SUFFIX,
        title: "额外菜单管理",
        component: MenuAdmin,
        exact: true,
      },
      {
        path: ADMIN_PATH_APPSTORE_CATE_SUFFIX,
        title: "应用类别管理",
        component: AppCateList,
        exact: true,
      },
      {
        path: ADMIN_PATH_APPSTORE_APP_SUFFIX,
        title: "应用管理",
        component: AppList,
        exact: true,
      },
      {
        path: ADMIN_PATH_SOFTWARE_CATE_SUFFIX,
        title: "软件类别管理",
        component: SoftWareCateList,
        exact: true,
      },
      {
        path: ADMIN_PATH_SOFTWARE_SUFFIX,
        title: "软件管理",
        component: SoftWareList,
        exact: true,
      },
      {
        path: ADMIN_PATH_WIDGET_SUFFIX,
        title: "Git插件管理",
        component: WidgetList,
        exact: true,
      },
      {
        path: ADMIN_PATH_IDEA_STORE_CATE_SUFFIX,
        title: "知识库类别管理",
        component: IdeaStoreCateList,
        exact: true,
      },
      {
        path: ADMIN_PATH_SKILL_CENTER_CATE_SUFFIX,
        title: "技能列表管理",
        component: SkillCateList,
        exact: true,
      },
      {
        path: ADMIN_PATH_SKILL_CENTER_POINT_SUFFIX,
        title: "技能点管理",
        component: SkillPointList,
        exact: true,
      },
      {
        path: ADMIN_PATH_IDEA_STORE_SUFFIX,
        title: "知识库管理",
        component: IdeaStoreList,
        exact: true,
      },
      {
        path: ADMIN_PATH_IDEA_SUFFIX,
        title: "知识点管理",
        component: IdeaList,
        exact: true,
      },
      {
        path: ADMIN_PATH_DOCKER_TEMPLATE_CATE_SUFFIX,
        title: "Docker模板类别管理",
        component: TemplateCateList,
        exact: true,
      },
      {
        path: ADMIN_PATH_DOCKER_TEMPLATE_APP_SUFFIX,
        title: "Docker模板管理",
        component: TemplateList,
        exact: true,
      },
      {
        path: ADMIN_PATH_DEV_CONTAINER_PKG_SUFFIX,
        title: "软件包管理",
        component: DevPkgList,
        exact: true,
      }
    ]
  },
  {
    path: '*',
    title: '错误页面',
    component: NoFond,
  },
];

export default routesConfig;
