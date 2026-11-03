import { fileURLToPath } from 'node:url'
import { browser, $, expect } from '@wdio/globals'
import { Page } from './page.js'

export class ReportPage extends Page {
  async clear_report_date() {
    await $('#reportDate__month').clearValue()
    await $('#reportDate__year').clearValue()
  }

  async enter_report_date(year = 2025, month = 5) {
    await $('#reportDate__month').setValue(month)
    await $('#reportDate__year').setValue(year)
    await $('.govuk-button').click()
  }

  async upload_report_file(fixtureName = 'bat-rabies-test2025-05.xlsx') {
    const filePath = fileURLToPath(
      new URL(`../fixtures/${fixtureName}`, import.meta.url)
    )
    const remoteFilePath = await browser.uploadFile(filePath)

    await browser.execute(() => {
      const input = document.querySelector('input[type="file"]')

      if (!input) {
        throw new Error('File upload input was not found')
      }

      input.hidden = false
      input.removeAttribute('aria-hidden')
      input.removeAttribute('tabindex')
    })

    const fileInput = await $('input[type="file"]')
    await fileInput.setValue(remoteFilePath)

    const uploadedFiles = await $('#uploadedFilesContainer')
    await browser.waitUntil(
      async () => {
        const uploadedFilesText = await uploadedFiles.getText()

        return (
          uploadedFilesText.includes(fixtureName) &&
          !/uploading/i.test(uploadedFilesText)
        )
      },
      {
        timeout: 120000,
        interval: 1000,
        timeoutMsg: `Report file ${fixtureName} did not finish uploading`
      }
    )
  }

  async request_report_file_removal() {
    this.uploadPageUrl = await browser.getUrl()
    await this.click_href_by_text('Remove')
    await browser.waitUntil(
      async () => (await browser.getUrl()) !== this.uploadPageUrl,
      {
        timeoutMsg: 'File removal confirmation page did not open'
      }
    )
    await expect(this.pageHeading).toHaveText(
      expect.stringContaining('Are you sure you want to remove this file?')
    )
  }

  async confirm_report_file_removal(fixtureName) {
    await this.click_button_by_text('Remove file')
    await browser.waitUntil(
      async () => (await browser.getUrl()) === this.uploadPageUrl,
      { timeoutMsg: 'File upload page did not reopen after file removal' }
    )

    const uploadedFiles = await $('#uploadedFilesContainer')
    await expect(uploadedFiles).toHaveText(
      expect.stringContaining('0 files uploaded')
    )
    await expect(uploadedFiles).not.toHaveText(
      expect.stringContaining(fixtureName)
    )
  }

  async get_report_date() {
    return await $(
      '//dt[normalize-space(.)="Reporting period"]/following-sibling::dd[1]'
    )
  }
}

export default new ReportPage()
