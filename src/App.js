import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './features/auth/slice/authSlice';
import BottomNav from './shared/components/BottomNav';
import LoginPage from './features/auth/pages/LoginPage';
import OAuthCallbackPage from './features/auth/pages/OAuthCallbackPage';
import TasteProfilePage from './features/onboarding/pages/TasteProfilePage';
import HomePage from './features/home/pages/HomePage';
import RecipeListPage from './features/recipe/pages/RecipeListPage';
import RecipeDetailPage from './features/recipe/pages/RecipeDetailPage';
import BookmarksPage from './features/bookmark/pages/BookmarksPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import MyRecipesPage from './features/myrecipe/pages/MyRecipesPage';
import MyRecipeWritePage from './features/myrecipe/pages/MyRecipeWritePage';
import BlogWritePage from './features/blog/pages/BlogWritePage';
import BlogDetailPage from './features/blog/pages/BlogDetailPage';

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user]);

  const showBottomNav = ['/', '/my-recipes', '/recipes', '/bookmarks', '/profile', '/login'].includes(location.pathname);

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/google/callback" element={<OAuthCallbackPage provider="google" />} />
        <Route path="/auth/naver/callback" element={<OAuthCallbackPage provider="naver" />} />
        <Route path="/auth/kakao/callback" element={<OAuthCallbackPage provider="kakao" />} />
        <Route path="/onboarding" element={<TasteProfilePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/my-recipes" element={<MyRecipesPage />} />
        <Route path="/my-recipes/write" element={<MyRecipeWritePage />} />
        <Route path="/recipes" element={<RecipeListPage />} />
        <Route path="/recipes/:id" element={<RecipeDetailPage />} />
        <Route path="/blog/write" element={<BlogWritePage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default App;
