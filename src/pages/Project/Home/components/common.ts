//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { ENTRY_TYPE_SPRIT, type ENTRY_TYPE, ENTRY_TYPE_DOC, ENTRY_TYPE_PAGES, ENTRY_TYPE_BOARD, ENTRY_TYPE_FILE, ENTRY_TYPE_API_COLL, ENTRY_TYPE_DATA_ANNO } from "@/api/project_entry";

export const getEntryTypeStr = (entryType: ENTRY_TYPE): string => {
    if (entryType == ENTRY_TYPE_SPRIT) {
        return "工作计划";
    } else if (entryType == ENTRY_TYPE_DOC) {
        return "文档";
    } else if (entryType == ENTRY_TYPE_PAGES) {
        return "静态网页";
    } else if (entryType == ENTRY_TYPE_BOARD) {
        return "信息面板";
    } else if (entryType == ENTRY_TYPE_FILE) {
        return "文件";
    } else if (entryType == ENTRY_TYPE_API_COLL) {
        return "接口集合";
    } else if (entryType == ENTRY_TYPE_DATA_ANNO) {
        return "数据标注";
    }
    return "";
};