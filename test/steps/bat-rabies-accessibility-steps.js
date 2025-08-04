import { Given, BeforeAll, AfterAll } from '@wdio/cucumber-framework'
import HomePage from '../page-objects/home.page'
import BatRabiesPage from '../page-objects/bat-rabies.page'
import { browser, expect } from '~/node_modules/@wdio/globals/build/index'
import {
  initialiseAccessibilityChecking,
  analyseAccessibility,
  generateAccessibilityReports,
  generateAccessibilityReportIndex
} from '../utils/accessibility-checking.js'

BeforeAll({ tags: '@accessibility' }, async function () {
  await initialiseAccessibilityChecking()
})

AfterAll({ tags: '@accessibility' }, async function () {
  generateAccessibilityReports('APHA SDO')
  generateAccessibilityReportIndex()
})

Given('check APHA SDO Frontend for accessiblity issues', async () => {
  await HomePage.open()
  await expect(browser).toHaveTitle(
    'Home | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()

  await HomePage.click_href_by_text(
    'Continue to Surveillance data submission portal'
  )
  await expect(browser).toHaveTitle(
    'Sign In | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()

  await HomePage.click_href_by_text('Sign in with DEFRA ID')
  await expect(browser).toHaveTitle(
    'Submission Portal | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()

  await HomePage.click_bat_rabies_service()
  await expect(browser).toHaveTitle(
    'Bat Rabies Submission Form | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()

  await BatRabiesPage.enter_report_date()
  await expect(browser).toHaveTitle(
    'Bat Rabies Submission Form | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()

  await BatRabiesPage.click_button_by_text('Continue')
  await expect(browser).toHaveTitle(
    'Check your answers | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()

  await BatRabiesPage.click_button_by_text('Send')
  await expect(browser).toHaveTitle(
    'Form submitted | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()
})

Given('check APHD SDO Contact screen for accessiblity issues', async () => {
  await HomePage.open()
  await expect(browser).toHaveTitle(
    'Home | APHA Surveillance data submission portal'
  )
  await analyseAccessibility()

  const contactLink = await HomePage.is_link('Contact')
  contactLink.click()
  await expect(browser).toHaveUrl(expect.stringContaining('contact'))
  await analyseAccessibility()
})
