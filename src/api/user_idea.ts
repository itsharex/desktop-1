import { invoke } from '@tauri-apps/api/tauri';

//列出用户知识点
export async function list_idea(userId: string): Promise<string[]> {
    const cmd = 'plugin:user_idea_api|list_idea';
    return invoke<string[]>(cmd, { userId });
}

//保存用户知识点列表
export async function save_idea_list(userId: string, ideaIdList: string[]): Promise<void> {
    const cmd = 'plugin:user_idea_api|save_idea_list';
    return invoke<void>(cmd, { userId, ideaIdList });
}