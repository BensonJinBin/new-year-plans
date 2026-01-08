import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function App() {
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ title: '', description: '', progress: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', progress: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // 从localStorage加载数据
  useEffect(() => {
    const savedPlans = localStorage.getItem('newYearPlans2026');
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
    setIsInitialized(true);
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('newYearPlans2026', JSON.stringify(plans));
    }
  }, [plans, isInitialized]);

  const handleAddPlan = () => {
    if (newPlan.title.trim()) {
      const plan = {
        id: Date.now(),
        ...newPlan,
        createdAt: new Date().toISOString()
      };
      setPlans([...plans, plan]);
      setNewPlan({ title: '', description: '', progress: 0 });
      setShowAddForm(false);
    }
  };

  const handleDeletePlan = (id) => {
    setPlans(plans.filter(plan => plan.id !== id));
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.id);
    setEditForm({ title: plan.title, description: plan.description, progress: plan.progress });
  };

  const handleSaveEdit = () => {
    if (editForm.title.trim()) {
      setPlans(plans.map(plan => 
        plan.id === editingPlan 
          ? { ...plan, ...editForm }
          : plan
      ));
      setEditingPlan(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
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
        <div className="row">
          {plans.length === 0 ? (
            <div className="col-12">
              <div className="empty-state text-center py-5">
                <div className="empty-icon">🎯</div>
                <h3 className="mb-3">还没有计划</h3>
                <p className="text-muted">点击上方的"添加新计划"按钮开始创建你的2026年计划吧！</p>
              </div>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card plan-card h-100">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;