import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    if (!config) {
      navigate('/login');
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const savedState = sessionStorage.getItem(config.stateKey);
    sessionStorage.removeItem(config.stateKey);

    if (code && state && state === savedState) {
      const redirectUri = window.location.origin + config.callbackPath;
      config.loginAction(dispatch, { code, state, redirectUri })
        .unwrap()
        .then(() => {
          navigate('/profile');
        })
        .catch((err) => {
          console.error('Login failed:', err);
          navigate('/login');
        });
    } else {
      console.error('State mismatch', { code: !!code, state, savedState });
      navigate('/login');
    }
  }, []);

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
