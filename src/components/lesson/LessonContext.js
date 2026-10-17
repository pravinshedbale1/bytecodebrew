import { createContext, useContext } from 'react';

/** The key ('track/course/lesson') of the lesson being rendered, for components that save per-lesson data. */
export const LessonKeyContext = createContext(null);

export const useLessonKey = () => useContext(LessonKeyContext);
