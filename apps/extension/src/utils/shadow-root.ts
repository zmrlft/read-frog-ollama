import { cn, isDarkMode } from './tailwind'

export function insertShadowRootUIWrapperInto(container: HTMLElement) {
  const wrapper = document.createElement('div')
  wrapper.className = cn(
    'text-base antialiased font-sans z-[2147483647]',
    isDarkMode() && 'dark',
  )
  container.append(wrapper)
  return wrapper
}
