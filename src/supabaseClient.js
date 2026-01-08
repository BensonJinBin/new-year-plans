import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
// 在 GitHub Pages 上，你需要将这些值添加到项目的 Settings > Secrets 中
// 在本地开发中，创建 .env.local 文件：
// VITE_SUPABASE_URL=your_supabase_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 配置！请设置环境变量：');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
  console.error('\n请访问 https://supabase.com/dashboard 获取这些值');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;