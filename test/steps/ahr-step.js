import { Given, Then, When } from '@wdio/cucumber-framework'
import { $, browser, expect } from '@wdio/globals'
import HomePage from '../page-objects/home.page'
import ReportPage from '../page-objects/report.page'
import DiagnosticTestsPage from '../page-objects/diagnostic-tests.page'
import AhrWebFormPage from '../page-objects/ahr-web-form.page'

async function openDiagnosticTestsFromSubmissionWelcome() {
  const welcomeUpdateTests = await $(
    'input[name="submissionAction"][value="update-diagnostic-tests"]'
  )

  if (await welcomeUpdateTests.isExisting()) {
    await welcomeUpdateTests.click()
    await HomePage.click_button_by_text('Continue')
  } else {
    await HomePage.select_animal_health_regulations_report()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/animal-health-regulations/how-to-report')
    )

    const updateTestsOption = await $(
      '//label[contains(normalize-space(.),"Update your diagnostic tests in use")]'
    )

    if (!(await updateTestsOption.isExisting())) {
      throw new Error(
        'The AHR journey does not offer Update your diagnostic tests in use from Submission Welcome or the AHR report-method page'
      )
    }

    await updateTestsOption.waitForClickable({ timeout: 10000 })
    await updateTestsOption.click()
    await HomePage.click_button_by_text('Continue')
  }

  await expect(browser).toHaveUrl(expect.stringContaining('/diagnostic-tests'))
  await DiagnosticTestsPage.complete_laboratory_details_if_required()
  await expect(HomePage.pageHeading).toHaveText(
    'Define your qualifying tests in use'
  )
}

async function ensureAnimalHealthRegulationsReportingIsAvailable() {
  if (!(await HomePage.is_animal_health_regulations_report_available())) {
    await openDiagnosticTestsFromSubmissionWelcome()
    await DiagnosticTestsPage.define_mycoplasma_pcr_as_accredited()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/diagnostic-tests/confirmation')
    )
    await DiagnosticTestsPage.return_to_submission_welcome()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/submission-welcome')
    )
    return
  }

  await HomePage.select_animal_health_regulations_report()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/how-to-report')
  )

  const setupRequiredText =
    'You need to set up your diagnostic tests before you can submit an Animal Health Regulations report.'
  const methodPageText = await $('body').getText()

  if (methodPageText.includes(setupRequiredText)) {
    const updateTestsOption = await $(
      '//label[contains(normalize-space(.),"Update your diagnostic tests in use")]'
    )
    await updateTestsOption.waitForClickable({ timeout: 10000 })
    await updateTestsOption.click()
    await HomePage.click_button_by_text('Continue')
    await expect(browser).toHaveUrl(
      expect.stringContaining('/diagnostic-tests')
    )
    await DiagnosticTestsPage.complete_laboratory_details_if_required()
    await expect(HomePage.pageHeading).toHaveText(
      'Define your qualifying tests in use'
    )
    await DiagnosticTestsPage.define_mycoplasma_pcr_as_accredited()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/diagnostic-tests/confirmation')
    )
    await DiagnosticTestsPage.return_to_submission_welcome()
  } else {
    await browser.url('/submission-welcome')
  }

  await expect(browser).toHaveUrl(
    expect.stringContaining('/submission-welcome')
  )
}

Given('the User has signed in to configure AHR diagnostic tests', async () => {
  await HomePage.open()
  await HomePage.click_href_by_text(
    'Continue to Surveillance data submission portal'
  )
  await HomePage.sign_in_with_DefraSingleSignOn()
  await openDiagnosticTestsFromSubmissionWelcome()
})

Given('the User has AHR access with diagnostic tests configured', async () => {
  await HomePage.open()
  await HomePage.click_href_by_text(
    'Continue to Surveillance data submission portal'
  )
  await HomePage.sign_in_with_DefraSingleSignOn()
  await ensureAnimalHealthRegulationsReportingIsAvailable()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/submission-welcome')
  )
})

When('the User opens AHR diagnostic test settings', async () => {
  await openDiagnosticTestsFromSubmissionWelcome()
})

When('the User ensures AHR reporting is available', async () => {
  await ensureAnimalHealthRegulationsReportingIsAvailable()
})

When('the User continues without selecting diagnostic tests', async () => {
  await DiagnosticTestsPage.continue_without_selecting_diagnostic_tests()
})

Then('the diagnostic test selection error is displayed', async () => {
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Select at least one qualifying test')
  )
})

