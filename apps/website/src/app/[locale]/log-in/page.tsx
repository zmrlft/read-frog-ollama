'use client'

import Image from 'next/image'
import { authClient } from '@/lib/auth-client'

export default function LogInPage() {
  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    }
    catch (error) {
      console.error('Google login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Read Frog"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Read Frog</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <Image
              src="/icons/google.png"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
