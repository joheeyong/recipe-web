import apiClient from '../../../core/api/apiClient';

const authApi = {
  googleLogin: (code, redirectUri) =>
    apiClient.post('/api/auth/google', { code, redirectUri }),
  naverLogin: (code, state, redirectUri) =>
    apiClient.post('/api/auth/naver', { code, state, redirectUri }),
  kakaoLogin: (code, redirectUri) =>
    apiClient.post('/api/auth/kakao', { code, redirectUri }),
  fetchMe: () => apiClient.get('/api/auth/me'),
};

export default authApi;
