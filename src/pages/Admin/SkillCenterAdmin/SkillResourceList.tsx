//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useState } from "react";
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import { list_skill_cate, type SkillCateInfo } from "@/api/skill_center";
import { list as list_resource,get as get_resource, RESOURCE_ARTICLE, RESOURCE_EVAL, RESOURCE_MANUAL, RESOURCE_VIDEO, type ResourceInfo } from "@/api/skill_resource";
import { add as add_resource, update as update_resource, remove as remove_resource } from "@/api/skill_resource_admin";
import { request } from "@/utils/request";
import { Button, Card, Form, Input, InputNumber, message, Modal, Select, Table } from "antd";
import type { ColumnsType } from 'antd/es/table';
import { EditText } from "@/components/EditCell/EditText";
import { open as shell_open } from '@tauri-apps/api/shell';
import { EditNumber } from "@/components/EditCell/EditNumber";

interface AddModalProps {
    curCateId: string;
    onCancel: () => void;
    onOk: () => void;
}

const AddModal = (props: AddModalProps) => {

    const [resourceType, setResourceType] = useState(RESOURCE_ARTICLE);
    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [weight, setWeight] = useState(0);

    const addResource = async () => {
        const sessionId = await get_admin_session();
        await request(add_resource({
            admin_session_id: sessionId,
            cate_id: props.curCateId,
            resource_type: resourceType,
            title: title,
            link_url: linkUrl,
            weight: weight,
        }));
        props.onOk();
    };

    return (
        <Modal open title="增加资源"
            okText="增加" okButtonProps={{ disabled: title == "" || linkUrl.startsWith("https://") == false }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                addResource();
            }}>
            <Form labelCol={{ span: 2 }}>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="类型">
                    <Select value={resourceType} onChange={value => setResourceType(value)}>
                        <Select.Option value={RESOURCE_ARTICLE}>文章</Select.Option>
                        <Select.Option value={RESOURCE_VIDEO}>视频</Select.Option>
                        <Select.Option value={RESOURCE_MANUAL}>参考手册</Select.Option>
                        <Select.Option value={RESOURCE_EVAL}>能力评估</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Url" help={
                    <>
                        {linkUrl.startsWith("https://".substring(0, linkUrl.length)) == false && (
                            <span style={{ color: "red" }}>Url必须以https://开头</span>
                        )}
                    </>
                }>
                    <Input value={linkUrl} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setLinkUrl(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="权重">
                    <InputNumber value={weight} controls={false} min={0} max={99} precision={0} onChange={value => {
                        if (value != null) {
                            setWeight(value);
                        }
                    }} />
                </Form.Item>
            </Form>
        </Modal>
    )
};

