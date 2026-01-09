import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaUser } from 'react-icons/fa';
import AuthPage from './components/AuthPage';
import { onAuthStateChange, signOut } from './services/authService';
import { getPlans, addPlan, updatePlan, deletePlan, subscribeToPlans, reorderPlans } from './services/plansService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ title: '', description: '', progress: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', progress: 0 });

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await loadPlans();
      } else {
        setUser(null);
        setPlans([]);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 加载用户的计划数据
  const loadPlans = async () => {
    const result = await getPlans();
    if (result.success) {
      setPlans(result.data);
    }
  };

  // 监听计划数据实时变化
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToPlans((payload) => {
      if (payload.eventType === 'INSERT') {
        setPlans(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setPlans(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      } else if (payload.eventType === 'DELETE') {
        setPlans(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    return unsubscribe;
  }, [user]);

  const handleAddPlan = async () => {
    if (newPlan.title.trim()) {
      const result = await addPlan(newPlan);
      if (result.success) {
        setPlans(prev => [result.data, ...prev]);
        setNewPlan({ title: '', description: '', progress: 0 });
        setShowAddForm(false);
      } else {
        alert('添加计划失败: ' + result.error);
      }
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('确定要删除这个计划吗？')) {
      const result = await deletePlan(id);
      if (result.success) {
        setPlans(prev => prev.filter(p => p.id !== id));
      } else {
        alert('删除计划失败: ' + result.error);
      }
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.id);
    setEditForm({ title: plan.title, description: plan.description, progress: plan.progress });
  };

  const handleSaveEdit = async () => {
    if (editForm.title.trim()) {
      const result = await updatePlan(editingPlan, editForm);
      if (result.success) {
        // 立即更新本地状态
        setPlans(prev => prev.map(p => p.id === editingPlan ? { ...p, ...result.data } : p));
        setEditingPlan(null);
      } else {
        alert('更新计划失败: ' + result.error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
  };

  // 处理拖拽结束
  const handleDragEnd = async (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(plans);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 更新本地状态
    setPlans(items);

    // 保存到数据库
    const planIds = items.map(plan => plan.id);
    const reorderResult = await reorderPlans(planIds);

    if (!reorderResult.success) {
      alert('更新顺序失败: ' + reorderResult.error);
      // 如果失败，重新加载数据
      await loadPlans();
    }
  };

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      const result = await signOut();
      if (!result.success) {
        alert('登出失败: ' + result.error);
      }
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'info';
    if (progress >= 50) return 'warning';
    return 'danger';
  };

  const getProgressLabel = (progress) => {
    if (progress === 0) return '未开始';
    if (progress < 25) return '刚开始';
    if (progress < 50) return '进行中';
    if (progress < 75) return '进展良好';
    if (progress < 100) return '即将完成';
    return '已完成';
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="mb-0">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录时显示认证页面
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <div className="container py-5">
        {/* 头部 */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">
            🎉 2026年新年计划
          </h1>
          <p className="lead text-secondary">
            设定目标，追踪进度，实现梦想
          </p>
          {/* 用户信息 */}
          <div className="user-info mt-3">
            <span className="badge bg-light text-dark">
              <FaUser className="me-1" />
              {user.email}
            </span>
            <button 
              className="btn btn-outline-danger btn-sm ms-2"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="me-1" />
              退出登录
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="text-center mb-4">
          <p className="text-muted">
            📋 总计划数: <strong>{plans.length}</strong> <span className="mx-3">|</span>
            ✅ 已完成: <strong>{plans.filter(p => p.progress === 100).length}</strong> <span className="mx-3">|</span>
            📊 平均进度: <strong>{plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / plans.length) : 0}%</strong>
          </p>
        </div>

        {/* 添加计划按钮 */}
        <div className="text-center mb-4">
          <button 
            className="btn btn-add btn-lg"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <FaPlus className="me-2" />
            {showAddForm ? '取消添加' : '添加新计划'}
          </button>
        </div>

        {/* 添加计划表单 */}
        {showAddForm && (
          <div className="card form-card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">📝 添加新计划</h5>
              <div className="mb-3">
                <label className="form-label">计划标题 *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="例如：学习新技能"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">完成情况描述</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="描述你的计划详情..."
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">初始进度: {newPlan.progress}%</label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="100"
                  value={newPlan.progress}
                  onChange={(e) => setNewPlan({ ...newPlan, progress: parseInt(e.target.value) })}
                />
              </div>
              <button className="btn btn-primary" onClick={handleAddPlan}>
                <FaPlus className="me-2" />
                添加计划
              </button>
            </div>
          </div>
        )}

        {/* 计划列表 */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="plans" direction="horizontal">
            {(provided) => (
              <div
                className="row"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {plans.length === 0 ? (
                  <div className="col-12">
                    <div className="empty-state text-center py-5">
                      <div className="empty-icon">🎯</div>
                      <h3 className="mb-3">还没有计划</h3>
                      <p className="text-muted">点击上方的"添加新计划"按钮开始创建你的2026年计划吧！</p>
                    </div>
                  </div>
                ) : (
                  plans.map((plan, index) => (
                    <Draggable key={plan.id} draggableId={plan.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="col-lg-6 col-xl-4 mb-4"
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}
                        >
                          <div className="card plan-card h-100" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="card-body">
                              {editingPlan === plan.id ? (
                                // 编辑模式
                                <div className="edit-mode">
                                  <div className="mb-3">
                                    <label className="form-label">计划标题</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={editForm.title}
                                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">完成情况描述</label>
                                    <textarea
                                      className="form-control"
                                      rows="3"
                                      value={editForm.description}
                                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">进度: {editForm.progress}%</label>
                                    <input
                                      type="range"
                                      className="form-range"
                                      min="0"
                                      max="100"
                                      value={editForm.progress}
                                      onChange={(e) => setEditForm({ ...editForm, progress: parseInt(e.target.value) })}
                                    />
                                  </div>
                                  <div className="d-flex gap-2">
                                    <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>
                                      <FaSave className="me-1" />
                                      保存
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                                      <FaTimes className="me-1" />
                                      取消
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // 显示模式
                                <div className="display-mode">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h5 className="card-title mb-0">{plan.title}</h5>
                                    <span className={`badge bg-${getProgressColor(plan.progress)}`}>
                                      {getProgressLabel(plan.progress)}
                                    </span>
                                  </div>

                                  {/* 进度条 */}
                                  <div className="progress mb-3" style={{ height: '10px' }}>
                                    <div
                                      className={`progress-bar bg-${getProgressColor(plan.progress)}`}
                                      role="progressbar"
                                      style={{ width: `${plan.progress}%` }}
                                    />
                                  </div>

                                  {/* 进度百分比 */}
                                  <div className="text-muted small mb-3">
                                    进度: <strong>{plan.progress}%</strong>
                                  </div>

                                  {/* 描述 */}
                                  {plan.description && (
                                    <div className="description-container mb-3">
                                      <p className="card-text text-muted mb-0">
                                        {plan.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* 操作按钮 */}
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-outline-primary btn-sm"
                                      onClick={() => handleEditPlan(plan)}
                                    >
                                      <FaEdit className="me-1" />
                                      编辑
                                    </button>
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => handleDeletePlan(plan.id)}
                                    >
                                      <FaTrash className="me-1" />
                                      删除
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default App;