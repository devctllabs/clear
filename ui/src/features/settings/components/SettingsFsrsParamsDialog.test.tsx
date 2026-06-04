import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { settingsFsrsDefaultParams } from '../utils/fsrs-params'
import { SettingsFsrsParamsDialog } from './SettingsFsrsParamsDialog'

describe('SettingsFsrsParamsDialog', () => {
  it('validates invalid JSON and wrong FSRS parameter shape', async () => {
    const user = userEvent.setup()

    render(
      <SettingsFsrsParamsDialog
        open
        value={[...settingsFsrsDefaultParams]}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Edit FSRS parameters' })
    const textarea = within(dialog).getByLabelText('FSRS Parameters JSON')
    await waitFor(() => {
      expect(textarea).toHaveFocus()
    })
    expect(textarea).toHaveClass('card-input-focus-ring')

    fireEvent.change(textarea, { target: { value: 'not json' } })
    const saveButton = within(dialog).getByRole('button', { name: 'Save' })
    expect(saveButton).toHaveClass('card-focus-ring')
    await user.click(saveButton)
    const invalidJsonAlert = await within(dialog).findByRole('alert')
    expect(invalidJsonAlert).toHaveTextContent('Paste valid JSON with 21 numeric values.')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAccessibleDescription(
      /This is an expert override\. Values must stay in order\./,
    )
    expect(textarea).toHaveAccessibleDescription(
      /Paste valid JSON with 21 numeric values\./,
    )

    fireEvent.change(textarea, { target: { value: '[1,2,3]' } })
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))
    const wrongShapeAlert = await within(dialog).findByRole('alert')
    expect(wrongShapeAlert).toHaveTextContent(
      'Enter a JSON array with exactly 21 finite numbers.',
    )
  })

  it('saves custom params, resets defaults, and cancels', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSave = vi.fn()

    render(
      <SettingsFsrsParamsDialog
        open
        value={[...settingsFsrsDefaultParams]}
        onOpenChange={onOpenChange}
        onSave={onSave}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Edit FSRS parameters' })
    const textarea = within(dialog).getByLabelText('FSRS Parameters JSON')
    const customParams = Array.from({ length: 21 }, (_, index) =>
      Number((index + 0.5).toFixed(1)),
    )

    fireEvent.change(textarea, { target: { value: JSON.stringify(customParams) } })
    await user.click(within(dialog).getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledWith(customParams)
    expect(onOpenChange).toHaveBeenCalledWith(false)

    await user.click(within(dialog).getByRole('button', { name: 'Reset to defaults' }))
    await waitFor(() => {
      expect(textarea).toHaveValue(JSON.stringify(settingsFsrsDefaultParams, null, 2))
    })

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
