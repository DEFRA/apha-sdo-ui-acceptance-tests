import { $, $$, browser, expect } from '@wdio/globals'
import { Page } from './page.js'

export function getLaboratoryDetail(name) {
  const environments =
    process.env.ENVIRONMENT?.toLowerCase() === 'test'
      ? ['TEST', 'DEV']
      : ['DEV']

  for (const environment of environments) {
    const value = process.env[`${environment}_LAB_${name}`]
    if (value) {
      return value
    }

    const encodedValue = process.env[`${environment}_LAB_${name}_BASE64`]
    if (encodedValue) {
      const decodedValue = Buffer.from(encodedValue, 'base64').toString('utf8')
      if (
        !decodedValue ||
        Buffer.from(decodedValue, 'utf8').toString('base64') !== encodedValue
      ) {
        throw new Error(
          `The ${environment}_LAB_${name}_BASE64 secret must contain a Base64-encoded UTF-8 value`
        )
      }

      return decodedValue
    }
  }
}

class DiagnosticTestsPage extends Page {
  async open_mycoplasma_tests() {
    const mycoplasmaSection = await $(
      '//button[contains(normalize-space(.), "Mycoplasma gallisepticum / M. meleagridis")]'
    )

    await mycoplasmaSection.waitForDisplayed()

    if ((await mycoplasmaSection.getAttribute('aria-expanded')) !== 'true') {
      await mycoplasmaSection.click()
    }
  }

  async select_mycoplasma_pcr() {
    await this.open_mycoplasma_tests()
    const pcrCheckbox = await $('#test-mycoplasma-pcr')
    await pcrCheckbox.waitForDisplayed()

    if (!(await pcrCheckbox.isSelected())) {
      await pcrCheckbox.click()
    }
  }

  async define_mycoplasma_pcr_as_accredited() {
    await this.select_mycoplasma_pcr()
    await $('#accreditation-mycoplasma-pcr').selectByVisibleText('Yes')
    await this.click_button_by_text('Continue')
  }

  async complete_laboratory_details_if_required() {
    await browser.waitUntil(
      async () =>
        ['Laboratory details', 'Define your qualifying tests in use'].includes(
          await this.pageHeading.getText()
        ),
      {
        timeout: 30000,
        timeoutMsg:
          'AHR diagnostic-test setup did not open laboratory details or qualifying tests'
      }
    )

    if ((await this.pageHeading.getText()) !== 'Laboratory details') {
      return
    }

    const requiredDetails = [
      ['Address line 1', getLaboratoryDetail('ADDRESS_LINE_1')],
      ['Town or city', getLaboratoryDetail('TOWN')],
      ['Postcode', getLaboratoryDetail('POSTCODE')]
    ]
    const missingDetails = requiredDetails
      .filter(([, value]) => !value)
      .map(([label]) => label)

    if (missingDetails.length > 0) {
      throw new Error(
        'Set the required laboratory details in .env.ahr for local runs or configure the matching TEST_LAB_*_BASE64 secrets in CDP'
      )
    }

    const details = [
      ...requiredDetails,
      ['Address line 2 (optional)', getLaboratoryDetail('ADDRESS_LINE_2')]
    ]

    for (const [labelText, value] of details) {
      if (!value) {
        continue
      }

      const label = await $(`//label[normalize-space(.)="${labelText}"]`)
      const inputId = await label.getAttribute('for')

      if (!inputId) {
        throw new Error(`Could not find the form field for "${labelText}"`)
      }

      await $(`#${inputId}`).setValue(value)
    }

    await this.click_button_by_text('Continue')
    await expect(this.pageHeading).toHaveText(
      'Define your qualifying tests in use'
    )
  }

  async select_mycoplasma_pcr_without_accreditation() {
    await this.clear_diagnostic_test_selections()
    await this.select_mycoplasma_pcr()
    await $('#accreditation-mycoplasma-pcr').selectByVisibleText('Select')
    await this.click_button_by_text('Continue')
  }

  async continue_without_selecting_diagnostic_tests() {
    await this.clear_diagnostic_test_selections()
    await this.click_button_by_text('Continue')
  }

  async clear_diagnostic_test_selections() {
    const checkboxes = await $$('input[type="checkbox"][id^="test-"]')

    for (const checkbox of checkboxes) {
      if (await checkbox.isSelected()) {
        await checkbox.click()
      }
    }
  }

  async return_to_submission_welcome() {
    await this.click_href_by_text('Return to Submission Welcome')
  }
}

export default new DiagnosticTestsPage()