When(
  'the User selects Mycoplasma PCR without choosing accreditation',
  async () => {
    await DiagnosticTestsPage.select_mycoplasma_pcr_without_accreditation()
  }
)

Then('the diagnostic test accreditation error is displayed', async () => {
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining(
      'Select the accreditation for PCR (Mycoplasma gallisepticum / M. meleagridis)'
    )
  )
})

When('the User opens the AHR report method page', async () => {
  await HomePage.select_animal_health_regulations_report()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/how-to-report')
  )
})

When('the User continues without choosing an AHR report method', async () => {
  await HomePage.click_button_by_text('Continue')
})

Then('the AHR report method validation error is displayed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/how-to-report')
  )
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Select how you would like to report')
  )
})

When('the User opens the AHR reporting period page', async () => {
  await HomePage.select_animal_health_regulations_report()
  await HomePage.choose_file_upload_method()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/report-date')
  )
})

When(
  'the User continues without entering the AHR reporting period',
  async () => {
    await ReportPage.clear_report_date()
    await HomePage.click_button_by_text('Continue')
  }
)

When('the User enters only the AHR reporting year', async () => {
  await ReportPage.clear_report_date()
  await $('#reportDate__year').setValue(2021)
  await HomePage.click_button_by_text('Continue')
})

When('the User enters only the AHR reporting month', async () => {
  await ReportPage.clear_report_date()
  await $('#reportDate__month').setValue(5)
  await HomePage.click_button_by_text('Continue')
})

Then('the AHR reporting period month error is displayed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/report-date')
  )
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Reporting period must include a month')
  )
})

Then('the AHR reporting period year error is displayed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/report-date')
  )
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Reporting period must include a year')
  )
})

When('the User continues without uploading an AHR report file', async () => {
  await HomePage.click_button_by_text('Continue')
})

Then('the AHR report file validation error is displayed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/files-upload')
  )
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Select supporting documents')
  )
})

When(
  'the User submits the AHR report without confirming diagnostic tests',
  async () => {
    await HomePage.click_button_by_text('Submit')
  }
)

Then('the AHR diagnostic test confirmation error is displayed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/summary')
  )
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining(
      'Confirm that the diagnostic tests and UKAS accreditation selected are the ones your laboratory used this reporting month'
    )
  )
})

When(
  'the User defines Mycoplasma PCR as an accredited diagnostic test',
  async () => {
    await HomePage.select_update_diagnostic_tests()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/diagnostic-tests')
    )
    await expect(HomePage.pageHeading).toHaveText(
      'Define your qualifying tests in use'
    )
    await DiagnosticTestsPage.define_mycoplasma_pcr_as_accredited()
  }
)

Then('the diagnostic tests submission is confirmed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/diagnostic-tests/confirmation')
  )
  await expect(browser).toHaveTitle('Form submitted | apha-sdo-system')
  await expect(HomePage.pageHeading).toHaveText('Form submitted')
})

When('the User returns to Submission Welcome', async () => {
  await DiagnosticTestsPage.return_to_submission_welcome()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/submission-welcome')
  )
})

When(
  'the User signs out and signs in again with Defra Single Sign-on',
  async () => {
    await HomePage.sign_out()
    await expect(browser).toHaveUrl(expect.stringContaining('/signed-out'))
    await HomePage.sign_in_again()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/submission-welcome')
    )
  }
)

Then('Animal Health Regulations reporting is available', async () => {
  await expect(
    await HomePage.is_animal_health_regulations_report_available()
  ).toBe(true)
})

Then('the User selects Animal Health Regulations report', async () => {
  await HomePage.select_animal_health_regulations_report()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/how-to-report')
  )
  await expect(HomePage.pageHeading).toHaveText('How would you like to report?')
})

When('the User chooses to complete an AHR web form', async () => {
  await HomePage.choose_web_form_method()
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/what-month-does-your-report-cover'
    )
  )
  await expect(HomePage.pageHeading).toHaveText(
    'What month does your report cover?'
  )
})

When('the User enters the AHR web-form reporting month and year', async () => {
  await ReportPage.enter_report_date(2025, 5)
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/which-pathogen-was-tested'
    )
  )
  await expect(HomePage.pageHeading).toHaveText(
    expect.stringContaining('Which pathogen was tested?')
  )
})

When('the User selects the first pathogen', async () => {
  await AhrWebFormPage.select_first_pathogen()
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/which-species-was-tested'
    )
  )
  await expect(HomePage.pageHeading).toHaveText(
    expect.stringContaining('Which species was tested?')
  )
  await expect(
    $(
      '//label[contains(normalize-space(.), "What species is the report for?")]'
    )
  ).toBeDisplayed()
})

