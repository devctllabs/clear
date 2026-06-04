import { expect, waitFor, within } from 'storybook/test'

import {
  formatCompactLocationPath,
  formatLocationPathLabel,
} from '@shared/lib/location-path'

const overflowTolerancePx = 1
const rowAlignmentTolerancePx = 4
const centerAlignmentTolerancePx = 2
const stackAlignmentTolerancePx = 4
const stickyTolerancePx = 1
const viewportTolerancePx = 1
const elementSizeTolerancePx = 1
const mobileFooterActionSkeletonHeightPx = 58

const describeElement = (element: HTMLElement) => {
  const className = element.className.trim().replace(/\s+/g, '.')
  const selector = [element.tagName.toLowerCase(), className ? `.${className}` : ''].join('')

  return `${selector} (${element.scrollWidth}px > ${element.clientWidth}px)`
}

const hasStickyBleedDescendant = (element: HTMLElement) =>
  !element.classList.contains('sticky') && element.querySelector('.sticky') !== null

export const expectNoHorizontalOverflow = async (root: HTMLElement) => {
  const elements = [root, ...Array.from(root.querySelectorAll('*'))].filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  )

  const overflowingElements = elements
    .filter((element) => {
      if (element.getClientRects().length === 0) {
        return false
      }

      const style = window.getComputedStyle(element)

      if (style.display === 'contents') {
        return false
      }

      if (element.closest('.sr-only')) {
        return false
      }

      if (element.classList.contains('loading-shimmer')) {
        return false
      }

      if (hasStickyBleedDescendant(element)) {
        return false
      }

      if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
        return false
      }

      return element.scrollWidth - element.clientWidth > overflowTolerancePx
    })
    .map(describeElement)

  await expect(overflowingElements).toEqual([])
}

export const expectElementFullyInViewport = async (element: HTMLElement) => {
  const view = element.ownerDocument.defaultView

  if (!view) {
    throw new Error('Expected element to have an owner window')
  }

  await waitFor(() => {
    const rect = element.getBoundingClientRect()
    const overflow = {
      bottom: rect.bottom - view.innerHeight,
      left: -rect.left,
      right: rect.right - view.innerWidth,
      top: -rect.top,
    }

    if (
      overflow.top > viewportTolerancePx ||
      overflow.right > viewportTolerancePx ||
      overflow.bottom > viewportTolerancePx ||
      overflow.left > viewportTolerancePx
    ) {
      throw new Error(
        `Expected element to be fully in viewport. Overflow: top=${overflow.top}px right=${overflow.right}px bottom=${overflow.bottom}px left=${overflow.left}px`,
      )
    }
  })
}

