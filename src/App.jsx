import { Routes, Route } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { TrackPage } from './pages/TrackPage';
import { CoursePage } from './pages/CoursePage';
import { LessonPage } from './pages/LessonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { HighlightsPage } from './pages/HighlightsPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="highlights" element={<HighlightsPage />} />
        <Route path=":trackId" element={<TrackPage />} />
        <Route path=":trackId/:courseId" element={<CoursePage />} />
        <Route path=":trackId/:courseId/:lessonId" element={<LessonPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
