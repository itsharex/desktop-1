//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

export interface WidgetProps {
  editMode: boolean; //true表示编辑模式，false表示阅读模式
  initData: unknown; //初始化数据
  removeSelf: () => void; //编辑模式下从文档从删除自身节点
  writeData: (data: unknown) => void; //写入数据
}
