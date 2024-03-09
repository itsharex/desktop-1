import React, { useEffect, useState } from "react";
import Button from "@/components/Button";
import { Card, Form, Input, List, Popover, Space, Tag, message } from "antd";
import type { AdminPermInfo } from '@/api/admin_auth';
import { get_admin_perm, get_admin_session } from '@/api/admin_auth';
import { request } from "@/utils/request";
import type { PackageInfo } from "@/api/dev_container";
import { list_package, list_package_version } from "@/api/dev_container";
import { remove_package, remove_package_version } from "@/api/dev_container_admin";
import AddPkgModal from "./components/AddPkgModal";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import AddVersionModal from "./components/AddVersionModal";

interface DevPkgProps {
    permInfo: AdminPermInfo;
    pkgInfo: PackageInfo;
    onRemove: () => void;
}

const DevPkg = (props: DevPkgProps) => {
    const [versionList, setVersionList] = useState([] as string[]);
    const [showAddVersionModal, setShowAddVersionModal] = useState(false);


    const loadVersionList = async () => {
        setVersionList([]);
        const res = await request(list_package_version({
            package_name: props.pkgInfo.name,
        }));
        setVersionList(res.version_list);
    };

    const removeVersion = async (version: string) => {
        const sessionId = await get_admin_session();
        await request(remove_package_version({
            admin_session_id: sessionId,
            package_name: props.pkgInfo.name,
            version: version,
        }));
        await loadVersionList();
        message.info(`删除 ${props.pkgInfo.name}:${version} 成功`);
    };

    const removePkg = async () => {
        const sessionId = await get_admin_session();
        await request(remove_package({
            admin_session_id: sessionId,
            package_name: props.pkgInfo.name,
        }));
        message.info(`删除软件包${props.pkgInfo.name}成功`);
        props.onRemove();
    };

    useEffect(() => {
        loadVersionList();
    }, []);

    return (
        <Card title={props.pkgInfo.name} style={{ marginBottom: "10px" }}
            extra={
                <Space>
                    <Button type="default" icon={<PlusOutlined />} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddVersionModal(true);
                    }} disabled={props.permInfo.dev_container_perm.add_package_version == false}>增加版本</Button>
                    <Popover trigger="click" placement="bottom" content={
                        <div style={{ padding: "10px 10px" }}>
                            <Button type="link" danger disabled={!(versionList.length == 0 && props.permInfo.dev_container_perm.remove_package)}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    removePkg();
                                }}>删除</Button>
                        </div>
                    }>
                        <MoreOutlined />
                    </Popover>
                </Space>
            }>
            <List dataSource={versionList} grid={{ gutter: 16 }}
                renderItem={version => (
                    <List.Item key={version}>
                        <Tag key={version} closable={props.permInfo.dev_container_perm.remove_package_version} onClose={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeVersion(version);
                        }} style={{ margin: "4px 4px" }}>{version}</Tag>
                    </List.Item>
                )} />
            {showAddVersionModal == true && (
                <AddVersionModal pkgName={props.pkgInfo.name} onCancel={() => setShowAddVersionModal(false)}
                    onOk={() => {
                        setShowAddVersionModal(false);
                        loadVersionList();
                    }} />
            )}
        </Card>
    );
}

const DevPkgList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [pkgInfoList, setPkgInfoList] = useState<PackageInfo[]>([]);
    const [showAddPkgModal, setShowAddPkgModal] = useState(false);
    const [curPage, setCurPage] = useState(0);
    const [filterPkgName, setFilterPkgName] = useState("");

    const loadPkgInfoList = async () => {
        const res = await request(list_package({}));
        setPkgInfoList(res.package_list);
    };


    useEffect(() => {
        loadPkgInfoList();
    }, []);

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    return (
        <Card title="软件包管理"
            style={{ height: "calc(100vh - 40px)", overflowY: "scroll" }}
            extra={
                <Form layout="inline">
                    <Form.Item>
                        <Input placeholder="过滤软件包名称" value={filterPkgName} allowClear onChange={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setFilterPkgName(e.target.value ?? "");
                        }} />
                    </Form.Item>
                    <Form.Item>
                        <Button onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowAddPkgModal(true);
                        }} disabled={!(permInfo?.dev_container_perm.add_package ?? false)}>增加软件包</Button>
                    </Form.Item>
                </Form>
            }>
            {permInfo != null && (
                <List rowKey="name" dataSource={pkgInfoList.filter(item => item.name.includes(filterPkgName))}
                    pagination={{ current: curPage + 1, pageSize: 10, total: pkgInfoList.filter(item => item.name.includes(filterPkgName)).length, hideOnSinglePage: true, onChange: page => setCurPage(page - 1), showSizeChanger: false }}
                    renderItem={pkgItem => (
                        <DevPkg pkgInfo={pkgItem} onRemove={() => loadPkgInfoList()} permInfo={permInfo} />
                    )} />
            )}
            {showAddPkgModal == true && (
                <AddPkgModal onCancel={() => setShowAddPkgModal(false)} onOk={(newPkgName: string) => {
                    setShowAddPkgModal(false);
                    loadPkgInfoList();
                    setCurPage(0);
                    setFilterPkgName(newPkgName);
                }} />
            )}
        </Card>
    );
};

export default DevPkgList;