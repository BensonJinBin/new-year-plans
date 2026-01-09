import { supabase } from '../supabaseClient';

/**
 * 计划数据服务
 * 提供计划的 CRUD 操作
 * 所有操作都会自动应用行级安全策略（RLS），确保用户只能访问自己的数据
 */

// 获取当前用户的所有计划
export const getPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('获取计划失败:', error);
    return { success: false, error: error.message };
  }
};

// 添加新计划
export const addPlan = async (plan) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 获取当前用户的最大 order 值
    const { data: existingPlans } = await supabase
      .from('plans')
      .select('order')
      .eq('user_id', user.id)
      .order('order', { ascending: false })
      .limit(1);

    const maxOrder = existingPlans && existingPlans.length > 0 ? existingPlans[0].order : 0;

    const { data, error } = await supabase
      .from('plans')
      .insert([{
        user_id: user.id,
        title: plan.title,
        description: plan.description,
        progress: plan.progress,
        order: maxOrder + 1,
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('添加计划失败:', error);
    return { success: false, error: error.message };
  }
};

// 更新计划
export const updatePlan = async (planId, updates) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('更新计划失败:', error);
    return { success: false, error: error.message };
  }
};

// 删除计划
export const deletePlan = async (planId) => {
  try {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('删除计划失败:', error);
    return { success: false, error: error.message };
  }
};

// 监听计划数据变化（实时更新）
export const subscribeToPlans = (callback) => {
  const subscription = supabase
    .channel('plans-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // 监听所有变化（INSERT, UPDATE, DELETE）
        schema: 'public',
        table: 'plans',
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  // 返回取消订阅的函数
  return () => {
    subscription.unsubscribe();
  };
};

// 批量更新计划顺序
export const reorderPlans = async (planIds) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 使用事务批量更新每个计划的 order 值
    const promises = planIds.map((id, index) =>
      supabase
        .from('plans')
        .update({ order: index })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    const results = await Promise.all(promises);

    // 检查是否有错误
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      throw new Error(errors[0].error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('更新顺序失败:', error);
    return { success: false, error: error.message };
  }
};