const SkillResourceList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [cateList, setCateList] = useState<SkillCateInfo[]>([]);
    const [curCateId, setCurCateId] = useState("");
    const [resourceList, setResourceList] = useState<ResourceInfo[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [removeResourceInfo, setRemoveResourceInfo] = useState<ResourceInfo | null>(null);

    const loadCateList = async () => {
        const sessionId = await get_admin_session();
        const res = await request(list_skill_cate({
            session_id: sessionId,
            filter_publish: false,
            publish: false,
        }));
        setCateList(res.cate_list);
        if (res.cate_list.map(item => item.cate_id).includes(curCateId) == false) {
            if (res.cate_list.length > 0) {
                setCurCateId(res.cate_list[0].cate_id);
            }
        }
    };

    const loadResourceList = async () => {
        if (curCateId == "") {
            setResourceList([]);
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(list_resource({
            session_id: sessionId,
            cate_id: curCateId,
        }));
        setResourceList(res.resource_list);
    };

    const onUpdateResource = async (resourceId: string) => {
        const tmpList = resourceList.slice();
        const index = tmpList.findIndex(item=>item.resource_id == resourceId);
        if(index == -1){
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(get_resource({
            session_id: sessionId,
            cate_id: curCateId,
            resource_id: resourceId,
        }));
        tmpList[index] = res.resource;
        setResourceList(tmpList);
    };

    const removeResource = async () => {
        if (removeResourceInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_resource({
            admin_session_id: sessionId,
            resource_id: removeResourceInfo.resource_id,
            cate_id: curCateId,
        }));
        message.info("删除成功");
        await loadResourceList();
        setRemoveResourceInfo(null);
    };

    const columns: ColumnsType<ResourceInfo> = [
        {
            title: "标题",
            render: (_, row: ResourceInfo) => (
                <EditText editable={permInfo?.skill_center_perm.update_resource ?? false} content={row.title}
                    onChange={async value => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_resource({
                                admin_session_id: sessionId,
                                resource_id: row.resource_id,
                                cate_id: row.cate_id,
                                resource_type: row.resource_type,
                                title: value.trim(),
                                link_url: row.link_url,
                                weight: row.weight,
                            }));
                            await onUpdateResource(row.resource_id);
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon />
            ),
        },
        {
            title: "Url",
            render: (_, row: ResourceInfo) => (
                <EditText editable={permInfo?.skill_center_perm.update_resource ?? false} content={row.link_url}
                    onChange={async value => {
                        if (value.startsWith("https://") == false) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_resource({
                                admin_session_id: sessionId,
                                resource_id: row.resource_id,
                                cate_id: row.cate_id,
                                resource_type: row.resource_type,
                                title: row.title,
                                link_url: value.trim(),
                                weight: row.weight,
                            }));
                            await onUpdateResource(row.resource_id);
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon onClick={() => shell_open(row.link_url)} />
            ),
        },
        {
            title: "类型",
            width: 150,
            render: (_, row: ResourceInfo) => (
                <>
                    {row.resource_type == RESOURCE_ARTICLE && "文章"}
                    {row.resource_type == RESOURCE_VIDEO && "视频"}
                    {row.resource_type == RESOURCE_MANUAL && "参考手册"}
                    {row.resource_type == RESOURCE_EVAL && "能力评测"}
                </>
            ),
        },
        {
            title: "权重",
            width: 180,
            render: (_, row: ResourceInfo) => (
                <EditNumber editable={permInfo?.skill_center_perm.update_resource ?? false}
                    value={row.weight} onChange={async value => {
                        if (value < 0 || value > 99) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_resource({
                                admin_session_id: sessionId,
                                resource_id: row.resource_id,
                                cate_id: row.cate_id,
                                resource_type: row.resource_type,
                                title: row.title,
                                link_url: row.link_url,
                                weight: value,
                            }));
                            await onUpdateResource(row.resource_id);
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "操作",
            width: 100,
            render: (_, row: ResourceInfo) => (
                <Button type="link" danger style={{ minWidth: 0, padding: "0px 0px" }}
                    disabled={!(permInfo?.skill_center_perm.remove_resource ?? false)}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveResourceInfo(row);
                    }}>删除</Button>
            ),
        }
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadCateList();
    }, []);

    useEffect(() => {
        loadResourceList();
    }, [curCateId]);

    return (
        <Card title="技能资源"
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll", padding: "0px 0px" }}
            extra={
                <Form layout="inline">
                    <Form.Item label="技能类别">
                        <Select style={{ width: "100px" }} value={curCateId} onChange={value => setCurCateId(value)}>
                            {cateList.map(item => (
                                <Select.Option key={item.cate_id} value={item.cate_id}>{item.cate_name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" disabled={!(permInfo?.skill_center_perm.add_resource ?? false)}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setShowAddModal(true);
                            }}>增加资源</Button>
                    </Form.Item>
                </Form>
            }>
            <Table rowKey="resource_id" dataSource={resourceList} columns={columns} pagination={false} />
            {showAddModal == true && (
                <AddModal curCateId={curCateId} onCancel={() => setShowAddModal(false)}
                    onOk={() => {
                        setShowAddModal(false);
                        loadResourceList();
                    }} />
            )}
            {removeResourceInfo != null && (
                <Modal open title="删除资源"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveResourceInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeResource();
                    }}>
                    是否删除资源&nbsp;{removeResourceInfo.title}&nbsp;?
                </Modal>
            )}
        </Card>
    );
};

export default SkillResourceList;