export const setDesktopZoomRegressionViewport = async () => {
  if (import.meta.env.MODE !== 'test') {
    return false
  }

  const { page } = await import('vitest/browser')

  await page.viewport(1164, 820)

  const view = window

  await new Promise<void>((resolve) => {
    view.requestAnimationFrame(() => {
      view.requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  return true
}

export const setDesktopDetailZoomRegressionViewport = async () => {
  if (import.meta.env.MODE !== 'test') {
    return false
  }

  const { page } = await import('vitest/browser')

  await page.viewport(980, 820)

  const view = window

  await new Promise<void>((resolve) => {
    view.requestAnimationFrame(() => {
      view.requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  return true
}

export const setMobileRegressionViewport = async () => {
  if (import.meta.env.MODE !== 'test') {
    return false
  }

  const { page } = await import('vitest/browser')

  await page.viewport(390, 844)

  const view = window

  await new Promise<void>((resolve) => {
    view.requestAnimationFrame(() => {
      view.requestAnimationFrame(() => {
        resolve()
      })
    })
  })

  return true
}

export const expectMobileNoHorizontalOverflow = async (root: HTMLElement) => {
  await setMobileRegressionViewport()
  await expectNoHorizontalOverflow(root)
}

export const expectCompactLocationPath = async (
  root: HTMLElement,
  path: readonly string[],
) => {
  const label = formatLocationPathLabel(path)
  const location = await within(root).findByTitle(label)

  await expect(location).toHaveTextContent(formatCompactLocationPath(path))
  await expect(location).toHaveAttribute('aria-label', label)
  await expect(location).toHaveClass('line-clamp-2', 'text-wrap-anywhere')
  await expect(location).not.toHaveClass('truncate', '[direction:rtl]')
}

export const expectMobileFooterActionSkeletonSize = async (root: HTMLElement) => {
  await setMobileRegressionViewport()

  const skeleton = root.querySelector('[data-slot="mobile-footer-action-skeleton"]')

  if (!(skeleton instanceof HTMLElement)) {
    throw new Error('Expected a mobile footer action skeleton.')
  }

  await waitFor(() => {
    const height = skeleton.getBoundingClientRect().height

    if (Math.abs(height - mobileFooterActionSkeletonHeightPx) > elementSizeTolerancePx) {
      throw new Error(
        `Expected mobile footer action skeleton height to be ${mobileFooterActionSkeletonHeightPx}px. Received ${height}px.`,
      )
    }
  })
}

export const expectElementsShareDesktopRow = async (
  primary: HTMLElement,
  secondary: HTMLElement,
) => {
  await waitFor(() => {
    const primaryRect = primary.getBoundingClientRect()
    const secondaryRect = secondary.getBoundingClientRect()
    const topDelta = Math.abs(primaryRect.top - secondaryRect.top)

    if (topDelta > rowAlignmentTolerancePx) {
      throw new Error(
        `Expected elements to share a desktop row. Top delta: ${topDelta}px`,
      )
    }

    if (secondaryRect.left <= primaryRect.right) {
      throw new Error(
        `Expected secondary element to sit to the right. primary.right=${primaryRect.right}px secondary.left=${secondaryRect.left}px`,
      )
    }
  })
}

export const expectElementCentersAlignVertically = async (
  primary: HTMLElement,
  secondary: HTMLElement,
) => {
  await waitFor(() => {
    const primaryRect = primary.getBoundingClientRect()
    const secondaryRect = secondary.getBoundingClientRect()
    const primaryCenter = primaryRect.top + primaryRect.height / 2
    const secondaryCenter = secondaryRect.top + secondaryRect.height / 2
    const centerDelta = Math.abs(primaryCenter - secondaryCenter)

    if (centerDelta > centerAlignmentTolerancePx) {
      throw new Error(
        `Expected element centers to align vertically. Center delta: ${centerDelta}px`,
      )
    }
  })
}

export const expectElementsStackVertically = async (
  primary: HTMLElement,
  secondary: HTMLElement,
) => {
  await waitFor(() => {
    const primaryRect = primary.getBoundingClientRect()
    const secondaryRect = secondary.getBoundingClientRect()
    const leftDelta = Math.abs(primaryRect.left - secondaryRect.left)
    const widthDelta = Math.abs(primaryRect.width - secondaryRect.width)

    if (secondaryRect.top < primaryRect.bottom - stackAlignmentTolerancePx) {
      throw new Error(
        `Expected secondary element to stack below primary. primary.bottom=${primaryRect.bottom}px secondary.top=${secondaryRect.top}px`,
      )
    }

    if (leftDelta > stackAlignmentTolerancePx) {
      throw new Error(`Expected stacked elements to align left. Left delta: ${leftDelta}px`)
    }

    if (widthDelta > stackAlignmentTolerancePx) {
      throw new Error(`Expected stacked elements to share width. Width delta: ${widthDelta}px`)
    }
  })
}

export const expectButtonPendingSpinner = async (
  root: HTMLElement,
  name: RegExp | string,
) => {
  const canvas = within(root)

  await waitFor(() => {
    const button = canvas.queryByRole('button', { name })

    if (!button?.querySelector('[data-slot="pending-spinner"]')) {
      throw new Error('Pending spinner was not rendered.')
    }
  })
}

export const expectMobileLoadingShell = async (root: HTMLElement) => {
  const canvas = within(root)

  await canvas.findByRole('link', { name: 'Home' })
  await canvas.findByRole('link', { name: 'Spaces' })
  await canvas.findByRole('link', { name: 'Menu' })
  const status = await canvas.findByRole('status')

  await expect(status.closest('[class*="pb-[calc"]')).not.toBeNull()
  await expect(root.querySelector('[data-slot="mobile-floating-action-skeleton"]')).toBeNull()
  await expectNoHorizontalOverflow(root)
}

type StickySearchHeaderOptions = {
  restoreScroll?: boolean
}

const waitForScrollFrame = (view: Window) =>
  new Promise<void>((resolve) => {
    view.requestAnimationFrame(() => {
      view.requestAnimationFrame(() => {
        resolve()
      })
    })
  })

export const expectStickySearchHeader = async (
  input: HTMLElement,
  { restoreScroll = true }: StickySearchHeaderOptions = {},
) => {
  const view = input.ownerDocument.defaultView

  if (!view) {
    throw new Error('Expected Storybook canvas to have a window')
  }

  const stickyElement = input.closest('.sticky')

  if (!(stickyElement instanceof view.HTMLElement)) {
    throw new Error('Expected search input to be inside a sticky wrapper')
  }

  const scrollingElement = input.ownerDocument.scrollingElement

  if (!scrollingElement) {
    throw new Error('Expected Storybook canvas to have a scrolling element')
  }

  view.scrollTo(0, 0)
  await waitForScrollFrame(view)

  const stickyAbsoluteTop = stickyElement.getBoundingClientRect().top + view.scrollY
  const maxScrollY = Math.max(0, scrollingElement.scrollHeight - view.innerHeight)

  await expect(maxScrollY).toBeGreaterThan(stickyAbsoluteTop)

  view.scrollTo(0, Math.min(maxScrollY, stickyAbsoluteTop + 48))
  await waitForScrollFrame(view)

  await expect(Math.abs(stickyElement.getBoundingClientRect().top)).toBeLessThanOrEqual(
    stickyTolerancePx,
  )

  if (restoreScroll) {
    view.scrollTo(0, 0)
    await waitForScrollFrame(view)
  }
}

export const expectStickySearchHeaderIfPresent = async (
  input: HTMLElement,
  options: StickySearchHeaderOptions = {},
) => {
  if (!input.closest('.sticky')) {
    return
  }

  await expectStickySearchHeader(input, options)
}
