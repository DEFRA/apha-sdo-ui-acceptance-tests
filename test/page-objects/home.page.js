import { Page } from 'page-objects/page'

class HomePage extends Page {
  async open() {
    return super.open('/')
  }

  async sign_in_SDO_portal() {
    await $('.govuk-button--start').click()
  }

  async sign_in_with_DefraId() {
    await $('.govuk-button--start').click()
  }

  async click_bat_rabies_service() {
    await $(`//a[@href='/bat-rabies']`).click()
  }
}

export default new HomePage()
