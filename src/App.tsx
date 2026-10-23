import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Layout } from '@/components/Layout';
import HomeView from '@/views/HomeView';

// The overview is the landing view and ships in the main bundle; the rest load on demand.
const FlowsView = lazy(() => import('@/views/FlowsView'));
const SectionView = lazy(() => import('@/views/SectionView'));
const AboutView = lazy(() => import('@/views/AboutView'));
const NotFound = lazy(() => import('@/views/NotFound'));

export function App() {
  return (
    // Vite's BASE_URL ("/RedTeamMapper/" on GitHub Pages) becomes the router basename.
    <BrowserRouter
      basename={import.meta.env.BASE_URL.replace(/\/$/, '')}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <MotionConfig reducedMotion="user">
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomeView />} />
            <Route path="flows" element={<FlowsView />} />
            <Route path="flows/:flowId" element={<FlowsView />} />
            <Route path="sections/:sectionId" element={<SectionView />} />
            <Route path="about" element={<AboutView />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </MotionConfig>
    </BrowserRouter>
  );
}
