import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiError, revalidatePaths } from '@/lib/utils'
import { authorize } from '@/queries/async'

import { transporter, sender } from '@/lib/nodemailer'
import { jwtSign } from '@/lib/jsonwebtoken'
import { VerifyTokenPayload } from '@/types/token'

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const uid = searchParams.get('uid') as string

  const { formData, options } = await request.json()
  const { user } = await authorize(uid)

  if (!user) {
    return NextResponse.json(
      { data: null, error: new ApiError(401) },
      { status: 401 }
    )
  }

  const payload: VerifyTokenPayload = { email: formData?.email, user_id: uid }
  const mailOptions = mailTemplate(payload)

  try {
    const info = await transporter.sendMail(mailOptions)
    const revalidated = revalidatePaths(options?.revalidatePaths)

    return NextResponse.json({
      data: info,
      error: null,
      revalidated,
      now: Date.now(),
    })
  } catch (e: unknown) {
    return NextResponse.json(
      { data: null, error: new ApiError(400, (e as Error)?.message) },
      { status: 400 }
    )
  }
}

function mailTemplate(payload: VerifyTokenPayload) {
  const url = generate_url(payload)

  return {
    from: `"${sender?.name}" <${sender?.email}>`,
    to: payload?.email,
    subject: 'Email Verification',
    html: `
      <div>
        <h2>Verify Link</h2>
        <p>Click the link below to verify your email:</p>
        <p><a href="${url}">Verify email address</a></p>
      </div>
    `,
  }
}

function generate_url(payload: string | object | Buffer) {
  const token_hash = jwtSign(payload, { expiresIn: '10m' })
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL!)
  url.pathname = '/api/verify/email'
  url.searchParams.set('token_hash', token_hash)
  url.searchParams.set('next', '/dashboard/settings/emails')

  return url.toString()
}