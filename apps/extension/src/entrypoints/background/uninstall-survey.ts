import { browser, i18n } from '#imports'

export async function setupUninstallSurvey() {
  const surveyUrl = i18n.t('uninstallSurveyUrl')
  browser.runtime.setUninstallURL(surveyUrl)
}
