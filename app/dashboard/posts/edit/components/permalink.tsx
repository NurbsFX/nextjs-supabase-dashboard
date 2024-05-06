'use client'

import * as React from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { UseFormReturn } from 'react-hook-form'
import { FormValues } from '../post-form'

import { getPostUrl } from '@/lib/utils'
import { Post } from '@/types/database'

interface PermalinkProps {
  form: UseFormReturn<FormValues>
  post: Post | null
}

const Permalink = (props: PermalinkProps) => {
  const { form, post } = props
  const { t } = useTranslation()
  const [permalink, setPermalink] = React.useState<string>('')

  const slug = form.watch('slug')

  React.useEffect(() => {
    let url: string | null = null
    if (post) url = getPostUrl(post, slug)
    if (url) setPermalink(url)
  }, [post, slug])

  return (
    <div className="text-sm">
      {`${t('PostMetabox.permalink')}: `}
      <Link
        href={permalink ?? '#'}
        className="text-blue-700 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {decodeURIComponent(permalink)}
      </Link>
    </div>
  )
}

export { Permalink, type PermalinkProps }