import { auth } from '@repo/auth'
import { Button } from '@repo/ui/components/button'
import { headers } from 'next/headers'
import Link from 'next/link'
import { UserAvatar } from './user-avatar'

export async function UserAccount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return <LoginButton />
  }

  return (
    <UserAvatar user={session.user} />
  )
}

export function LoginButton() {
  return (
    <Button className="mx-2 bg-black dark:bg-white text-white dark:text-black shadow-xs hover:bg-black/90 dark:hover:bg-white/90" asChild>
      <Link href="/log-in">Log in</Link>
    </Button>
  )
}
