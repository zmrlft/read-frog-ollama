import type { NavItem } from './nav-items'
import { i18n } from '#imports'
import { Icon } from '@iconify/react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@repo/ui/components/sidebar'
import { cn } from '@repo/ui/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation } from 'react-router'
import readFrogLogo from '@/assets/icons/read-frog.png'
import { getLastViewedBlogDate, getLatestBlogDate, hasNewBlogPost, saveLastViewedBlogDate } from '@/utils/blog'
import { WEBSITE_URL } from '@/utils/constants/url'
import { version } from '../../../../package.json'
import { AnimatedIndicator } from './animated-indicator'
import { PRODUCT_NAV_ITEMS, SETTING_NAV_ITEMS } from './nav-items'

function renderNavItem(
  key: string,
  item: NavItem,
  currentPath: string,
  open: boolean,
  action: boolean = false,
  onClick?: () => void,
) {
  const title = i18n.t(`options.${item.title}.title`)

  switch (item.type) {
    case 'external':
      return (
        <SidebarMenuItem key={key} className="relative">
          <SidebarMenuButton
            asChild
            className={cn(action && 'text-primary font-semibold hover:text-primary active:text-primary')}
          >
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClick}
            >
              <Icon icon={item.icon} />
              <span>{title}</span>
            </a>
          </SidebarMenuButton>
          <AnimatedIndicator show={action && open} />
        </SidebarMenuItem>
      )

    case 'component':
      return (
        <SidebarMenuItem key={key} className="relative">
          <SidebarMenuButton
            asChild
            className={cn(action && 'text-primary font-semibold hover:text-primary')}
            isActive={currentPath === item.url}
          >
            <Link to={item.url} onClick={onClick}>
              <Icon icon={item.icon} />
              <span>{title}</span>
            </Link>
          </SidebarMenuButton>
          <AnimatedIndicator show={action && open} />
        </SidebarMenuItem>
      )
  }
}

export function AppSidebar() {
  const location = useLocation()
  const { open } = useSidebar()
  const queryClient = useQueryClient()

  const { data: lastViewedDate } = useQuery({
    queryKey: ['last-viewed-blog-date'],
    queryFn: getLastViewedBlogDate,
  })

  const { data: latestBlogDate } = useQuery({
    queryKey: ['latest-blog-date'],
    queryFn: () => getLatestBlogDate(`${WEBSITE_URL}/api/blog/latest`, 'en'),
  })

  const handleWhatsNewClick = async () => {
    if (latestBlogDate) {
      await saveLastViewedBlogDate(latestBlogDate)
      await queryClient.invalidateQueries({ queryKey: ['last-viewed-blog-date'] })
    }
  }

  const showIndicator = hasNewBlogPost(lastViewedDate ?? null, latestBlogDate ?? null)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group-data-[state=expanded]:px-5 group-data-[state=expanded]:pt-4 transition-all">
        <a href="https://readfrog.app" className="flex items-center gap-2">
          <img src={readFrogLogo} alt="Logo" className="h-8 w-8 shrink-0" />
          <span className="text-md font-bold overflow-hidden truncate">{i18n.t('name')}</span>
          <span className="text-xs text-muted-foreground overflow-hidden truncate">
            {`v${version}`}
          </span>
        </a>
      </SidebarHeader>
      <SidebarContent className="group-data-[state=expanded]:px-2 transition-all">
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(SETTING_NAV_ITEMS).map(([key, item]) =>
                renderNavItem(key, item, location.pathname, open),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Product</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Object.entries(PRODUCT_NAV_ITEMS).map(([key, item]) =>
                renderNavItem(
                  key,
                  item,
                  location.pathname,
                  open,
                  key === 'whats-new' && showIndicator,
                  key === 'whats-new' ? handleWhatsNewClick : undefined,
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