When('the User selects pathogen {string}', async (pathogen) => {
  await AhrWebFormPage.select_pathogen(pathogen)
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/which-species-was-tested'
    )
  )
})

When('the User selects species {string}', async (species) => {
  await AhrWebFormPage.select_species(species)
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/which-country-were-the-samples-collected-in'
    )
  )
})

Then('Change links are shown for {string}', async (answerLabels) => {
  await AhrWebFormPage.assert_change_links(answerLabels.split('|'))
})

When(
  'the User changes the AHR web-form report date and returns to pathogen',
  async () => {
    await AhrWebFormPage.click_change_answer('Report Date')
    await expect(browser).toHaveUrl(
      expect.stringContaining(
        '/animal-health-regulations-web-form/what-month-does-your-report-cover'
      )
    )
    await expect($('#reportDate__month')).toHaveValue('5')
    await expect($('#reportDate__year')).toHaveValue('2025')
    await HomePage.click_button_by_text('Continue')
    await expect(browser).toHaveUrl(
      expect.stringContaining(
        '/animal-health-regulations-web-form/which-pathogen-was-tested'
      )
    )
  }
)

When('the User selects Other as the species', async () => {
  await AhrWebFormPage.select_other_species()
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/enter-other-species'
    )
  )
  await expect(HomePage.pageHeading).toHaveText(
    expect.stringContaining('Enter other species')
  )
})

When('the User enters other species as {string}', async (species) => {
  await AhrWebFormPage.enter_other_species(species)
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/which-country-were-the-samples-collected-in'
    )
  )
})

When('the User selects {string} as the country', async (country) => {
  await expect(HomePage.pageHeading).toHaveText(
    expect.stringContaining('Which country were the samples collected in?')
  )
  await AhrWebFormPage.select_country(country)
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/number-of-submissions-of-diagnostic-tests'
    ),
    { timeout: 20000 }
  )
  await expect(HomePage.pageHeading).toHaveText(
    expect.stringContaining('Number of submissions of diagnostic tests')
  )
})

When('the User enters the AHR web-form submission totals', async () => {
  await AhrWebFormPage.enter_submission_totals()
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      '/animal-health-regulations-web-form/report-entries'
    )
  )
})

Then('the AHR report entries page shows one entry', async () => {
  await expect(HomePage.pageHeading).toHaveText(
    'You have added 1 entry to the report'
  )
  const values = await browser.execute(() =>
    Array.from(
      document.querySelectorAll(
        '.govuk-summary-card .govuk-summary-list__value'
      )
    ).map((entryValue) => entryValue.textContent.trim())
  )
  await expect(values.slice(-6)).toEqual([
    'Other (please specify on the next page)',
    'test',
    'England',
    '1',
    '1',
    '2'
  ])
})

Then(
  'the AHR report entries page shows pathogen {string}, species {string} and country {string}',
  async (pathogen, species, country) => {
    await expect(HomePage.pageHeading).toHaveText(
      'You have added 1 entry to the report'
    )
    const entryCard = await $('.govuk-summary-card')
    await expect(entryCard).toHaveText(expect.stringContaining(pathogen))
    await expect(entryCard).toHaveText(expect.stringContaining(species))
    await expect(entryCard).toHaveText(expect.stringContaining(country))
  }
)

Then(
  'Change links are available for every answer on the AHR report entries page',
  async () => {
    await AhrWebFormPage.assert_change_links([
      'Pathogen, disease and qualifying tests',
      'Species',
      'Country',
      'Submissions with at least one qualifying test',
      'Submissions with at least one positive result',
      'Total positive submissions'
    ])
  }
)

