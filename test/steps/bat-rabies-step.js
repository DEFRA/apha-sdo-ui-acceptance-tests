import { Given, Then, When } from '@wdio/cucumber-framework'
import HomePage from '../page-objects/home.page'
import BatRabiesPage from '../page-objects/bat-rabies.page'
import { getCurrentMonth, getMonthName } from '../utils/date-utils'
import { browser, expect } from '~/node_modules/@wdio/globals/build/index'

Given('the User access APHA SDO portal', async () => {
  await HomePage.open()
  const contactLink = await HomePage.is_link('Contact')
  await expect(contactLink).toBeDisplayed()

  const aphaDashboard = await HomePage.is_link_present(`APHA's dashboards`)
  await expect(aphaDashboard).toBe(true)

  await expect(browser).toHaveTitle('Home | APHA SDO')
})

Given('the User login to SDO', async () => {
  await HomePage.sign_in_SDO_portal()
  await expect(browser).toHaveTitle('Sign In | APHA SDO')
})

When('the User sign in with Defra ID', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('oidc-signin'))
  await HomePage.sign_in_with_DefraId()
  await expect(browser).toHaveTitle('Submission Portal | APHA SDO')
})

Then('the User selects Bat Rabies Surveillance Report', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('portal'))
  const contactLink = await HomePage.is_link('Contact')
  await expect(contactLink).toBeDisplayed()
  await HomePage.click_bat_rabies_service()
  await expect(browser).toHaveTitle('Sample details | APHA SDO')
})

When('the User inputs the receipt date of sample collection', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('sample-details'))
  await BatRabiesPage.enter_receipt_date()
  await expect(browser).toHaveTitle('Upload documentation | APHA SDO')
})

When('the User upload the Surveillance sample collection file', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('file-upload'))
  await BatRabiesPage.click_button_by_text('Continue')
  await expect(browser).toHaveTitle('Check your answers | APHA SDO')
})

Then('application displays the screen to check given information', async () => {
  const receiptDate = await BatRabiesPage.get_receipt_date()
  const month = getMonthName()
  await expect(receiptDate).toHaveText(expect.stringContaining(month))
})
When('the User confirms the information', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('summary'))
  await BatRabiesPage.click_button_by_text('Send')
  await expect(browser).toHaveTitle('Form submitted | APHA SDO')
})

Then('{string} banner should display', async (bannerTitle) => {
  await expect(browser).toHaveUrl(expect.stringContaining('status'))
  const getH1Text = await BatRabiesPage.get_banner_text()
  await expect(getH1Text).toHaveText(bannerTitle)
})

When('the User cicks Contact link', async () => {
  const contactLink = await HomePage.is_link('Contact')
  contactLink.click()
  await expect(browser).toHaveUrl(expect.stringContaining('contact'))
})

When('the User cicks APHA Dashboard link', async () => {
  const contactLink = await HomePage.is_link(`APHA's dashboard`)
  contactLink.click()
})

Then('application should redirects to contact screen', async () => {
  const contactLink = await HomePage.is_link('Access SDO portal')
  await expect(contactLink).toBeDisplayed()
})

When('the User decides to change receipt year as {string}', async (year) => {
  await BatRabiesPage.click_receipt_date_change()
  await expect(browser).toHaveUrl(
    expect.stringContaining('sample-details?returnUrl=%2Fbat-rabies%2Fsummary')
  )
  await BatRabiesPage.enter_receipt_date(year)
})

Then(
  'application displays the screen with updated year as {string}',
  async (year) => {
    const receiptDate = await BatRabiesPage.get_receipt_date()
    await expect(receiptDate).toHaveText(expect.stringContaining(year))
  }
)

Then('application shoudl redirects to Dashboard screen', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      'view-apha-surveillance-reports-publications-and-data'
    )
  )
})
