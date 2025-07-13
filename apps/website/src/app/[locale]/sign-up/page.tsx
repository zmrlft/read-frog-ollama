'use client'

import { authClient } from '@/lib/auth-client'

export default function SignUpPage() {
  const session = authClient.useSession()
  const handleSignUp = () => {
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)
    const dynamicName = `user_${timestamp}_${randomNum}`
    const dynamicEmail = `test_${timestamp}_${randomNum}@test.com`

    authClient.signUp.email({
      name: dynamicName,
      email: dynamicEmail,
      password: '12345678',
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignUp}
      >
        Sign Up
      </button>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}
