import { describe, expect, it } from 'vitest'

import { DomainErrorType } from '@shared/errors'

import { mockWorkspaceService } from './workspaceService'

describe('mockWorkspaceService', () => {
  it('lists, creates, updates, deletes, and activates workspaces', async () => {
    const initial = await mockWorkspaceService.list()
    expect(initial.ok).toBe(true)
    expect(initial.ok ? initial.value.workspaces.length : 0).toBeGreaterThan(0)

    const created = await mockWorkspaceService.create({
      description: 'Service workspace',
      icon: 'brain',
      title: 'Service Workspace',
    })
    expect(created.ok).toBe(true)

    if (!created.ok) {
      throw new Error('Expected created workspace')
    }

    const read = await mockWorkspaceService.getById(created.value.id)
    expect(read.ok ? read.value.title : '').toBe('Service Workspace')

    const updated = await mockWorkspaceService.update(created.value.id, {
      description: 'Updated service workspace',
      icon: 'globe',
      title: 'Updated Service Workspace',
    })
    expect(updated.ok ? updated.value.title : '').toBe('Updated Service Workspace')

    await expect(mockWorkspaceService.setActiveId(created.value.id)).resolves.toEqual({
      ok: true,
      value: undefined,
    })
    await expect(mockWorkspaceService.getActiveId()).resolves.toEqual({
      ok: true,
      value: created.value.id,
    })

    const deleted = await mockWorkspaceService.delete(created.value.id)
    expect(deleted.ok).toBe(true)
  })

  it('returns not found errors for missing workspaces', async () => {
    const missingRead = await mockWorkspaceService.getById('missing-workspace')
    const missingUpdate = await mockWorkspaceService.update('missing-workspace', {
      description: 'Nope',
      icon: 'brain',
      title: 'Nope',
    })
    const missingActive = await mockWorkspaceService.setActiveId('missing-workspace')

    expect(missingRead.ok ? undefined : missingRead.error).toMatchObject({
      entity: 'workspace',
      entityId: 'missing-workspace',
      type: DomainErrorType.NotFound,
    })
    expect(missingUpdate.ok ? undefined : missingUpdate.error.type).toBe(DomainErrorType.NotFound)
    expect(missingActive.ok ? undefined : missingActive.error.type).toBe(DomainErrorType.NotFound)
  })
})
