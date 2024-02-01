import React, { useState } from "react";
import { observer } from 'mobx-react';
import CardWrap from "@/components/CardWrap";
import { Space, Tabs } from "antd";
import Button from "@/components/Button";
import { PlusOutlined } from "@ant-design/icons";
import CreateModal from "./CreateModal";

const TestcaseList = () => {

    const [activeKey, setActiveKey] = useState<"folder" | "list">("folder");
    const [dataVersion, setDataVersion] = useState(0);
    const [curFolderId, setCurFolderId] = useState(""); //只对目录模式有效
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <CardWrap title="测试用例" extra={
            <Space size="middle">
                <Button icon={<PlusOutlined />} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowCreateModal(true);
                }}>
                    创建{activeKey == "folder" ? "目录/测试用例" : "测试用例"}
                </Button>
            </Space>
        }>
            <Tabs activeKey={activeKey} onChange={key => {
                if (key == "folder") {
                    setActiveKey(key);
                } else if (key == "list") {
                    setActiveKey(key);
                    setCurFolderId("");
                }
            }}
                type="card"
                items={[
                    {
                        key: "folder",
                        label: "目录",
                        children: (
                            <div style={{ height: "calc(100vh - 200px)", overflowY: "scroll", paddingRight: "20px" }}>
                                {activeKey == "folder" && `${dataVersion}`}
                            </div>
                        ),
                    },
                    {
                        key: "list",
                        label: "列表",
                        children: (
                            <div style={{ height: "calc(100vh - 200px)", overflowY: "scroll", paddingRight: "20px" }}>
                                {activeKey == "list" && ""}
                            </div>
                        ),
                    }
                ]} />
                {showCreateModal == true && (
                    <CreateModal curFolderId={curFolderId} enableFolder={activeKey=="folder"} 
                    onCancel={()=>setShowCreateModal(false)}
                    onOk={()=>{
                        setShowCreateModal(false);
                        setDataVersion(oldValue=>oldValue+1);
                    }}/>
                )}
        </CardWrap>
    );
};

export default observer(TestcaseList);