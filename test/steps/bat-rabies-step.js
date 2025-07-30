import { Given, Then, When } from '@wdio/cucumber-framework'
import HomePage from '../page-objects/home.page'
import BatRabiesPage from '../page-objects/bat-rabies.page'
import { getMonthName } from '../utils/date-utils'
import { browser, expect } from '~/node_modules/@wdio/globals/build/index'

Given('the User access APHA SDO portal', async () => {
  await HomePage.open()
  const contactLink = await HomePage.is_link('Contact')
  await expect(contactLink).toBeDisplayed()

  const aphaDashboard = await HomePage.is_link_present(`APHA's dashboards`)
  await expect(aphaDashboard).toBe(true)

  await expect(browser).toHaveTitle(
    'Home | APHA Surveillance data submission portal'
  )
})

Given('the User login to SDO', async () => {
  await HomePage.click_href_by_text(
    'Continue to Surveillance data submission portal'
  )
  await expect(browser).toHaveTitle(
    'Sign In | APHA Surveillance data submission portal'
  )
})

When('the User sign in with Defra ID', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('oidc-signin'))
  await HomePage.click_href_by_text('Sign in with DEFRA ID')
  await expect(browser).toHaveTitle(
    'Submission Portal | APHA Surveillance data submission portal'
  )
})

Then('the User selects Bat Rabies Surveillance Report', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('portal'))
  const contactLink = await HomePage.is_link('Contact')
  await expect(contactLink).toBeDisplayed()
  await HomePage.click_bat_rabies_service()
  await expect(browser).toHaveTitle(
    'Bat Rabies Submission Form | APHA Surveillance data submission portal'
  )
})

When('the User inputs the report date of sample collection', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('sample-details'))
  await BatRabiesPage.enter_report_date()
  await expect(browser).toHaveTitle(
    'Bat Rabies Submission Form | APHA Surveillance data submission portal'
  )
})

When('the User upload the Surveillance sample collection file', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('file-upload'))
  await BatRabiesPage.click_button_by_text('Continue')
  await expect(browser).toHaveTitle(
    'Check your answers | APHA Surveillance data submission portal'
  )
})

Then('application displays the screen to check given information', async () => {
  const reportDate = await BatRabiesPage.get_report_date()
  const month = getMonthName()
  await expect(reportDate).toHaveText(expect.stringContaining(month))
})
When('the User confirms the information', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('summary'))
  await BatRabiesPage.click_button_by_text('Send')
  await expect(browser).toHaveTitle(
    'Form submitted | APHA Surveillance data submission portal'
  )
})

Then('{string} banner should display', async (bannerTitle) => {
  await expect(browser).toHaveUrl(expect.stringContaining('status'))
  const getH1Text = await BatRabiesPage.get_banner_text()
  await expect(getH1Text).toHaveText(bannerTitle)
})

When('the User cicks Contact link', async () => {
  const contactLink = await HomePage.is_link('Contact')
  contactLink.click()
})

When('the User cicks APHA Dashboard link', async () => {
  const contactLink = await HomePage.is_link(`APHA's dashboard`)
  contactLink.click()
})

Then('application should redirects to contact screen', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('contact'))
})

When('the User decides to change report year as {string}', async (year) => {
  await BatRabiesPage.click_report_date_change()
  await expect(browser).toHaveUrl(
    expect.stringContaining('sample-details?returnUrl=%2Fbat-rabies%2Fsummary')
  )
  await BatRabiesPage.enter_report_date(year)
})

Then(
  'application displays the screen with updated year as {string}',
  async (year) => {
    const reportDate = await BatRabiesPage.get_report_date()
    await expect(reportDate).toHaveText(expect.stringContaining(year))
  }
)

Then('application shoudl redirects to Dashboard screen', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      'view-apha-surveillance-reports-publications-and-data'
    )
  )
})
