import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu'

const MENU_ITEMS = [
  {
    key: 'joinDiscord',
    icon: 'tabler:brand-discord',
    url: 'https://discord.gg/ej45e3PezJ',
  },
  {
    key: 'joinWechat',
    icon: 'tabler:brand-wechat',
    url: 'https://github.com/mengxi-ream/read-frog/blob/main/assets/wechat-account.jpg',
  },
  {
    key: 'starGithub',
    icon: 'tabler:brand-github',
    url: 'https://github.com/mengxi-ream/read-frog',
  },
  {
    key: 'ebook',
    icon: 'tabler:book',
    url: 'https://www.neat-reader.com/webapp#/',
  },
  {
    key: 'tutorial',
    icon: 'tabler:help-circle',
    url: 'https://readfrog.app/tutorial/',
  },
] as const

export function MoreMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 hover:bg-neutral-300 dark:hover:bg-neutral-700"
        >
          <Icon icon="tabler:dots" className="size-4" strokeWidth={1.6} />
          <span className="text-[13px] font-medium">{i18n.t('popup.more.title')}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top">
        {MENU_ITEMS.map(item => (
          <DropdownMenuItem
            key={item.key}
            onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
            className="cursor-pointer"
          >
            <Icon icon={item.icon} className="size-4" strokeWidth={1.6} />
            {i18n.t(`popup.more.${item.key}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
