//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { MobXProviderContext } from 'mobx-react';
import React from 'react';
import type { StoreType } from '@/stores';

interface ContextType {
  stores: StoreType;
}

// 函数声明，重载
function useStores(): StoreType;
function useStores<T extends keyof StoreType>(storeName: T): StoreType[T];

/**
 * 获取根 store 或者指定 store 名称数据
 * @param storeName 指定子 store 名称
 * @returns typeof StoreType[storeName]
 */
function useStores<T extends keyof StoreType>(storeName?: T) {
  const rootStore = React.useContext(MobXProviderContext);
  const { stores } = rootStore as ContextType;
  return storeName ? stores[storeName] : stores;
}

export { useStores };
