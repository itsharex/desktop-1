import { invoke } from '@tauri-apps/api/tauri';

export type WidgetInfo = {
    widget_id: string;
    widget_name: string;
    extension_list: string[];
    file_list: string[];
    file_id: string;
    icon_file_id: string;
    create_time: number;
    update_time: number;
}

export type ListWidgetResponse = {
    code: number;
    err_msg: string;
    widget_list: WidgetInfo[];
};

// 列出所有插件
export async function list_widget(): Promise<ListWidgetResponse> {
    const cmd = 'plugin:widget_store_api|list_widget';
    console.log(`%c${cmd}`, 'color:#0f0;');
    return invoke<ListWidgetResponse>(cmd, {});
}

// 启动git widget
export async function start(label: string, title: string, path: string, filePath: string): Promise<void> {
    const cmd = 'plugin:git_widget|start';
    const request = {
        label, title, path, filePath,
    }
    console.log(`%c${cmd}`, 'color:#0f0;', request);
    return invoke<void>(cmd, request);
}