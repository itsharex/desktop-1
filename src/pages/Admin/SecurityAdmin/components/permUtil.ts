//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { CheckboxOptionType } from 'antd';
import type { UserPerm, ProjectPerm, ProjectMemberPerm, MenuPerm, AppStorePerm, DockerTemplatePerm, DevContainerPerm, IdeaStorePerm, WidgetStorePerm, SwStorePerm, SkillCenterPerm, OrgPerm, OrgMemberPerm, KeywordPerm } from "@/api/admin_auth";

export const userPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问用户模块",
        value: "read",
    },
    {
        label: "创建用户",
        value: "create",
    },
    {
        label: "修改状态",
        value: "set_state",
    },
    {
        label: "标记体验账号",
        value: "set_test_account",
    },
    {
        label: "重置密码",
        value: "reset_password",
    },
];

export const calcUserPerm = (values: string[] | undefined): UserPerm => {
    const ret: UserPerm = {
        read: false,
        create: false,
        set_state: false,
        set_test_account: false,
        reset_password: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "create") {
            ret.create = true;
        } else if (value == "set_state") {
            ret.set_state = true;
        } else if (value == "set_test_account") {
            ret.set_test_account = true;
        } else if (value == "reset_password") {
            ret.reset_password = true;
        }
    });
    return ret;
};

export const genUserPermValues = (perm: UserPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.create) {
        retList.push("create");
    }
    if (perm.set_state) {
        retList.push("set_state");
    }
    if (perm.set_test_account) {
        retList.push("set_test_account");
    }
    if (perm.reset_password) {
        retList.push("reset_password");
    }
    return retList;
};

export const projectPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问项目模块",
        value: "read",
    },
    {
        label: "修改项目",
        value: "update",
    },
    {
        label: "查看项目事件",
        value: "access_event",
    },
];

export const calcProjectPerm = (values: string[] | undefined): ProjectPerm => {
    const ret: ProjectPerm = {
        read: false,
        update: false,
        access_event: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "update") {
            ret.update = true;
        } else if (value == "access_event") {
            ret.access_event = true;
        }
    });
    return ret;
};

export const genProjectPermValues = (perm: ProjectPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.update) {
        retList.push("update");
    }
    if (perm.access_event) {
        retList.push("access_event");
    }
    return retList;
};

export const projectMemberPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问项目成员",
        value: "read",
    }
];

export const calcProjectMemberPerm = (values: string[] | undefined): ProjectMemberPerm => {
    const ret: ProjectMemberPerm = {
        read: false,
    }
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        }
    });
    return ret;
};

export const genProjectMemberPermValues = (perm: ProjectMemberPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    return retList;
};

export const menuPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问扩展菜单模块",
        value: "read",
    },
    {
        label: "增加扩展菜单",
        value: "add",
    },
    {
        label: "删除扩展菜单",
        value: "remove",
    },
    {
        label: "修改扩展菜单",
        value: "update",
    },
];

export const calcMenuPerm = (values: string[] | undefined): MenuPerm => {
    const ret: MenuPerm = {
        read: false,
        add: false,
        remove: false,
        update: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "add") {
            ret.add = true;
        } else if (value == "remove") {
            ret.remove = true;
        } else if (value == "update") {
            ret.update = true;
        }
    });
    return ret;
}

export const genMenuPermValues = (perm: MenuPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.add) {
        retList.push("add");
    }
    if (perm.remove) {
        retList.push("remove");
    }
    if (perm.update) {
        retList.push("update");
    }
    return retList;
};

export const appStorePermOptionList: CheckboxOptionType[] = [
    {
        label: "访问应用模块",
        value: "read",
    },
    {
        label: "增加应用类别",
        value: "add_cate",
    },
    {
        label: "修改应用类别",
        value: "update_cate",
    },
    {
        label: "删除应用类别",
        value: "remove_cate",
    },
    {
        label: "增加应用",
        value: "add_app",
    },
    {
        label: "修改应用",
        value: "update_app",
    },
    {
        label: "删除应用",
        value: "remove_app",
    },
];

