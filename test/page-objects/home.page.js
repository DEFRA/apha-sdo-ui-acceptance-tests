import { Page } from './page.js'
import { $, browser, expect } from '@wdio/globals'

class HomePage extends Page {
  async open() {
    return super.open('/')
  }

  async sign_in_SDO_portal() {
    await $('.govuk-button--start').click()
  }

  async sign_in_with_DefraSingleSignOn() {
    await $('input[name="authProvider"][value="defraId"]').click()
    await this.click_button_by_text('Sign in')
  }

  async select_bat_rabies_report() {
    await $('input[name="submissionAction"][value="bat-rabies"]').click()
    await this.click_button_by_text('Continue')
  }

  async select_animal_health_regulations_report() {
    await $(
      'input[name="submissionAction"][value="animal-health-regulations"]'
    ).click()
    await this.click_button_by_text('Continue')
  }

  async select_update_diagnostic_tests() {
    await $(
      'input[name="submissionAction"][value="update-diagnostic-tests"]'
    ).click()
    await this.click_button_by_text('Continue')
  }

  async is_animal_health_regulations_report_available() {
    const ahrOption = await $(
      '//label[contains(normalize-space(.), "Submit an Animal Health Regulations report")]'
    )

    return await ahrOption.isExisting()
  }

  async choose_file_upload_method() {
    await $('input[name="reportMethod"][value="file-upload"]').click()
    await this.click_button_by_text('Continue')
  }

  async choose_web_form_method() {
    await $('input[name="reportMethod"][value="web-form"]').click()
    await this.click_button_by_text('Continue')

    const startNewReportButton = await $('button=Start a new report')
    await browser.waitUntil(
      async () =>
        (await browser.getUrl()).includes(
          '/animal-health-regulations-web-form/what-month-does-your-report-cover'
        ) || (await startNewReportButton.isDisplayed()),
      {
        timeoutMsg:
          'The AHR web form did not open or offer to restart its saved report'
      }
    )

    if (await startNewReportButton.isDisplayed()) {
      await this.click_button_by_text('Start a new report')
    }

    await expect(browser).toHaveUrl(
      expect.stringContaining(
        '/animal-health-regulations-web-form/what-month-does-your-report-cover'
      )
    )
  }

  async sign_out() {
    await this.click_button_by_text('Sign out')
  }

  async sign_in_again() {
    await this.click_href_by_text('Sign in again')
    await this.sign_in_with_DefraSingleSignOn()
  }
}

export default new HomePage()
