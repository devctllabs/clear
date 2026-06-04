// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import { Hono } from 'hono'
import { cors } from 'hono/cors'

import {
  newMemoryMockApiControllers,
  type MockApiControllers,
} from './controllers.ts'
import { generatedMockRuntime as adminRuntime } from './generated/mock-admin/mock-runtime.ts'
import { generatedMockRuntime as clearWebApiRuntime } from './generated/clear-web-api/mock-runtime.ts'
import { notFound } from './lib/errors.ts'
import {
  mockJsonResponse,
  registerGeneratedMockRoutes,
} from './lib/honoMockRuntime.ts'

export type NewMockApiAppOptions = {
  basePath?: string
  controllers?: MockApiControllers
}

export const newMockApiApp = ({
  basePath = "/api/v1",
  controllers = newMemoryMockApiControllers(),
}: NewMockApiAppOptions = {}) => {
  const app = new Hono()

  app.use('*', cors())
  registerGeneratedMockRoutes(app, {
    controllers,
    runtime: adminRuntime,
  })
  registerGeneratedMockRoutes(app, {
    basePath: basePath,
    controllers,
    runtime: clearWebApiRuntime,
  })

  app.notFound(() => {
    const routeError = notFound('route', 'request')

    return mockJsonResponse(routeError.body, routeError.status)
  })

  return app
}
