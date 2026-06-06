import {
  newBrowserMockStateStore,
  newMockApiDependencies,
} from '@local/mock-server/browser'

export const mockStorageKey = 'clear-ui:mock-server-state:v1'

export const mockStateRepository = await newBrowserMockStateStore({
  storageKey: mockStorageKey,
})

export const mockApi = newMockApiDependencies(mockStateRepository)
