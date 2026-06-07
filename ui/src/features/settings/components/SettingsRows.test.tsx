import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  SettingsDropdownRow,
  SettingsNumberRow,
  SettingsRow,
  SettingsSliderRow,
} from './SettingsRows'

describe('SettingsRows', () => {
  it('delegates row button clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <SettingsRow
        chevron
        description="Search a city or IANA timezone"
        label="Timezone"
        value="Automatic"
        onClick={onClick}
      />,
    )

    const rowButton = screen.getByRole('button', { name: 'Timezone' })
    expect(rowButton).toHaveClass('card-focus-ring')
    expect(rowButton).toHaveClass('items-center')
    expect(screen.getByText('Automatic')).toHaveClass('type-row-title', 'line-clamp-2')
    expect(screen.getByText('Automatic').parentElement).toHaveClass(
      'min-h-10',
      'rounded-full',
      'bg-muted',
    )
    await user.click(rowButton)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders validation messages for action rows', () => {
    render(
      <SettingsRow
        description="Search a city or IANA timezone"
        label="Timezone"
        validationMessages={['Timezone is required.']}
        value="Automatic"
      />,
    )

    const rowButton = screen.getByRole('button', { name: 'Timezone' })

    expect(rowButton).toHaveAccessibleDescription('Timezone is required.')
    expect(screen.getByText('Timezone is required.')).toBeInTheDocument()
  })

  it('selects dropdown options', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <SettingsDropdownRow
        description="System preference"
        label="Language"
        options={[
          { label: 'English (US)', value: 'en-US' },
          { label: 'French', value: 'fr' },
        ]}
        value="en-US"
        onSelect={onSelect}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Language' })
    expect(trigger).toHaveClass('card-focus-ring')
    expect(screen.getByText('English (US)').parentElement).toHaveClass(
      'min-h-10',
      'rounded-full',
      'bg-muted',
    )
    await user.click(trigger)
    await user.click(await screen.findByRole('menuitem', { name: 'French' }))
    expect(onSelect).toHaveBeenCalledWith('fr')
  })

  it('updates number input values', () => {
    const onChange = vi.fn()
    const SettingsNumberRowHarness = () => {
      const [value, setValue] = useState(20)

      return (
        <SettingsNumberRow
          description="Max new cards per day"
          label="New cards per day"
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue)
            onChange(nextValue)
          }}
        />
      )
    }

    render(<SettingsNumberRowHarness />)

    const input = screen.getByRole('spinbutton', { name: 'New cards per day' })
    expect(input).toHaveClass('card-input-focus-ring')
    fireEvent.change(input, { target: { value: '42' } })

    expect(onChange).toHaveBeenLastCalledWith(42)
    expect(input).toHaveValue(42)

    fireEvent.change(input, { target: { value: '-12' } })
    expect(onChange).toHaveBeenLastCalledWith(0)
    expect(input).toHaveValue(0)
  })

  it('marks number rows invalid when validation messages exist', () => {
    render(
      <SettingsNumberRow
        description="Max new cards per day"
        label="New cards per day"
        validationMessages={['New cards per day must be at least 0.']}
        value={20}
        onChange={() => undefined}
      />,
    )

    const input = screen.getByRole('spinbutton', { name: 'New cards per day' })

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('New cards per day must be at least 0.')
  })

  it('updates slider row values', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SettingsSliderRow
        description="Minimum probability of recall"
        label="Target recall probability"
        value={90}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('spinbutton', {
      name: 'Target recall probability percentage',
    })
    expect(input).toHaveClass(
      'card-input-focus-ring',
      'h-10',
      'w-24',
      'rounded-full',
      'bg-input',
      'pr-7',
      '[appearance:textfield]',
    )
    expect(input).toHaveAttribute('aria-valuetext', '90%')
    expect(screen.getByText('%')).toHaveClass('right-4', 'z-10')
    fireEvent.change(input, { target: { value: '95' } })
    expect(onChange).toHaveBeenCalledWith(95)

    const slider = screen.getByRole('slider', { name: 'Target recall probability' })
    expect(slider).toHaveClass('card-focus-ring')
    slider.focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(91)
    })
  })

  it('clamps manually entered slider row percentages', () => {
    const onChange = vi.fn()

    render(
      <SettingsSliderRow
        description="Minimum probability of recall"
        label="Target recall probability"
        value={90}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('spinbutton', {
      name: 'Target recall probability percentage',
    })

    fireEvent.change(input, { target: { value: '120' } })
    expect(onChange).toHaveBeenLastCalledWith(100)

    fireEvent.change(input, { target: { value: '-5' } })
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('renders clamped slider values for invalid settings state', () => {
    const onChange = vi.fn()

    render(
      <SettingsSliderRow
        description="Minimum probability of recall"
        label="Target recall probability"
        value={Number.NaN}
        onChange={onChange}
      />,
    )

    const input = screen.getByRole('spinbutton', {
      name: 'Target recall probability percentage',
    })

    expect(input).toHaveValue(0)
    expect(input).toHaveAttribute('aria-valuetext', '0%')
  })
})
