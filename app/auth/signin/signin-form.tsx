'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SubmitButton } from '@/components/submit-button'
import { RelatedLink } from '@/components/related-link'

import { fetcher } from '@/lib/fetch'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: Partial<FormValues> = {
  email: '',
  password: '',
}

export function SignInForm() {
  const router = useRouter()
  const { t } = useTranslation(['translation', 'zod', 'zod-custom'])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: FormValues) {
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)

    const { error } = await fetcher('/api/v1/auth/signin', {
      method: 'POST',
      body: formData,
    })

    if (error) {
      switch (error?.i18n) {
        case 'invalid_login_credentials':
          form.setError('email', { message: t(error?.i18n) })
          form.setError('password', { message: t(error?.i18n) })
          break
        default:
          toast.error(error?.message)
          break
      }

      return false
    }

    toast.success(t('you_have_successfully_logged_in'))

    // if (data?.user) {}

    form.reset()
    router.push('/dashboard/dashboard')
  }

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  placeholder="name@example.com"
                  {...field}
                />
              </FormControl>
              {/* <FormDescription></FormDescription> */}
              <FormMessage className="font-normal" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t('password')}</FormLabel>
                <RelatedLink
                  href="/auth/forgot-password"
                  className="text-sm"
                  text="forgot_your_password"
                  translate="yes"
                />
              </div>
              <FormControl>
                <Input
                  type="password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect="off"
                  placeholder={t('password')}
                  {...field}
                />
              </FormControl>
              {/* <FormDescription></FormDescription> */}
              <FormMessage className="font-normal" />
            </FormItem>
          )}
        />
        <SubmitButton
          isSubmitting={form?.formState?.isSubmitting}
          text="sign_in"
          translate="yes"
          className="w-full"
        />
      </form>
    </Form>
  )
}
