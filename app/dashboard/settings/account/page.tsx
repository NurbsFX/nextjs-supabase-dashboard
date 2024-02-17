import * as React from 'react'

import { Separator } from '@/components/ui/separator'
import { Title } from '@/components/title'

import { AccountForm } from './account-form'

export default function AccountPage() {
  return (
    <main className="flex-1 overflow-auto p-10 pb-16">
      <div className="space-y-16">
        <div className="space-y-4">
          <Title text="Account" translate="yes" />
          <Separator />
          <AccountForm />
        </div>
      </div>
    </main>
  )
}
