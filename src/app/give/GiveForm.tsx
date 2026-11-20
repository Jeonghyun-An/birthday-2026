'use client';

import { useActionState, useState } from 'react';
import { script } from '@/config/script';
import { formatWon } from '@/lib/format';
import { MESSAGE_MAX, NAME_MAX } from '@/lib/validation';
import { submitContribution } from './actions';
import { initialGiveFormState } from './submit';

const DEFAULT_CHOICE = String(script.presets[1].amount);

export function GiveForm() {
  const [state, formAction, pending] = useActionState(submitContribution, initialGiveFormState);
  const values = state.status === 'error' ? state.values : null;
  const errors = state.status === 'error' ? state.errors : {};
  const initialChoice = values?.amountChoice || DEFAULT_CHOICE;
  const [choice, setChoice] = useState(initialChoice);

  return (
    <form action={formAction} className="space-y-6">
      {state.status === 'error' && state.formError && (
        <p role="alert" className="rounded-xl bg-white px-4 py-3 text-rose-deep">
          {state.formError}
        </p>
      )}

      <div>
        <label htmlFor="name" className="label">
          {script.give.nameLabel}
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={NAME_MAX}
          autoComplete="nickname"
          defaultValue={values?.name ?? ''}
          placeholder={script.give.namePlaceholder}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="field"
        />
        {errors.name && (
          <p id="name-error" role="alert" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="label">
          {script.give.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={MESSAGE_MAX}
          defaultValue={values?.message ?? ''}
          placeholder={script.give.messagePlaceholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="field resize-none"
        />
        {errors.message && (
          <p id="message-error" role="alert" className="field-error">
            {errors.message}
          </p>
        )}
      </div>

      <fieldset aria-describedby={errors.amount ? 'amount-error' : undefined}>
        <legend className="label">{script.give.amountLabel}</legend>
        <div className="space-y-2">
          {script.presets.map((preset) => {
            const value = String(preset.amount);
            return (
              <label key={value} className="option">
                <input
                  type="radio"
                  name="amountChoice"
                  value={value}
                  required
                  defaultChecked={initialChoice === value}
                  onChange={() => setChoice(value)}
                  className="accent-rose"
                />
                <span className="flex-1">{preset.label}</span>
                <span className="text-ink-soft">{formatWon(preset.amount)}</span>
              </label>
            );
          })}
          <label className="option">
            <input
              type="radio"
              name="amountChoice"
              value="custom"
              defaultChecked={initialChoice === 'custom'}
              onChange={() => setChoice('custom')}
              className="accent-rose"
            />
            <span className="flex-1">{script.give.customAmountLabel}</span>
          </label>
          {choice === 'custom' && (
            <input
              name="customAmount"
              inputMode="numeric"
              pattern="[0-9,]*"
              required
              defaultValue={values?.customAmount ?? ''}
              placeholder={script.give.customAmountPlaceholder}
              aria-label={script.give.customAmountLabel}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              className="field"
            />
          )}
        </div>
        {errors.amount && (
          <p id="amount-error" role="alert" className="field-error">
            {errors.amount}
          </p>
        )}
      </fieldset>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          이 칸은 비워 두세요
          <input name="hp_extra" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-royal w-full">
        {pending ? script.give.submitting : script.give.submit}
      </button>
      <p className="notice">{script.give.note}</p>
    </form>
  );
}
