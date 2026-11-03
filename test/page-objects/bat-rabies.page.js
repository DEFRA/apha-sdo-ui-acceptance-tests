import { $ } from '@wdio/globals'
import { ReportPage } from './report.page.js'

class BatRabiesPage extends ReportPage {
  async get_banner_text() {
    return await $(`//h1`)
  }

  async click_report_date_change() {
    await $(`(//dl[@class='govuk-summary-list']//dd/a)[1]`).click()
  }

  async click_reporting_period_change() {
    const changeLink = await $(
      '//dt[normalize-space(.)="Reporting period"]/following-sibling::dd//a[contains(normalize-space(.),"Change")]'
    )
    await changeLink.waitForClickable({
      timeout: 10000,
      timeoutMsg:
        'Could not find the Change link for the Reporting period summary row.'
    })
    await changeLink.click()
  }
}

export default new BatRabiesPage()
