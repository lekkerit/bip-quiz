export type AnswerRange = [number, number];

export function calculateLevel(answers: AnswerRange[]): number {
  const midpoints = answers.map(([min, max]) => (min + max) / 2);
  const avg = midpoints.reduce((a, b) => a + b, 0) / midpoints.length;
  return Math.max(1, Math.min(7, Math.round(avg)));
}
