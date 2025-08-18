import { i18n } from '#imports'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog'
import { Button } from '@repo/ui/components/button'
import { useSetAtom } from 'jotai'
import { writeConfigAtom } from '@/utils/atoms/config'
import { DEFAULT_CONFIG } from '@/utils/constants/config'
import { ConfigCard } from '../../components/config-card'

export function ResetConfig() {
  const setConfig = useSetAtom(writeConfigAtom)
  function resetToDefaultConfig() {
    setConfig(DEFAULT_CONFIG)
  }

  return (
    <ConfigCard title={i18n.t('options.config.resetConfig.title')} description={i18n.t('options.config.resetConfig.description')}>
      <AlertDialog>
        <AlertDialogTrigger className="w-full flex items-center lg:justify-end">
          <Button variant="destructive">{i18n.t('options.config.resetConfig.dialog.trigger')}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{i18n.t('options.config.resetConfig.dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {i18n.t('options.config.resetConfig.dialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t('options.config.resetConfig.dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={resetToDefaultConfig}>
              {i18n.t('options.config.resetConfig.dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfigCard>
  )
}