export const calcAppStorePerm = (values: string[] | undefined): AppStorePerm => {
    const ret: AppStorePerm = {
        read: false,
        add_cate: false,
        update_cate: false,
        remove_cate: false,
        add_app: false,
        update_app: false,
        remove_app: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "add_cate") {
            ret.add_cate = true;
        } else if (value == "update_cate") {
            ret.update_cate = true;
        } else if (value == "remove_cate") {
            ret.remove_cate = true;
        } else if (value == "add_app") {
            ret.add_app = true;
        } else if (value == "update_app") {
            ret.update_app = true;
        } else if (value == "remove_app") {
            ret.remove_app = true;
        }
    });
    return ret;
};

export const genAppStorePermValues = (perm: AppStorePerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.add_cate) {
        retList.push("add_cate");
    }
    if (perm.update_cate) {
        retList.push("update_cate");
    }
    if (perm.remove_cate) {
        retList.push("remove_cate");
    }
    if (perm.add_app) {
        retList.push("add_app");
    }
    if (perm.update_app) {
        retList.push("update_app");
    }
    if (perm.remove_app) {
        retList.push("remove_app");
    }
    return retList;
};

export const dockerTemplatePermOptionList: CheckboxOptionType[] = [
    {
        label: "访问Docker应用模块",
        value: "read",
    },
    {
        label: "创建Docker应用类别",
        value: "create_cate",
    },
    {
        label: "修改Docker应用类别",
        value: "update_cate",
    },
    {
        label: "删除Docker应用类别",
        value: "remove_cate",
    },
    {
        label: "创建Docker应用",
        value: "create_app",
    },
    {
        label: "修改Docker应用",
        value: "update_app",
    },
    {
        label: "删除Docker应用",
        value: "remove_app",
    },
    {
        label: "创建Docker模板",
        value: "create_template",
    },
    {
        label: "删除Dockr模板",
        value: "remove_template",
    },
];

export const calcDockerTemplatePerm = (values: string[] | undefined): DockerTemplatePerm => {
    const ret: DockerTemplatePerm = {
        read: false,
        create_cate: false,
        update_cate: false,
        remove_cate: false,
        create_app: false,
        update_app: false,
        remove_app: false,
        create_template: false,
        remove_template: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "create_cate") {
            ret.create_cate = true;
        } else if (value == "update_cate") {
            ret.update_cate = true;
        } else if (value == "remove_cate") {
            ret.remove_cate = true;
        } else if (value == "create_app") {
            ret.create_app = true;
        } else if (value == "update_app") {
            ret.update_app = true;
        } else if (value == "remove_app") {
            ret.remove_app = true;
        } else if (value == "create_template") {
            ret.create_template = true;
        } else if (value == "remove_template") {
            ret.remove_template = true;
        }
    });
    return ret;
};

export const genDockerTemplatePermValues = (perm: DockerTemplatePerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.create_cate) {
        retList.push("create_cate");
    }
    if (perm.update_cate) {
        retList.push("update_cate");
    }
    if (perm.remove_cate) {
        retList.push("remove_cate");
    }
    if (perm.create_app) {
        retList.push("create_app");
    }
    if (perm.update_app) {
        retList.push("update_app");
    }
    if (perm.remove_app) {
        retList.push("remove_app");
    }
    if (perm.create_template) {
        retList.push("create_template");
    }
    if (perm.remove_template) {
        retList.push("remove_template");
    }
    return retList;
};

export const devContainerPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问研发环境模块",
        value: "read",
    },
    {
        label: "增加依赖软件包",
        value: "add_package",
    },
    {
        label: "删除依赖软件包",
        value: "remove_package",
    },
    {
        label: "增加软件包版本",
        value: "add_package_version",
    },
    {
        label: "删除软件包版本",
        value: "remove_package_version",
    },
];

export const calcDevContainerPerm = (values: string[] | undefined): DevContainerPerm => {
    const ret: DevContainerPerm = {
        read: false,
        add_package: false,
        remove_package: false,
        add_package_version: false,
        remove_package_version: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "add_package") {
            ret.add_package = true;
        } else if (value == "remove_package") {
            ret.remove_package = true;
        } else if (value == "add_package_version") {
            ret.add_package_version = true;
        } else if (value == "remove_package_version") {
            ret.remove_package_version = true;
        }
    });
    return ret;
}

