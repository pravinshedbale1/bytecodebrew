/**
 * Which problems have a Practice thinking walkthrough (src/data/think.js), and which are free. Kept
 * separate and tiny so the solver can link to walkthroughs without loading their content.
 * scripts/think-check.mjs keeps it in sync with think.js.
 */
export const THINK_INDEX = {
  'two-sum': { title: 'Two Sum', level: 'Easy', free: true },
  'valid-parentheses': { title: 'Valid Parentheses', level: 'Easy', free: true },
  'longest-substring-without-repeating-characters': { title: 'Longest Substring Without Repeating Characters', level: 'Medium', free: false },
  'daily-temperatures': { title: 'Daily Temperatures', level: 'Medium', free: false },
  'koko-eating-bananas': { title: 'Koko Eating Bananas', level: 'Medium', free: false },
  'rotting-oranges': { title: 'Rotting Oranges', level: 'Medium', free: false },
  'house-robber': { title: 'House Robber', level: 'Medium', free: false },
  'sliding-window-maximum': { title: 'Sliding Window Maximum', level: 'Hard', free: false },
};
