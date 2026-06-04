import type { ReactNode } from 'react'

import { SectionHeading } from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'

export const SettingsSection = ({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) => (
  <section className="space-y-4">
    <SectionHeading>{title}</SectionHeading>
    <Card className="overflow-hidden rounded-card border border-border bg-card py-0 shadow-card">
      {children}
    </Card>
  </section>
)
