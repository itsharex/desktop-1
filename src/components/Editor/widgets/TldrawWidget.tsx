//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useState } from 'react';
import { type WidgetProps } from './common';
import type { StoreSnapshot, TLRecord, TLUiMenuGroup, Editor } from '@tldraw/tldraw';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EditorWrap from '../components/EditorWrap';
import { getAssetUrls } from '@tldraw/assets/selfHosted';
import s from "./TldrawWidget.module.less";
import { Button, Modal, Space, message } from 'antd';
import { observer, useLocalObservable } from 'mobx-react';
import { runInAction } from 'mobx';


// 为了防止编辑器出错，WidgetData结构必须保存稳定
export interface WidgetData {
    data?: StoreSnapshot<TLRecord>;
}

export const tldrawWidgetInitData: WidgetData = {
    data: undefined,
};

interface EditModalProps {
    data?: StoreSnapshot<TLRecord>;
    onCancel: () => void;
    onOk: (newData: StoreSnapshot<TLRecord>) => void;
}

const EditModal = observer((props: EditModalProps) => {
    const localStore = useLocalObservable(() => ({
        drawEditor: null as Editor | null,
        setDrawEditor(val: Editor | null) {
            if (this.drawEditor != null) {
                return;
            }
            runInAction(() => {
                this.drawEditor = val;
            });
        },
    }));

    return (
        <Modal open title="修改白板内容" footer={null} closable={false}
            width="calc(100vw - 200px)">
            <div style={{ height: "calc(100vh - 300px)" }}>
                <Tldraw snapshot={props.data}
                    assetUrls={getAssetUrls({ baseUrl: "/tldraw" })}
                    onMount={editor => {
                        localStore.setDrawEditor(editor);
                        editor.updateInstanceState({
                            isDebugMode: false,
                        });
                    }}
                    overrides={{
                        menu(_, menus) {
                            const newMenus = menus.filter(item => item.id != "extras");
                            const menuIndex = menus.findIndex(item => item.id == "menu");
                            if (menuIndex != -1) {
                                (newMenus[menuIndex] as TLUiMenuGroup).children = (newMenus[menuIndex] as TLUiMenuGroup).children.filter(item => ["file", "edit"].includes(item.id) == false);
                            }
                            return newMenus;
                        },
                        tools(_, tools) {
                            if (tools["asset"] != undefined) {
                                tools["asset"].onSelect = () => {
                                    message.warn("不能嵌入图片");
                                };
                            }
                            return tools;
                        }
                    }} />
            </div>
            <div style={{ position: "relative", height: "30px", paddingTop: "10px" }}>
                <Space style={{ position: "absolute", right: "10px" }} size="large">
                    <Button onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        props.onCancel();
                    }}>取消</Button>
                    <Button type="primary" onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (localStore.drawEditor != null) {
                            props.onOk(localStore.drawEditor.store.getSnapshot());
                        }
                    }}>保存</Button>
                </Space>
            </div>
        </Modal>
    );
});

const EditTldraw: React.FC<WidgetProps> = (props) => {
    const [initData, setInitData] = useState((props.initData as WidgetData).data);
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <ErrorBoundary>
            <>
                <EditorWrap onChange={() => props.removeSelf()} onEdit={() => setShowEditModal(true)}>
                    <div style={{ height: "calc(100vh - 300px)", margin: "0px 30px" }}>
                        <Tldraw snapshot={initData}
                            assetUrls={getAssetUrls({ baseUrl: "/tldraw" })}
                            onMount={editor => {
                                editor.updateInstanceState({
                                    isDebugMode: false,
                                    isReadonly: true,
                                    isToolLocked: true,
                                    exportBackground: false,
                                    isHoveringCanvas: null,
                                });
                            }}
                            className={s.wrap}
                            overrides={{
                                menu(_, menus) {
                                    const newMenus = menus.filter(item => item.id != "extras");
                                    const menuIndex = menus.findIndex(item => item.id == "menu");
                                    if (menuIndex != -1) {
                                        (newMenus[menuIndex] as TLUiMenuGroup).children = (newMenus[menuIndex] as TLUiMenuGroup).children.filter(item => ["file", "edit"].includes(item.id) == false);
                                    }
                                    return newMenus;
                                }
                            }} />
                    </div>
                </EditorWrap>
                {showEditModal && (
                    <EditModal data={initData}
                        onCancel={() => setShowEditModal(false)} onOk={(newData: StoreSnapshot<TLRecord>) => {
                            setInitData(newData);
                            props.writeData({
                                data: newData,
                            });
                            setShowEditModal(false);
                            message.info("保存成功");
                        }} />
                )}
            </>
        </ErrorBoundary>
    );
};

const ViewTldraw: React.FC<WidgetProps> = (props) => {
    return (
        <ErrorBoundary>
            <EditorWrap>
                <div style={{ height: "calc(100vh - 300px)", marginRight: "20px" }}>
                    <Tldraw snapshot={(props.initData as WidgetData).data}
                        assetUrls={getAssetUrls({ baseUrl: "/tldraw" })}
                        onMount={editor => {
                            editor.updateInstanceState({
                                isDebugMode: false,
                                isReadonly: true,
                                isToolLocked: true,
                                exportBackground: false,
                                isHoveringCanvas: null,
                            });
                        }}
                        className={s.wrap}
                        overrides={{
                            menu(_, menus) {
                                const newMenus = menus.filter(item => item.id != "extras");
                                const menuIndex = menus.findIndex(item => item.id == "menu");
                                if (menuIndex != -1) {
                                    (newMenus[menuIndex] as TLUiMenuGroup).children = (newMenus[menuIndex] as TLUiMenuGroup).children.filter(item => ["file", "edit"].includes(item.id) == false);
                                }
                                return newMenus;
                            }
                        }} />
                </div>
            </EditorWrap>
        </ErrorBoundary>
    );
}

export const TldrawWidget: React.FC<WidgetProps> = (props) => {
    if (props.editMode) {
        return <EditTldraw {...props} />;
    } else {
        return <ViewTldraw {...props} />;
    }
};