import { afterEach, describe, expect, it, vi } from 'vitest';
import { script } from '@/config/script';
import type { ContributionRepo, NewContribution } from '@/lib/repo';
import type { RawGiveForm } from '@/lib/validation';
import { handleSubmit, rawFromFormData } from './submit';

const form = (overrides: Partial<RawGiveForm> = {}): RawGiveForm => ({
  name: '예준',
  message: '',
  amountChoice: '15000',
  customAmount: '',
  website: '',
  ...overrides,
});

function fakeRepo() {
  const added: NewContribution[] = [];
  const repo: ContributionRepo = {
    list: async () => [],
    add: async (input) => {
      added.push(input);
    },
  };
  return { repo, added };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('handleSubmit', () => {
  it('검사를 통과하면 저장하고 금액을 담아 완료 화면으로 보낸다', async () => {
    const { repo, added } = fakeRepo();
    const outcome = await handleSubmit(form(), () => repo);
    expect(added).toEqual([{ name: '예준', message: null, amount: 15000 }]);
    expect(outcome).toEqual({ kind: 'redirect', to: '/give/done?amount=15000' });
  });

  it('검사에 실패하면 저장하지 않고 오류와 입력값을 돌려준다', async () => {
    const { repo, added } = fakeRepo();
    const raw = form({ name: '' });
    const outcome = await handleSubmit(raw, () => repo);
    expect(added).toEqual([]);
    expect(outcome).toEqual({
      kind: 'error',
      state: {
        status: 'error',
        errors: { name: script.errors.nameRequired },
        formError: null,
        values: raw,
      },
    });
  });

  it('함정 칸이 채워지면 저장하지 않고 완료 화면으로 보낸다', async () => {
    const { repo, added } = fakeRepo();
    const outcome = await handleSubmit(form({ website: 'spam' }), () => repo);
    expect(added).toEqual([]);
    expect(outcome).toEqual({ kind: 'redirect', to: '/give/done' });
  });

  it('저장이 실패하면 공주 말투 안내를 돌려준다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const raw = form();
    const repo: ContributionRepo = {
      list: async () => [],
      add: async () => {
        throw new Error('db down');
      },
    };
    const outcome = await handleSubmit(raw, () => repo);
    expect(outcome).toEqual({
      kind: 'error',
      state: { status: 'error', errors: {}, formError: script.errors.saveFailed, values: raw },
    });
  });

  it('저장소를 만들 수 없어도(환경변수 누락) 같은 안내를 돌려준다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const raw = form();
    const outcome = await handleSubmit(raw, () => {
      throw new Error('env missing');
    });
    expect(outcome).toEqual({
      kind: 'error',
      state: { status: 'error', errors: {}, formError: script.errors.saveFailed, values: raw },
    });
  });
});

describe('rawFromFormData', () => {
  it('폼 값을 읽고 없는 필드는 빈 문자열로 채운다', () => {
    const data = new FormData();
    data.set('name', '예준');
    data.set('amountChoice', 'custom');
    data.set('customAmount', '20000');
    expect(rawFromFormData(data)).toEqual({
      name: '예준',
      message: '',
      amountChoice: 'custom',
      customAmount: '20000',
      website: '',
    });
  });
});
