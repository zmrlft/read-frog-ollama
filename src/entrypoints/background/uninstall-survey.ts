import { browser, i18n } from '#imports'

export async function setupUninstallSurvey() {
  const surveyUrl = i18n.t('uninstallSurveyUrl')
  void browser.runtime.setUninstallURL(surveyUrl)
}
