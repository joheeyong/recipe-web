import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleLogin, naverLogin, kakaoLogin } from '../slice/authSlice';

const PROVIDER_CONFIG = {
  google: {
    stateKey: 'google_oauth_state',
    callbackPath: '/auth/google/callback',
    spinnerColor: '#4285F4',
    label: '로그인 중...',
    loginAction: (dispatch, { code, redirectUri }) =>
      dispatch(googleLogin({ code, redirectUri })),
  },
  naver: {
    stateKey: 'naver_oauth_state',
    callbackPath: '/auth/naver/callback',
    spinnerColor: '#03c75a',
    label: '네이버 로그인 중...',
    loginAction: (dispatch, { code, state, redirectUri }) =>
      dispatch(naverLogin({ code, state, redirectUri })),
  },
  kakao: {
    stateKey: 'kakao_oauth_state',
    callbackPath: '/auth/kakao/callback',
    spinnerColor: '#FEE500',
    label: '카카오 로그인 중...',
    loginAction: (dispatch, { code, redirectUri }) =>
      dispatch(kakaoLogin({ code, redirectUri })),
  },
};

function OAuthCallbackPage({ provider }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const config = PROVIDER_CONFIG[provider];
  const processed = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    if (!config) {
      setError('Unknown provider: ' + provider);
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const savedState = sessionStorage.getItem(config.stateKey);
    sessionStorage.removeItem(config.stateKey);

    if (!code) {
      setError('No code received from OAuth provider');
      return;
    }

    if (!state || state !== savedState) {
      setError(`State mismatch. state=${state}, saved=${savedState}`);
      return;
    }

    const redirectUri = window.location.origin + config.callbackPath;
    config.loginAction(dispatch, { code, state, redirectUri })
      .unwrap()
      .then(() => {
        navigate('/profile');
      })
      .catch((err) => {
        setError('Login API failed: ' + (err?.message || JSON.stringify(err)));
      });
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          textAlign: 'center',
          color: 'var(--text-primary)',
          maxWidth: 400,
          background: 'var(--bg-secondary)',
          padding: 32,
          borderRadius: 16,
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Login Error</p>
          <p style={{ fontSize: '0.85rem', color: '#ff3b30', marginBottom: 20, wordBreak: 'break-all' }}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)',
          borderTopColor: config.spinnerColor,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p>{config.label}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default OAuthCallbackPage;
