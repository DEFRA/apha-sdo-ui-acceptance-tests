import { browser, $ } from '@wdio/globals'
import { config } from '../../wdio.conf.js'

class Page {
  get pageHeading() {
    return $('h1')
  }

  open(path) {
    return browser.url(path)
  }

  async click_button_by_text(text) {
    const button = await $(`button=${text}`)
    await button.waitForClickable({ timeout: config.waitforTimeout })
    await button.click()
  }

  async click_href_by_text(text) {
    const button = await $(`a=${text}`)
    await button.waitForClickable({ timeout: config.waitforTimeout })
    await button.click()
  }

  async is_link_present(linkText) {
    const link = await $(`//a[contains(.,"${linkText}")]`)
    return await link.isDisplayed()
  }

  async is_link(linkText) {
    const link = await $(`//a[contains(.,"${linkText}")]`)
    return await link
  }
}

export { Page }
