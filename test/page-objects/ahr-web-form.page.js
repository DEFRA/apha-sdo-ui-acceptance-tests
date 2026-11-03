import { $, expect } from '@wdio/globals'
import { Page } from './page.js'

class AhrWebFormPage extends Page {
  async select_first_pathogen() {
    await this.select_pathogen('Mycoplasma gallisepticum / M. meleagridis')
  }

  async select_pathogen(pathogenName) {
    const pathogen = await $('select[name="pathogen"]')
    await pathogen.selectByVisibleText(pathogenName)
    await expect(pathogen).toHaveValue(pathogenName)
    await this.click_button_by_text('Continue')
  }

  async select_species(species) {
    const speciesInput = await $('input[aria-autocomplete]')
    await speciesInput.waitForDisplayed()
    await speciesInput.setValue(species)

    const speciesOption = await $(
      `//li[@role="option" and normalize-space(.)="${species}"]`
    )
    await speciesOption.waitForDisplayed()
    await speciesOption.click()
    await expect(speciesInput).toHaveValue(species)
    await expect($('select[name="species"]')).toHaveValue(species)
    await this.click_button_by_text('Continue')
  }

  async assert_change_links(labels) {
    for (const label of labels) {
      const changeLink = await $(
        `//dt[normalize-space(.)="${label}"]/following-sibling::dd//a[starts-with(normalize-space(.), "Change")]`
      )
      await expect(changeLink).toBeDisplayed()
    }
  }

  async click_change_answer(label) {
    const changeLink = await $(
      `//dt[normalize-space(.)="${label}"]/following-sibling::dd//a[starts-with(normalize-space(.), "Change")]`
    )
    await changeLink.waitForClickable()
    await changeLink.click()
  }

  async select_other_species() {
    const speciesInput = await $('input[aria-autocomplete]')
    await speciesInput.waitForDisplayed()
    await speciesInput.setValue('Other')

    const otherSpeciesOption = await $(
      '//li[@role="option" and normalize-space(.)="Other (please specify on the next page)"]'
    )
    await otherSpeciesOption.waitForDisplayed()
    await otherSpeciesOption.click()
    await expect(speciesInput).toHaveValue(
      'Other (please specify on the next page)'
    )
    await expect($('select[name="species"]')).toHaveValue('Other')
    await this.click_button_by_text('Continue')
  }

  async enter_other_species(species) {
    await $('input[name="otherSpecies"]').setValue(species)
    await this.click_button_by_text('Continue')
  }

  async select_country(country) {
    const countrySelect = await $('select[name="country"]')
    await countrySelect.selectByVisibleText(country)
    await expect(countrySelect).toHaveValue(country)
    await this.click_button_by_text('Continue')
  }

  async enter_submission_totals() {
    await $('input[name="submissionsWithQualifyingTest"]').setValue('1')
    await $('input[name="submissionsWithPositiveSamples"]').setValue('1')
    await $('input[name="positiveSamples"]').setValue('2')
    await this.click_button_by_text('Continue')
  }

  async continue_to_summary() {
    await this.click_button_by_text('Continue')
  }

  async confirm_and_submit() {
    const confirmation = await $(
      'input[name="qualifyingTestsConfirmed"][value="confirmed"]'
    )
    if (!(await confirmation.isSelected())) {
      await $(
        '//label[contains(normalize-space(.), "I confirm that the diagnostic tests and UKAS Accreditation selected")]'
      ).click()
    }
    await expect(confirmation).toBeSelected()
    await this.click_button_by_text('Submit')
  }
}

export default new AhrWebFormPage()
