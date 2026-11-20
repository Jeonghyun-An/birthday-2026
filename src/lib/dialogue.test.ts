import { describe, expect, it } from 'vitest';
import { advance, initialDialogue, isTyping, tick, visibleText } from './dialogue';

const lines = [{ text: '안녕' }, { text: '공주예요' }];

describe('tick', () => {
  it('한 글자씩 늘린다', () => {
    expect(tick(initialDialogue, lines)).toEqual({ index: 0, typed: 1, choosing: false });
  });

  it('줄 길이를 넘지 않는다', () => {
    const full = { index: 0, typed: 2, choosing: false };
    expect(tick(full, lines)).toBe(full);
  });

  it('선택지 상태에서는 그대로', () => {
    const choosing = { index: 1, typed: 4, choosing: true };
    expect(tick(choosing, lines)).toBe(choosing);
  });
});

describe('advance', () => {
  it('타이핑 중이면 그 줄을 다 보여 준다', () => {
    expect(advance({ index: 0, typed: 1, choosing: false }, lines)).toEqual({
      index: 0,
      typed: 2,
      choosing: false,
    });
  });

  it('다 나왔으면 다음 줄로 넘어가고 처음부터 타이핑한다', () => {
    expect(advance({ index: 0, typed: 2, choosing: false }, lines)).toEqual({
      index: 1,
      typed: 0,
      choosing: false,
    });
  });

  it('마지막 줄이 다 나왔으면 선택지를 띄운다', () => {
    expect(advance({ index: 1, typed: 4, choosing: false }, lines)).toEqual({
      index: 1,
      typed: 4,
      choosing: true,
    });
  });

  it('선택지 상태에서는 그대로', () => {
    const choosing = { index: 1, typed: 4, choosing: true };
    expect(advance(choosing, lines)).toBe(choosing);
  });
});

describe('isTyping', () => {
  it('글자가 남아 있으면 true', () => {
    expect(isTyping({ index: 0, typed: 1, choosing: false }, lines)).toBe(true);
    expect(isTyping({ index: 0, typed: 2, choosing: false }, lines)).toBe(false);
    expect(isTyping({ index: 1, typed: 0, choosing: true }, lines)).toBe(false);
  });
});

describe('visibleText', () => {
  it('한글과 이모지를 글자 단위로 자른다', () => {
    expect(visibleText('공주예요', 2)).toBe('공주');
    expect(visibleText('👑공주', 1)).toBe('👑');
    expect(visibleText('공주', 10)).toBe('공주');
  });
});