export const genDevContainerPermValues = (perm: DevContainerPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.add_package) {
        retList.push("add_package");
    }
    if (perm.remove_package) {
        retList.push("remove_package");
    }
    if (perm.add_package_version) {
        retList.push("add_package_version");
    }
    if (perm.remove_package_version) {
        retList.push("remove_package_version");
    }
    return retList;
};

export const ideaStorePermOptionList: CheckboxOptionType[] = [
    {
        label: "访问知识库模块",
        value: "read",
    },
    {
        label: "创建知识库类别",
        value: "create_store_cate",
    },
    {
        label: "修改知识库类别",
        value: "update_store_cate",
    },
    {
        label: "删除知识库类别",
        value: "remove_store_cate",
    },
    {
        label: "创建知识库",
        value: "create_store",
    },
    {
        label: "修改知识库",
        value: "update_store",
    },
    {
        label: "移动知识库",
        value: "move_store",
    },
    {
        label: "删除知识库",
        value: "remove_store",
    },
    {
        label: "创建知识点",
        value: "create_idea",
    },
    {
        label: "修改知识点",
        value: "update_idea",
    },
    {
        label: "移动知识点",
        value: "move_idea",
    },
    {
        label: "删除知识点",
        value: "remove_idea",
    },
];

export const calcIdeaStorePerm = (values: string[] | undefined): IdeaStorePerm => {
    const ret: IdeaStorePerm = {
        read: false,
        create_store_cate: false,
        update_store_cate: false,
        remove_store_cate: false,
        create_store: false,
        update_store: false,
        move_store: false,
        remove_store: false,
        create_idea: false,
        update_idea: false,
        move_idea: false,
        remove_idea: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "create_store_cate") {
            ret.create_store_cate = true;
        } else if (value == "update_store_cate") {
            ret.update_store_cate = true;
        } else if (value == "remove_store_cate") {
            ret.remove_store_cate = true;
        } else if (value == "create_store") {
            ret.create_store = true;
        } else if (value == "update_store") {
            ret.update_store = true;
        } else if (value == "move_store") {
            ret.move_store = true;
        } else if (value == "remove_store") {
            ret.remove_store = true;
        } else if (value == "create_idea") {
            ret.create_idea = true;
        } else if (value == "update_idea") {
            ret.update_idea = true;
        } else if (value == "move_idea") {
            ret.move_idea = true;
        } else if (value == "remove_idea") {
            ret.remove_idea = true;
        }
    });
    return ret;
};

export const genIdeaStorePermValues = (perm: IdeaStorePerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.create_store_cate) {
        retList.push("create_store_cate");
    }
    if (perm.update_store_cate) {
        retList.push("update_store_cate");
    }
    if (perm.remove_store_cate) {
        retList.push("remove_store_cate");
    }
    if (perm.create_store) {
        retList.push("create_store");
    }
    if (perm.update_store) {
        retList.push("update_store");
    }
    if (perm.move_store) {
        retList.push("move_store");
    }
    if (perm.remove_store) {
        retList.push("remove_store");
    }
    if (perm.create_idea) {
        retList.push("create_idea");
    }
    if (perm.update_idea) {
        retList.push("update_idea");
    }
    if (perm.move_idea) {
        retList.push("move_idea");
    }
    if (perm.remove_idea) {
        retList.push("remove_idea");
    }
    return retList;
};

export const widgetStorePermOptionList: CheckboxOptionType[] = [
    {
        label: "访问Git内容插件模块",
        value: "read",
    },
    {
        label: "增加Git内容插件",
        value: "add_widget",
    },
    {
        label: "修改Git内容插件",
        value: "update_widget",
    },
    {
        label: "删除Git内容插件",
        value: "remove_widget",
    },
];

export const calcWidgetStorePerm = (values: string[] | undefined): WidgetStorePerm => {
    const ret: WidgetStorePerm = {
        read: false,
        add_widget: false,
        update_widget: false,
        remove_widget: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "add_widget") {
            ret.add_widget = true;
        } else if (value == "update_widget") {
            ret.update_widget = true;
        } else if (value == "remove_widget") {
            ret.remove_widget = true;
        }
    });
    return ret;
};

