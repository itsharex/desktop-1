import React, { useEffect, useMemo, useState } from 'react';
import { type WidgetProps } from './common';
import { observer, useLocalObservable } from 'mobx-react';
import EditorWrap from '../components/EditorWrap';
import { Modal, Table, Tree } from 'antd';
import s from "./TestcaseRefWidget.module.less";
import { FileOutlined, FolderOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import { useStores } from '@/hooks';
import { list_all_case, list_all_folder, get_case, type CaseInfo, list_case_by_id, FolderOrCaseInfo } from "@/api/project_testcase";
import type { ColumnsType } from 'antd/lib/table';
import type { DataNode } from "antd/lib/tree";
import { request } from '@/utils/request';
import Deliconsvg from '@/assets/svg/delicon.svg?react';
import { LocalTestcaseStore } from '@/stores/local';
import { useHistory } from 'react-router-dom';
import { LinkTestCaseInfo } from '@/stores/linkAux';
import Button from '@/components/Button';

export interface WidgetData {
    caseIdList: string[];
}

export const testcaseRefWidgetInitData: WidgetData = {
    caseIdList: [],
}

interface SimpleFolderOrCase {
    id: string;
    title: string;
    isFolder: boolean;
    parentFolderId: string;
}

interface AddTestCaseModalProps {
    checkedKeys: string[];
    onCancel: () => void;
    onOk: (newCaseIdList: string[]) => void;
}

const AddTestCaseModal = (props: AddTestCaseModalProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [treeNodeList, setTreeNodeList] = useState([] as DataNode[]);
    const [checkedKeys, setCheckedKeys] = useState(props.checkedKeys);

    const setupTreeNode = (pathItemList: SimpleFolderOrCase[], nodeList: DataNode[], parentFolderId: string) => {
        for (const pathItem of pathItemList) {
            if (pathItem.parentFolderId != parentFolderId) {
                continue;
            }
            const subNode: DataNode = {
                key: pathItem.id,
                title: pathItem.title,
                children: [],
                checkable: pathItem.isFolder == false,
                icon: pathItem.isFolder ? <FolderOutlined /> : <FileOutlined />,
                disabled: props.checkedKeys.includes(pathItem.id),
            };
            nodeList.push(subNode);
            if (pathItem.isFolder) {
                setupTreeNode(pathItemList, subNode.children!, pathItem.id);
            }
        }
    }


    const initTree = async () => {
        const folderRes = await request(list_all_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        const caseRes = await request(list_all_case({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
        }));
        const folderOrCaseList = [] as SimpleFolderOrCase[];
        for (const info of folderRes.folder_list) {
            folderOrCaseList.push({
                id: info.folder_id,
                title: info.title,
                isFolder: true,
                parentFolderId: info.parent_folder_id,
            });
        }
        for (const info of caseRes.case_list) {
            folderOrCaseList.push({
                id: info.case_id,
                title: info.title,
                isFolder: false,
                parentFolderId: info.parent_folder_id,
            });
        }
        const tmpNodeList = [] as DataNode[];
        setupTreeNode(folderOrCaseList, tmpNodeList, "");
        setTreeNodeList([{
            key: "",
            title: "根目录",
            children: tmpNodeList,
            checkable: false,
            icon: <FolderOutlined />,
        }]);
    };


    useEffect(() => {
        initTree();
    }, []);

    return (
        <Modal open title="选择测试用例" bodyStyle={{ height: "calc(100vh - 300px)", overflowY: "scroll" }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                const curCaseIdList = props.checkedKeys;
                const tmpIdList = [] as string[];
                for (const caseId of checkedKeys) {
                    if (curCaseIdList.includes(caseId)) {
                        continue;
                    }
                    tmpIdList.push(caseId);
                }
                props.onOk(tmpIdList);
            }}>
            <Tree treeData={treeNodeList} selectable={false} checkable showIcon
                checkedKeys={checkedKeys} onCheck={keys => {
                    if (Array.isArray(keys) == false) {
                        return;
                    }
                    setCheckedKeys(keys as string[]);
                }} />
        </Modal>
    );
};

const EditTestcaseRef = observer((props: WidgetProps) => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [dataSource, setDataSource] = useState<CaseInfo[]>([]);

    const [showAddModal, setShowAddModal] = useState(false);

    const loadDataSource = async () => {
        const widgetData = props.initData as WidgetData;
        if (widgetData.caseIdList.length == 0) {
            return;
        }
        const res = await request(list_case_by_id({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id_list: widgetData.caseIdList,
        }));
        setDataSource(res.case_list);
    };
    const addTestcase = async (caseIdList: string[]) => {
        const testcaseList = dataSource.slice();
        for (const caseId of caseIdList) {
            const index = testcaseList.findIndex(item => item.case_id == caseId);
            if (index != -1) {
                continue;
            }
            const res = await request(get_case({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                case_id: caseId,
                sprit_id: "",
            }));
            testcaseList.push(res.case_detail.case_info);
        }
        setDataSource(testcaseList);
        const saveData: WidgetData = {
            caseIdList: testcaseList.map(item => item.case_id),
        }
        props.writeData(saveData);
    };

    const removeTestcase = async (caseId: string) => {
        const tmpList = dataSource.filter(item => item.case_id != caseId);
        setDataSource(tmpList);
        const saveData: WidgetData = {
            caseIdList: tmpList.map(item => item.case_id),
        };
        props.writeData(saveData);
    };

    const columns: ColumnsType<CaseInfo> = [
        {
            title: "标题",
            width: 200,
            ellipsis: true,
            render: (_, row: CaseInfo) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Deliconsvg
                        style={{ marginRight: '10px', cursor: 'pointer', color: '#0E83FF' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeTestcase(row.case_id);
                        }}
                    />
                    {row.title}
                </div>
            ),
        },
        {
            title: "测试结果数量",
            width: 80,
            dataIndex: "result_count",
        },
        {
            title: "创建者",
            width: 100,
            dataIndex: "create_display_name",
        }
    ];

    useEffect(() => {
        loadDataSource();
    }, []);

    return (
        <EditorWrap onChange={() => props.removeSelf()}>
            <div className={s.add}>
                <Button
                    ghost
                    style={{ minWidth: '60px', borderRadius: '4px' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowAddModal(true);
                    }}
                >
                    <PlusOutlined />
                    添加
                </Button>
                <Table
                    style={{ marginTop: '8px' }}
                    rowKey='case_id'
                    columns={columns}
                    className={s.EditReqRef_table}
                    scroll={{ x: 100 }}
                    dataSource={dataSource}
                    pagination={false}
                />
            </div>
            {showAddModal == true && (
                <AddTestCaseModal checkedKeys={dataSource.map(item => item.case_id)}
                    onCancel={() => setShowAddModal(false)}
                    onOk={newCaseIdList => {
                        addTestcase(newCaseIdList);
                        setShowAddModal(false);
                    }} />
            )}
        </EditorWrap>
    );
});

