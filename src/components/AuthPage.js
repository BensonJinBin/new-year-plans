import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { signIn, signUp } from '../services/authService';
import './AuthPage.css';

function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    setLoading(false);

    if (result.success) {
      onLoginSuccess(result.data.user);
    } else {
      setError(result.error);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            {isLogin ? <FaUser /> : <FaEnvelope />}
          </div>
          <h2 className="auth-title">
            {isLogin ? '欢迎回来' : '创建账户'}
          </h2>
          <p className="auth-subtitle">
            {isLogin ? '登录以管理你的2026年计划' : '注册开始你的计划之旅'}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <FaEnvelope className="input-icon" />
              邮箱地址
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <FaLock className="input-icon" />
              密码
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
            {!isLogin && (
              <small className="form-text text-muted">
                密码至少需要6个字符
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                处理中...
              </>
            ) : (
              <>
                {isLogin ? '登录' : '注册'}
                <FaArrowRight className="ms-2" />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            className="btn btn-link toggle-btn"
            onClick={toggleMode}
            disabled={loading}
          >
            <FaArrowLeft className="me-1" />
            {isLogin ? '没有账户？点击注册' : '已有账户？点击登录'}
          </button>
        </div>

        <div className="auth-info">
          <p className="text-muted small mb-0">
            💡 提示：你的数据将安全存储在 Supabase 云端，支持多设备同步
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;