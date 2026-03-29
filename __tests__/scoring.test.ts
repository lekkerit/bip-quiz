import { calculateLevel } from '@/app/lib/scoring';

type AnswerRange = [number, number];

describe('calculateLevel', () => {
  it('returns 2 for all L1-2 answers', () => {
    const answers: AnswerRange[] = Array(6).fill([1, 2]);
    expect(calculateLevel(answers)).toBe(2);
  });

  it('returns 2 for mixed L1-2 and L2-3 answers', () => {
    const answers: AnswerRange[] = [
      [1, 2], [2, 3], [1, 2], [2, 3], [1, 2], [2, 3]
    ];
    expect(calculateLevel(answers)).toBe(2);
  });

  it('returns 3 for L2-3 dominated answers', () => {
    const answers: AnswerRange[] = Array(6).fill([2, 3]);
    expect(calculateLevel(answers)).toBe(3);
  });

  it('returns 4 for L3-4 dominated answers', () => {
    const answers: AnswerRange[] = Array(6).fill([3, 4]);
    expect(calculateLevel(answers)).toBe(4);
  });

  it('returns 5 for L4-5 dominated answers', () => {
    const answers: AnswerRange[] = Array(6).fill([4, 5]);
    expect(calculateLevel(answers)).toBe(5);
  });

  it('returns 7 for all L6-7 answers', () => {
    const answers: AnswerRange[] = Array(6).fill([6, 7]);
    expect(calculateLevel(answers)).toBe(7);
  });

  it('clamps to minimum 1', () => {
    const answers: AnswerRange[] = Array(6).fill([1, 1]);
    expect(calculateLevel(answers)).toBe(1);
  });

  it('clamps to maximum 7', () => {
    const answers: AnswerRange[] = Array(6).fill([7, 7]);
    expect(calculateLevel(answers)).toBe(7);
  });
});