const ViewTestcaseRef = observer((props: WidgetProps) => {
    const data = props.initData as WidgetData;

    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');

    const testcaseStore = useLocalObservable(() => new LocalTestcaseStore(userStore.sessionId, projectStore.curProjectId, ""));
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await request(list_case_by_id({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                case_id_list: data.caseIdList,
            }));
            testcaseStore.itemList = res.case_list.map(item => ({
                id: item.case_id,
                dataType: "case",
                dataValue: item,
            }));
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    const columns: ColumnsType<FolderOrCaseInfo> = [
        {
            title: "标题",
            width: 200,
            ellipsis: true,
            render: (_, row: FolderOrCaseInfo) => (
                <Button type="link"
                    style={{ minWidth: "0px", padding: "0px 0px" }}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        linkAuxStore.goToLink(new LinkTestCaseInfo("", projectStore.curProjectId, row.id), history);
                    }}>
                    <LinkOutlined />&nbsp;{row.dataValue.title}
                </Button>
            ),
        },
        {
            title: "测试结果数量",
            width: 80,
            render: (_, row: FolderOrCaseInfo) => (row.dataValue as CaseInfo).result_count,
        },
        {
            title: "创建者",
            width: 100,
            render: (_, row: FolderOrCaseInfo) => row.dataValue.create_display_name,
        }
    ];

    useMemo(() => {
        loadData();
    }, []);

    useEffect(() => {
        return () => {
            testcaseStore.unlisten();
        };
    }, []);

    return (
        <EditorWrap>
            <Table
                loading={loading}
                style={{ marginTop: '8px' }}
                rowKey={'id'}
                columns={columns}
                className={s.EditReqRef_table}
                scroll={{ x: 100 }}
                dataSource={testcaseStore.itemList}
                pagination={false}
            />
        </EditorWrap>
    );
});
export const TestcaseRefWidget: React.FC<WidgetProps> = (props) => {
    if (props.editMode) {
        return <EditTestcaseRef {...props} />;
    } else {
        return <ViewTestcaseRef {...props} />;
    }
};