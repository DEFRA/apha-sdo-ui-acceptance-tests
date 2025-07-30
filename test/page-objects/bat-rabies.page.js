import { Page } from 'page-objects/page'
import { getCurrentMonth } from '../utils/date-utils'

class BatRabiesPage extends Page {
  async enter_report_date(year = new Date().getFullYear()) {
    await $(`#reportDate__month`).setValue(getCurrentMonth())
    await $(`#reportDate__year`).setValue(year)
    await $(`.govuk-button`).click()
  }

  async get_report_date() {
    return await $(`(//dd[contains(@class,'app-prose-scope')])[1]`)
  }

  async get_banner_text() {
    return await $(`//h1`)
  }

  async click_report_date_change() {
    await $(`(//dl[@class='govuk-summary-list']//dd/a)[1]`).click()
  }
}

export default new BatRabiesPage()
