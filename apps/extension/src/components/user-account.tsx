import guest from '@/assets/icons/avatars/guest.png'
import { authClient } from '@/utils/auth/auth-client'
import { WEBSITE_URL } from '@/utils/constants/url'
import { Button } from './ui/button'

export function UserAccount() {
  const { data, isPending } = authClient.useSession()
  return (
    <div className="flex items-center gap-2">
      <img src={data?.user.image ?? guest} alt="User" className="rounded-full border size-6" />
      {isPending ? 'Loading...' : data?.user.name ?? 'Guest'}
      {!isPending && !data && (
        <Button
          size="sm"
          variant="outline"
          className="h-5 rounded-sm"
          onClick={() =>
            window.open(`${WEBSITE_URL}/log-in`, '_blank')}
        >
          Log in
        </Button>
      )}
    </div>
  )
}