export const genWidgetStorePermValues = (perm: WidgetStorePerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.add_widget) {
        retList.push("add_widget");
    }
    if (perm.update_widget) {
        retList.push("update_widget");
    }
    if (perm.remove_widget) {
        retList.push("remove_widget");
    }
    return retList;
};

export const swStorePermOptionList: CheckboxOptionType[] = [
    {
        label: "访问软件市场模块",
        value: "read",
    },
    {
        label: "增加软件类别",
        value: "add_cate",
    },
    {
        label: "修改软件类别",
        value: "update_cate",
    },
    {
        label: "删除软件类别",
        value: "remove_cate",
    },
    {
        label: "增加软件",
        value: "add_soft_ware",
    },
    {
        label: "修改软件",
        value: "update_soft_ware",
    },
    {
        label: "删除软件",
        value: "remove_soft_ware",
    },
];

export const calcSwStorePerm = (values: string[] | undefined): SwStorePerm => {
    const ret: SwStorePerm = {
        read: false,
        add_cate: false,
        update_cate: false,
        remove_cate: false,
        add_soft_ware: false,
        update_soft_ware: false,
        remove_soft_ware: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "add_cate") {
            ret.add_cate = true;
        } else if (value == "update_cate") {
            ret.update_cate = true;
        } else if (value == "remove_cate") {
            ret.remove_cate = true;
        } else if (value == "add_soft_ware") {
            ret.add_soft_ware = true;
        } else if (value == "update_soft_ware") {
            ret.update_soft_ware = true;
        } else if (value == "remove_soft_ware") {
            ret.remove_soft_ware = true;
        }
    });
    return ret;
};

export const genSwStorePermValues = (perm: SwStorePerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.add_cate) {
        retList.push("add_cate");
    }
    if (perm.update_cate) {
        retList.push("update_cate");
    }
    if (perm.remove_cate) {
        retList.push("remove_cate");
    }
    if (perm.add_soft_ware) {
        retList.push("add_soft_ware");
    }
    if (perm.update_soft_ware) {
        retList.push("update_soft_ware");
    }
    if (perm.remove_soft_ware) {
        retList.push("remove_soft_ware");
    }
    return retList;
};

export const skillCenterPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问技能中心模块",
        value: "read",
    },
    {
        label: "创建技能类别",
        value: "create_cate",
    },
    {
        label: "修改技能类别",
        value: "update_cate",
    },
    {
        label: "删除技能类别",
        value: "remove_cate",
    },
    {
        label: "创建技能目录",
        value: "create_folder",
    },
    {
        label: "修改技能目录",
        value: "update_folder",
    },
    {
        label: "删除技能目录",
        value: "remove_folder",
    },
    {
        label: "移动技能目录",
        value: "move_folder",
    },
    {
        label: "创建技能点",
        value: "create_point",
    },
    {
        label: "修改技能点",
        value: "update_point",
    },
    {
        label: "删除技能点",
        value: "remove_point",
    },
    {
        label: "移动技能点",
        value: "move_point",
    },
    {
        label: "增加教育资源",
        value: "add_resource",
    },
    {
        label: "修改教育资源",
        value: "update_resource",
    },
    {
        label: "删除教育资源",
        value: "remove_resource",
    },
    {
        label: "增加课后练习",
        value: "add_question",
    },
    {
        label: "修改课后练习",
        value: "update_question",
    },
    {
        label: "删除课后练习",
        value: "remove_question",
    },
];