When('the User revisits each AHR entry answer using Change', async () => {
  const answers = [
    {
      label: 'Pathogen, disease and qualifying tests',
      path: 'which-pathogen-was-tested',
      selector: 'select[name="pathogen"]',
      value: 'Mycoplasma gallisepticum / M. meleagridis'
    },
    {
      label: 'Species',
      path: 'which-species-was-tested',
      selector: 'input[aria-autocomplete]',
      value: 'Chicken'
    },
    {
      label: 'Country',
      path: 'which-country-were-the-samples-collected-in',
      selector: 'select[name="country"]',
      value: 'England'
    },
    {
      label: 'Submissions with at least one qualifying test',
      path: 'number-of-submissions-of-diagnostic-tests',
      selector: 'input[name="submissionsWithQualifyingTest"]',
      value: '1'
    },
    {
      label: 'Submissions with at least one positive result',
      path: 'number-of-submissions-of-diagnostic-tests',
      selector: 'input[name="submissionsWithPositiveSamples"]',
      value: '1'
    },
    {
      label: 'Total positive submissions',
      path: 'number-of-submissions-of-diagnostic-tests',
      selector: 'input[name="positiveSamples"]',
      value: '2'
    }
  ]

  for (const answer of answers) {
    await AhrWebFormPage.click_change_answer(answer.label)
    await expect(browser).toHaveUrl(
      expect.stringContaining(
        `/animal-health-regulations-web-form/${answer.path}`
      )
    )
    await expect($(answer.selector)).toHaveValue(answer.value)
    await HomePage.click_button_by_text('Continue')
    await expect(browser).toHaveUrl(
      expect.stringContaining(
        '/animal-health-regulations-web-form/report-entries'
      )
    )
  }
})

When('the User continues to check AHR web-form answers', async () => {
  await AhrWebFormPage.continue_to_summary()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations-web-form/summary')
  )
})

Then('the AHR web-form answers are ready to submit', async () => {
  await expect(HomePage.pageHeading).toHaveText(
    'Check your answers before submitting'
  )
  await expect($('body')).toHaveText(expect.stringContaining('May 2025'))
  await expect($('body')).toHaveText(
    expect.stringContaining('Submissions with at least one qualifying test')
  )
  await expect($('body')).toHaveText(
    expect.stringContaining('Submissions with at least one positive result')
  )
  await expect($('body')).toHaveText(
    expect.stringContaining('Total positive submissions')
  )
  await expect(
    $(
      '//label[contains(normalize-space(.), "I confirm that the diagnostic tests and UKAS Accreditation selected")]'
    )
  ).toBeDisplayed()
})

Then(
  'the AHR web-form summary shows pathogen {string}, species {string} and country {string}',
  async (pathogen, species, country) => {
    await expect(HomePage.pageHeading).toHaveText(
      'Check your answers before submitting'
    )
    await expect($('body')).toHaveText(expect.stringContaining(pathogen))
    await expect($('body')).toHaveText(expect.stringContaining(species))
    await expect($('body')).toHaveText(expect.stringContaining(country))
  }
)

When('the User confirms and submits the AHR web form', async () => {
  await AhrWebFormPage.confirm_and_submit()
  await expect(browser).toHaveUrl(expect.stringContaining('/status'))
})

When('the User chooses to upload an AHR file', async () => {
  await HomePage.choose_file_upload_method()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/report-date')
  )
  await expect(HomePage.pageHeading).toHaveText(
    'What month does your submission cover?'
  )
})

When('the User enters the AHR reporting month and year', async () => {
  await ReportPage.enter_report_date(2021, 5)
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/files-upload')
  )
})

When('the User uploads the AHR report spreadsheet', async () => {
  await ReportPage.upload_report_file('2021-05_AHRMR_Axiom.xlsx')
  await HomePage.click_button_by_text('Continue')
  await expect(browser).toHaveUrl(
    expect.stringContaining('/animal-health-regulations/summary')
  )
  await expect(browser).toHaveTitle(
    'Check your answers before submitting | apha-sdo-system'
  )
})

Then('the AHR summary shows May 2021', async () => {
  const reportDate = await ReportPage.get_report_date()
  await expect(reportDate).toHaveText(expect.stringContaining('May 2021'))
})

When('the User submits the AHR report', async () => {
  const qualifyingTestsConfirmation = await $(
    'input[name="qualifyingTestsConfirmed"][value="confirmed"]'
  )
  await qualifyingTestsConfirmation.click()
  await HomePage.click_button_by_text('Submit')
  await expect(browser).toHaveUrl(expect.stringContaining('/status'))
})

Then(
  'the AHR Form submitted confirmation displays a reference number',
  async () => {
    await expect(browser).toHaveUrl(expect.stringContaining('/status'))

    const heading = await $('h1')
    await expect(heading).toHaveText('Form submitted')

    const confirmationPanel = await $('.govuk-panel__body')
    await expect(confirmationPanel).toHaveText(
      expect.stringContaining('Your reference number')
    )

    const referenceNumber = await $('.govuk-panel__body strong')
    await expect(referenceNumber).toBeDisplayed()
    await expect(referenceNumber).not.toHaveText('')
    await expect($('h2')).toHaveText('What happens next')
  }
)
