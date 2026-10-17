import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { TrackPage } from './pages/TrackPage';
import { CoursePage } from './pages/CoursePage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { HighlightsPage } from './pages/HighlightsPage';

// Practice pages load on first visit so lesson pages stay as light as before.
const named = (load, name) => lazy(() => load().then((m) => ({ default: m[name] })));
const DashboardPage = named(() => import('./pages/DashboardPage'), 'DashboardPage');
const ReviewPage = named(() => import('./pages/ReviewPage'), 'ReviewPage');
const MockPage = named(() => import('./pages/MockPage'), 'MockPage');
const PlaygroundPage = named(() => import('./pages/PlaygroundPage'), 'PlaygroundPage');
const CheatSheetPage = named(() => import('./pages/CheatSheetPage'), 'CheatSheetPage');
const SolvePage = named(() => import('./pages/SolvePage'), 'SolvePage');
const ProblemsPage = named(() => import('./pages/ProblemsPage'), 'ProblemsPage');
const AdminPage = named(() => import('./pages/AdminPage'), 'AdminPage');
const page = (el) => <Suspense fallback={null}>{el}</Suspense>;

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="highlights" element={<HighlightsPage />} />
        <Route path="dashboard" element={page(<DashboardPage />)} />
        <Route path="review" element={page(<ReviewPage />)} />
        <Route path="mock" element={page(<MockPage />)} />
        <Route path="playground" element={page(<PlaygroundPage />)} />
        <Route path="cheatsheet/:trackId/:courseId" element={page(<CheatSheetPage />)} />
        <Route path="solve/:slug" element={page(<SolvePage />)} />
        <Route path="problems" element={page(<ProblemsPage />)} />
        <Route path="admin" element={page(<AdminPage />)} />
        <Route path=":trackId" element={<TrackPage />} />
        <Route path=":trackId/:courseId" element={<CoursePage />} />
        <Route path=":trackId/:courseId/:lessonId" element={<LessonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
