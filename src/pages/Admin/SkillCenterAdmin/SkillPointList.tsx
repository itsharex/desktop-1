import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Card, Dropdown, Form, Input, InputNumber, message, Modal, Select, Space, Table } from "antd";
import { get_admin_session, get_admin_perm } from '@/api/admin_auth';
import type { AdminPermInfo } from '@/api/admin_auth';
import type { SkillCateInfo, FolderPathInfo, SkillFolderInfo, SkillPointInfo } from "@/api/skill_center";
import { list_skill_cate, list_skill_folder, list_skill_point, get_folder_path } from "@/api/skill_center";
import { create_skill_folder, create_skill_point, update_skill_folder, update_skill_point, remove_skill_folder, remove_skill_point, move_skill_folder, move_skill_point } from "@/api/skill_center_admin";
import { request } from "@/utils/request";
import type { ColumnsType } from 'antd/es/table';
import { EditText } from "@/components/EditCell/EditText";
import { EditNumber } from "@/components/EditCell/EditNumber";
import FolderTreeModal from "./components/FolderTreeModal";

interface AddModalProps {
    curCateId: string;
    curFolderId: string;
    onCancel: () => void;
    onOk: () => void;
}

const AddFolderModal = (props: AddModalProps) => {
    const [name, setName] = useState("");
    const [weight, setWeight] = useState(0);

    const createFolder = async () => {
        const sessionId = await get_admin_session();
        await request(create_skill_folder({
            admin_session_id: sessionId,
            folder_name: name,
            parent_folder_id: props.curFolderId,
            cate_id: props.curCateId,
            weight: weight,
        }));
        props.onOk();
        message.info("创建成功");
    };

    return (
        <Modal open title="创建目录"
            okText="创建" okButtonProps={{ disabled: name == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createFolder();
            }}>
            <Form>
                <Form.Item label="名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="权重">
                    <InputNumber value={weight} min={0} max={99} precision={0} controls={false} onChange={value => {
                        if (value != null) {
                            setWeight(value);
                        }
                    }} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const AddMultiFolderModal = (props: AddModalProps) => {
    const [nameText, setNameText] = useState("");

    const createFolder = async () => {
        const sessionId = await get_admin_session();
        for (const name of nameText.split("\n")) {
            if (name.trim() == "") {
                continue;
            }
            await request(create_skill_folder({
                admin_session_id: sessionId,
                folder_name: name.trim(),
                parent_folder_id: props.curFolderId,
                cate_id: props.curCateId,
                weight: 0,
            }));
        }
        props.onOk();
        message.info("创建成功");
    };

    return (
        <Modal open title="批量创建目录"
            okText="创建"
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createFolder();
            }}>
            <Form>
                <Form.Item>
                    <Input.TextArea value={nameText} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setNameText(e.target.value);
                    }} autoSize={{ minRows: 10, maxRows: 10 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

const AddPointModal = (props: AddModalProps) => {
    const [name, setName] = useState("");
    const [weight, setWeight] = useState(0);

    const createPoint = async () => {
        const sessionId = await get_admin_session();
        await request(create_skill_point({
            admin_session_id: sessionId,
            point_name: name,
            parent_folder_id: props.curFolderId,
            cate_id: props.curCateId,
            weight: weight,
        }));
        props.onOk();
        message.info("创建成功");
    };

    return (
        <Modal open title="创建技能点"
            okText="创建" okButtonProps={{ disabled: name == "" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createPoint();
            }}>
            <Form>
                <Form.Item label="名称">
                    <Input value={name} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setName(e.target.value.trim());
                    }} />
                </Form.Item>
                <Form.Item label="权重">
                    <InputNumber value={weight} min={0} max={99} precision={0} controls={false} onChange={value => {
                        if (value != null) {
                            setWeight(value);
                        }
                    }} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};


const AddMultiPointModal = (props: AddModalProps) => {
    const [nameText, setNameText] = useState("");

    const createPoint = async () => {
        const sessionId = await get_admin_session();
        for (const name of nameText.split("\n")) {
            if (name.trim() == "") {
                continue;
            }
            await request(create_skill_point({
                admin_session_id: sessionId,
                point_name: name.trim(),
                parent_folder_id: props.curFolderId,
                cate_id: props.curCateId,
                weight: 0,
            }));
        }
        props.onOk();
        message.info("创建成功");
    };

    return (
        <Modal open title="批量创建技能点"
            okText="创建"
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createPoint();
            }}>
            <Form>
                <Form.Item>
                    <Input.TextArea value={nameText} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setNameText(e.target.value);
                    }} autoSize={{ minRows: 10, maxRows: 10 }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const SkillPointList = () => {
    const [permInfo, setPermInfo] = useState<AdminPermInfo | null>(null);
    const [cateList, setCateList] = useState<SkillCateInfo[]>([]);
    const [curCateId, setCurCateId] = useState("");
    const [curFolderId, setCurFolderId] = useState("");
    const [folderPathList, setFolderPathList] = useState<FolderPathInfo[]>([]);
    const [subFolderList, setSubFolderList] = useState<SkillFolderInfo[]>([]);
    const [subPointList, setSubPointList] = useState<SkillPointInfo[]>([]);

    const [showAddFolderModal, setShowAddFolderModal] = useState(false);
    const [showAddPointModal, setShowAddPointModal] = useState(false);

    const [showAddMultiFolderModal, setShowAddMultiFolderModal] = useState(false);
    const [showAddMultiPointModal, setShowAddMultiPointModal] = useState(false);


    const [removeFolderInfo, setRemoveFolderInfo] = useState<SkillFolderInfo | null>(null);
    const [moveFolderInfo, setMoveFolderInfo] = useState<SkillFolderInfo | null>(null);

    const [removePointInfo, setRemovePointInfo] = useState<SkillPointInfo | null>(null);
    const [movePointInfo, setMovePointInfo] = useState<SkillPointInfo | null>(null);

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

    const loadSubFolderList = async () => {
        if (curCateId == "") {
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(list_skill_folder({
            session_id: sessionId,
            cate_id: curCateId,
            filter_by_parent_folder_id: true,
            parent_folder_id: curFolderId,
        }));
        setSubFolderList(res.folder_list);
    }

    const loadSubPointList = async () => {
        if (curCateId == "") {
            return;
        }
        const sessionId = await get_admin_session();
        const res = await request(list_skill_point({
            session_id: sessionId,
            cate_id: curCateId,
            filter_by_parent_folder_id: true,
            parent_folder_id: curFolderId,
        }));
        setSubPointList(res.point_list);
    };

    const calcFolderPathList = async () => {
        if (curCateId == "") {
            return;
        }
        if (curFolderId == "") {
            setFolderPathList([]);
        } else {
            const sessionId = await get_admin_session();
            const res = await request(get_folder_path({
                session_id: sessionId,
                cate_id: curCateId,
                folder_id: curFolderId,
            }));
            setFolderPathList(res.path_list);
        }
    };

    const removeFolder = async () => {
        if (removeFolderInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_skill_folder({
            admin_session_id: sessionId,
            cate_id: removeFolderInfo.cate_id,
            folder_id: removeFolderInfo.folder_id,
        }));
        setRemoveFolderInfo(null);
        await loadSubFolderList();
        message.info("删除成功");
    };

    const removePoint = async () => {
        if (removePointInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(remove_skill_point({
            admin_session_id: sessionId,
            cate_id: removePointInfo.cate_id,
            point_id: removePointInfo.point_id,
        }));
        setRemovePointInfo(null);
        await loadSubPointList();
        message.info("删除成功");
    };

    const moveFolder = async (newFolderId: string) => {
        if (moveFolderInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(move_skill_folder({
            admin_session_id: sessionId,
            cate_id: moveFolderInfo.cate_id,
            folder_id: moveFolderInfo.folder_id,
            parent_folder_id: newFolderId,
        }));
        setMoveFolderInfo(null);
        await loadSubFolderList();
        message.info("移动成功");
    };

    const movePoint = async (newFolderId: string) => {
        if (movePointInfo == null) {
            return;
        }
        const sessionId = await get_admin_session();
        await request(move_skill_point({
            admin_session_id: sessionId,
            cate_id: movePointInfo.cate_id,
            point_id: movePointInfo.point_id,
            parent_folder_id: newFolderId,
        }));
        setMovePointInfo(null);
        await loadSubPointList();
        message.info("移动成功");
    };

    const folderColumns: ColumnsType<SkillFolderInfo> = [
        {
            title: "名称",
            render: (_, row: SkillFolderInfo) => (
                <EditText editable={permInfo?.skill_center_perm.update_folder ?? false}
                    content={row.folder_name} onChange={async value => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_skill_folder({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                folder_id: row.folder_id,
                                folder_name: value.trim(),
                                weight: row.weight,
                            }));
                            await loadSubFolderList();
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon onClick={() => {
                        setCurFolderId(row.folder_id);
                    }} />
            ),
        },
        {
            title: "权重",
            width: 180,
            render: (_, row: SkillFolderInfo) => (
                <EditNumber editable={permInfo?.skill_center_perm.update_folder ?? false}
                    value={row.weight}
                    onChange={async value => {
                        if (value < 0 || value > 99) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_skill_folder({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                folder_id: row.folder_id,
                                folder_name: row.folder_name,
                                weight: value,
                            }));
                            await loadSubFolderList();
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                        return false;
                    }} showEditIcon fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "子目录",
            width: 100,
            dataIndex: "sub_folder_count",
        },
        {
            title: "技能点",
            width: 100,
            dataIndex: "sub_point_count",
        },
        {
            title: "操作",
            width: 200,
            render: (_, row: SkillFolderInfo) => (
                <Space>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!(permInfo?.skill_center_perm.move_folder ?? false)}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setMoveFolderInfo(row);
                        }}>移动</Button>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                        disabled={!(permInfo?.skill_center_perm.remove_folder ?? false) || row.sub_folder_count != 0 || row.sub_point_count != 0}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemoveFolderInfo(row);
                        }}>删除</Button>
                </Space>
            ),
        },
    ];

    const pointColumns: ColumnsType<SkillPointInfo> = [
        {
            title: "名称",
            render: (_, row: SkillPointInfo) => (
                <EditText editable={permInfo?.skill_center_perm.update_point ?? false} content={row.point_name}
                    onChange={async value => {
                        if (value.trim() == "") {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_skill_point({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                point_id: row.point_id,
                                point_name: value.trim(),
                                weight: row.weight,
                            }));
                            await loadSubPointList();
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon />
            ),
        },
        {
            title: "权重",
            width: 180,
            render: (_, row: SkillPointInfo) => (
                <EditNumber editable={permInfo?.skill_center_perm.update_point ?? false}
                    value={row.weight} onChange={async value => {
                        if (value < 0 || value > 99) {
                            return false;
                        }
                        try {
                            const sessionId = await get_admin_session();
                            await request(update_skill_point({
                                admin_session_id: sessionId,
                                cate_id: row.cate_id,
                                point_id: row.point_id,
                                point_name: row.point_name,
                                weight: value,
                            }));
                            await loadSubPointList();
                            return true;
                        } catch (e) {
                            console.log(e);
                            return false;
                        }
                    }} showEditIcon fixedLen={0} min={0} max={99} />
            ),
        },
        {
            title: "学习记录",
            width: 100,
            dataIndex: "total_learn_count",
        },
        {
            title: "操作",
            width: 200,
            render: (_, row: SkillPointInfo) => (
                <Space>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} disabled={!(permInfo?.skill_center_perm.move_point ?? false)}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setMovePointInfo(row);
                        }}>移动</Button>
                    <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} danger
                        disabled={!(permInfo?.skill_center_perm.remove_point ?? false)}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRemovePointInfo(row);
                        }}>删除</Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        get_admin_perm().then(res => setPermInfo(res));
    }, []);

    useEffect(() => {
        loadCateList();
    }, []);

    useEffect(() => {
        setFolderPathList([]);
        setSubFolderList([]);
        setSubPointList([]);
        if (curFolderId != "") {
            setCurFolderId("");
        } else {
            loadSubFolderList();
            loadSubPointList();
        }
    }, [curCateId]);

    useEffect(() => {
        if (curCateId != "") {
            loadSubFolderList();
            loadSubPointList();
            calcFolderPathList();
        }
    }, [curFolderId]);

    return (
        <Card title={
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Button type="link" disabled={curFolderId == ""} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setCurFolderId("");
                    }}>
                        根目录
                    </Button>
                </Breadcrumb.Item>
                {folderPathList.map(item => (
                    <Breadcrumb.Item key={item.folder_id}>
                        <Button type="link" disabled={curFolderId == item.folder_id} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setCurFolderId(item.folder_id);
                        }}>
                            {item.folder_name}
                        </Button>
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        }
            bodyStyle={{ height: "calc(100vh - 90px)", overflowY: "scroll", padding: "0px 0px" }}
            headStyle={{ padding: "0px 0px" }}
            extra={
                <Form layout="inline">
                    <Form.Item label="技能类别">
                        <Select style={{ width: "100px" }} value={curCateId} onChange={value => setCurCateId(value)}>
                            {cateList.map(item => (
                                <Select.Option key={item.cate_id} value={item.cate_id}>{item.cate_name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            }>
            <Card title="技能目录" bordered={false}
                headStyle={{ fontSize: "16px", fontWeight: 700 }}
                extra={
                    <Dropdown.Button type="primary" disabled={!((permInfo?.skill_center_perm.create_folder ?? false) && curCateId != "")}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowAddFolderModal(true);
                        }}
                        menu={{
                            items: [
                                {
                                    key: "multiCreate",
                                    label: "批量创建",
                                    onClick: () => {
                                        setShowAddMultiFolderModal(true);
                                    },
                                }
                            ]
                        }}>创建目录</Dropdown.Button>
                }>
                <Table rowKey="folder_id" dataSource={subFolderList} columns={folderColumns} pagination={false} />
            </Card>

            <Card title="技能点" bordered={false}
                headStyle={{ fontSize: "16px", fontWeight: 700 }}
                extra={
                    <Dropdown.Button type="primary" disabled={!((permInfo?.skill_center_perm.create_point ?? false) && curCateId != "")}
                        onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowAddPointModal(true);
                        }}
                        menu={{
                            items: [
                                {
                                    key: "multiCreate",
                                    label: "批量创建",
                                    onClick: () => {
                                        setShowAddMultiPointModal(true);
                                    },
                                }
                            ]
                        }}>创建技能点</Dropdown.Button>
                }>
                <Table rowKey="point_id" dataSource={subPointList} columns={pointColumns} pagination={false} />
            </Card>

            {showAddFolderModal == true && (
                <AddFolderModal curCateId={curCateId} curFolderId={curFolderId} onCancel={() => setShowAddFolderModal(false)}
                    onOk={() => {
                        setShowAddFolderModal(false);
                        loadSubFolderList();
                    }} />
            )}
            {showAddMultiFolderModal == true && (
                <AddMultiFolderModal curCateId={curCateId} curFolderId={curFolderId} onCancel={() => setShowAddMultiFolderModal(false)}
                    onOk={() => {
                        setShowAddMultiFolderModal(false);
                        loadSubFolderList();
                    }} />
            )}
            {showAddPointModal == true && (
                <AddPointModal curCateId={curCateId} curFolderId={curFolderId} onCancel={() => setShowAddPointModal(false)}
                    onOk={() => {
                        setShowAddPointModal(false);
                        loadSubPointList();
                    }} />
            )}
            {showAddMultiPointModal == true && (
                <AddMultiPointModal curCateId={curCateId} curFolderId={curFolderId} onCancel={() => setShowAddMultiPointModal(false)}
                    onOk={() => {
                        setShowAddMultiPointModal(false);
                        loadSubPointList();
                    }} />
            )}
            {removeFolderInfo != null && (
                <Modal open title="删除技能目录"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemoveFolderInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeFolder();
                    }}>
                    是否删除技能目录&nbsp;{removeFolderInfo.folder_name}&nbsp;?
                </Modal>
            )}
            {removePointInfo != null && (
                <Modal open title="删除技能点"
                    okText="删除" okButtonProps={{ danger: true }}
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRemovePointInfo(null);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removePoint();
                    }}>
                    是否删除技能点&nbsp;{removePointInfo.point_name}&nbsp;?
                </Modal>
            )}
            {moveFolderInfo != null && (
                <FolderTreeModal cateId={curCateId} skipFolderId={curFolderId} onCancel={() => setMoveFolderInfo(null)}
                    onOk={(newFolderId) => moveFolder(newFolderId)} />
            )}
            {movePointInfo != null && (
                <FolderTreeModal cateId={curCateId} skipFolderId={curFolderId} onCancel={() => setMovePointInfo(null)}
                    onOk={(newFolderId) => movePoint(newFolderId)} />
            )}
        </Card>
    );
};

export default SkillPointList;