export const calcSkillCenterPerm = (values: string[] | undefined): SkillCenterPerm => {
    const ret: SkillCenterPerm = {
        read: false,
        create_cate: false,
        update_cate: false,
        remove_cate: false,
        create_folder: false,
        update_folder: false,
        remove_folder: false,
        move_folder: false,
        create_point: false,
        update_point: false,
        remove_point: false,
        move_point: false,
        add_resource: false,
        update_resource: false,
        remove_resource: false,
        add_question: false,
        update_question: false,
        remove_question: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "create_cate") {
            ret.create_cate = true;
        } else if (value == "update_cate") {
            ret.update_cate = true;
        } else if (value == "remove_cate") {
            ret.remove_cate = true;
        } else if (value == "create_folder") {
            ret.create_folder = true;
        } else if (value == "update_folder") {
            ret.update_folder = true;
        } else if (value == "remove_folder") {
            ret.remove_folder = true;
        } else if (value == "move_folder") {
            ret.move_folder = true;
        } else if (value == "create_point") {
            ret.create_point = true;
        } else if (value == "update_point") {
            ret.update_point = true;
        } else if (value == "remove_point") {
            ret.remove_point = true;
        } else if (value == "move_point") {
            ret.move_point = true;
        } else if (value == "add_resource") {
            ret.add_resource = true;
        } else if (value == "update_resource") {
            ret.update_resource = true;
        } else if (value == "remove_resource") {
            ret.remove_resource = true;
        } else if (value == "add_question") {
            ret.add_question = true;
        } else if (value == "update_question") {
            ret.update_question = true;
        } else if (value == "remove_question") {
            ret.remove_question = true;
        }
    });
    return ret;
};

export const genSkillCenterPermValues = (perm: SkillCenterPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.create_cate) {
        retList.push("create_cate");
    }
    if (perm.update_cate) {
        retList.push("update_cate");
    }
    if (perm.remove_cate) {
        retList.push("remove_cate");
    }
    if (perm.create_folder) {
        retList.push("create_folder");
    }
    if (perm.update_folder) {
        retList.push("update_folder");
    }
    if (perm.remove_folder) {
        retList.push("remove_folder");
    }
    if (perm.move_folder) {
        retList.push("move_folder");
    }
    if (perm.create_point) {
        retList.push("create_point");
    }
    if (perm.update_point) {
        retList.push("update_point");
    }
    if (perm.remove_point) {
        retList.push("remove_point");
    }
    if (perm.move_point) {
        retList.push("move_point");
    }
    if (perm.add_resource) {
        retList.push("add_resource");
    }
    if (perm.update_resource) {
        retList.push("update_resource");
    }
    if (perm.remove_resource) {
        retList.push("remove_resource");
    }
    if (perm.add_question) {
        retList.push("add_question");
    }
    if (perm.update_question) {
        retList.push("update_question");
    }
    if (perm.remove_question) {
        retList.push("remove_question");
    }
    return retList;
};

export const orgPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问团队模块",
        value: "read",
    },
    {
        label: "修改团队",
        value: "update",
    },
];

export const calcOrgPerm = (values: string[] | undefined): OrgPerm => {
    const ret: OrgPerm = {
        read: false,
        update: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "update") {
            ret.update = true;
        }
    });
    return ret;
};

export const genOrgPermValues = (perm: OrgPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.update) {
        retList.push("update");
    }
    return retList;
};

export const orgMemberPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问团队成员",
        value: "read",
    },
];

export const calcOrgMemberPerm = (values: string[] | undefined): OrgMemberPerm => {
    const ret: OrgMemberPerm = {
        read: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        }
    });
    return ret;
};

export const genOrgMemberPermValues = (perm: OrgMemberPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    return retList;
};

export const keywordPermOptionList: CheckboxOptionType[] = [
    {
        label: "访问关键词模块",
        value: "read",
    },
    {
        label: "增加关键词",
        value: "add",
    },
    {
        label: "删除关键词",
        value: "remove",
    },
];

export const calcKeywordPerm = (values: string[] | undefined): KeywordPerm => {
    const ret: KeywordPerm = {
        read: false,
        add: false,
        remove: false,
    };
    if (values == undefined) {
        return ret;
    }
    values.forEach(value => {
        if (value == "read") {
            ret.read = true;
        } else if (value == "add") {
            ret.add = true;
        } else if (value == "remove") {
            ret.remove = true;
        }
    });
    return ret;
};

export const genKeywordPermValues = (perm: KeywordPerm): string[] => {
    const retList: string[] = [];
    if (perm.read) {
        retList.push("read");
    }
    if (perm.add) {
        retList.push("add");
    }
    if (perm.remove) {
        retList.push("remove");
    }
    return retList;
};
