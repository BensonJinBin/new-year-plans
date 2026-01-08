import { supabase } from '../supabaseClient';

/**
 * 用户认证服务
 * 提供登录、注册、登出等功能
 */

// 注册新用户
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('注册失败:', error);
    return { success: false, error: error.message };
  }
};

// 用户登录
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('登录失败:', error);
    return { success: false, error: error.message };
  }
};

// 用户登出
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('登出失败:', error);
    return { success: false, error: error.message };
  }
};

// 获取当前用户
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    return user;
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
};

// 监听认证状态变化
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// 重置密码
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('重置密码失败:', error);
    return { success: false, error: error.message };
  }
};

// 更新用户信息
export const updateUser = async (updates) => {
  try {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('更新用户失败:', error);
    return { success: false, error: error.message };
  }
};