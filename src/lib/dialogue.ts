export type DialogueState = {
  /** 지금 보여 주는 대사 번호 */
  index: number;
  /** 지금 줄에서 보여 준 글자 수 */
  typed: number;
  /** 선택지를 띄웠는지 */
  choosing: boolean;
};

type Lines = ReadonlyArray<{ text: string }>;

export const initialDialogue: DialogueState = { index: 0, typed: 0, choosing: false };

const lineLength = (text: string) => [...text].length;

export function visibleText(text: string, typed: number): string {
  return [...text].slice(0, typed).join('');
}

export function isTyping(state: DialogueState, lines: Lines): boolean {
  return !state.choosing && state.typed < lineLength(lines[state.index].text);
}

export function tick(state: DialogueState, lines: Lines): DialogueState {
  if (!isTyping(state, lines)) return state;
  return { ...state, typed: state.typed + 1 };
}

export function advance(state: DialogueState, lines: Lines): DialogueState {
  if (state.choosing) return state;
  const full = lineLength(lines[state.index].text);
  if (state.typed < full) return { ...state, typed: full };
  if (state.index < lines.length - 1) return { index: state.index + 1, typed: 0, choosing: false };
  return { ...state, choosing: true };
}
