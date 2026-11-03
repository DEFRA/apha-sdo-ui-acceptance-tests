import { Given, Then, When } from '@wdio/cucumber-framework'
import HomePage from '../page-objects/home.page'
import BatRabiesPage from '../page-objects/bat-rabies.page'
import { $, browser, expect } from '@wdio/globals'

Given('the User access APHA SDO portal', async () => {
  const currentUrl = new URL(await browser.getUrl())
  if (currentUrl.pathname.startsWith('/submission-welcome')) {
    await expect(HomePage.pageHeading).toHaveText('What would you like to do?')
    return
  }

  await HomePage.open()
  const homePageTitle = 'Home | apha-sdo-system'
  const submissionWelcomeTitle = 'What would you like to do? | apha-sdo-system'

  await browser.waitUntil(
    async () =>
      [homePageTitle, submissionWelcomeTitle].includes(
        await browser.getTitle()
      ),
    {
      timeout: 30000,
      timeoutMsg: 'SDO did not open its home or submission welcome page'
    }
  )

  const currentTitle = await browser.getTitle()
  await expect(browser).toHaveTitle(
    currentTitle === submissionWelcomeTitle
      ? submissionWelcomeTitle
      : homePageTitle
  )
})

When('the User clicks the home page link {string}', async (linkText) => {
  await HomePage.click_href_by_text(linkText)
})

Then('the browser opens the page titled {string}', async (pageTitle) => {
  await expect(browser).toHaveTitle(pageTitle)
})

Given('the User login to SDO', async () => {
  if ((await browser.getUrl()).includes('/submission-welcome')) {
    await expect(HomePage.pageHeading).toHaveText('What would you like to do?')
    return
  }

  await HomePage.click_href_by_text(
    'Continue to Surveillance data submission portal'
  )
  await browser.waitUntil(
    async () => {
      const currentUrl = await browser.getUrl()
      return (
        currentUrl.includes('/sign-in-choose') ||
        currentUrl.includes('/submission-welcome')
      )
    },
    {
      timeout: 30000,
      timeoutMsg: 'SDO did not open the sign-in or submission welcome page'
    }
  )

  if ((await browser.getUrl()).includes('/sign-in-choose')) {
    await expect(HomePage.pageHeading).toHaveText('How do you want to sign in?')
  } else {
    await expect(HomePage.pageHeading).toHaveText('What would you like to do?')
  }
})

When('the User continues without selecting a sign-in method', async () => {
  await HomePage.click_button_by_text('Sign in')
})

async function signInWithEnvironmentCredentials(environment) {
  const username = process.env[`${environment}_ENTRA_USERNAME`]
  const password = process.env[`${environment}_ENTRA_PASSWORD`]
  const expectedOrigin = `https://apha-sdo-system.${environment.toLowerCase()}.cdp-int.defra.cloud`

  const currentUrl = new URL(await browser.getUrl())
  if (currentUrl.origin !== expectedOrigin) {
    throw new Error(
      `The ${environment} feature must run against ${expectedOrigin}`
    )
  }

  if (currentUrl.pathname.startsWith('/submission-welcome')) {
    return
  }

  if (!username || !password) {
    throw new Error(
      `Set ${environment}_ENTRA_USERNAME and ${environment}_ENTRA_PASSWORD to sign in to ${environment}`
    )
  }

  await HomePage.sign_in_with_DefraSingleSignOn()

  const useAnotherAccount = await $('button=Use another account')
  if (await useAnotherAccount.isDisplayed()) {
    await useAnotherAccount.click()
  }

  const emailInput = await $('input[placeholder="Email, phone, or Skype"]')
  await emailInput.waitForDisplayed({ timeout: 30000 })
  await emailInput.setValue(username)

  const nextButton = await $('#idSIButton9')
  await nextButton.waitForClickable({
    timeout: 30000,
    timeoutMsg:
      'Microsoft did not show the Next button after the username was entered.'
  })
  await nextButton.click()

  const passwordInput = await $('input[type="password"]')
  await passwordInput.waitForDisplayed({
    timeout: 30000,
    timeoutMsg:
      'Microsoft did not show the password field after the username was entered. Check the account name and sign-in page.'
  })
  await passwordInput.setValue(password)
  await browser.waitUntil(
    async () => (await passwordInput.getValue()).length > 0,
    {
      timeout: 5000,
      timeoutMsg: `The Microsoft password field is still empty after the ${environment} password was entered. Check the local .env value and formatting.`
    }
  )

  const signInButton = await $('#idSIButton9')
  await signInButton.waitForClickable({
    timeout: 30000,
    timeoutMsg:
      'Microsoft did not show the Sign in button after the password was entered.'
  })
  await signInButton.click()

  const staySignedInNo = await $('#idBtn_Back')
  const submissionWelcomeUrl = `${new URL(expectedOrigin).host}/submission-welcome`

  await browser.waitUntil(
    async () =>
      (await browser.getUrl()).includes(submissionWelcomeUrl) ||
      (await staySignedInNo.isDisplayed()),
    {
      timeout: 120000,
      timeoutMsg:
        'Microsoft sign-in did not complete or show the Stay signed in prompt'
    }
  )

  if (await staySignedInNo.isDisplayed()) {
    await staySignedInNo.waitForClickable({ timeout: 30000 })
    await staySignedInNo.click()
  }

  await browser.waitUntil(
    async () => (await browser.getUrl()).includes(submissionWelcomeUrl),
    {
      timeout: 120000,
      timeoutMsg: `${environment} sign-in did not return to Submission Welcome`
    }
  )
}

When('the User signs in to DEV with environment credentials', async () => {
  await signInWithEnvironmentCredentials('DEV')
})

When('the User signs in to TEST with environment credentials', async () => {
  await signInWithEnvironmentCredentials('TEST')
})

Then('the sign-in method validation error is displayed', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/sign-in-choose'))
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Select how you want to sign in')
  )
})

When('the User sign in with Defra Single Sign-on', async () => {
  await HomePage.sign_in_with_DefraSingleSignOn()
  await expect(browser).toHaveUrl(
    expect.stringContaining('/submission-welcome')
  )
  await expect(browser).toHaveTitle(
    'What would you like to do? | apha-sdo-system'
  )
})

When('the User continues without selecting a submission action', async () => {
  await HomePage.click_button_by_text('Continue')
})

Then('the submission action validation error is displayed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/submission-welcome')
  )
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Select what you want to do')
  )
})

Then('the User selects Bat Rabies Surveillance Report', async () => {
  if (
    (await HomePage.pageHeading.getText()) === 'How do you want to sign in?'
  ) {
    await HomePage.sign_in_with_DefraSingleSignOn()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/submission-welcome')
    )
  }

  await HomePage.select_bat_rabies_report()
  await expect(browser).toHaveUrl(expect.stringContaining('/bat-rabies'))
  await expect(browser).toHaveTitle(
    'What month does your submission cover? | apha-sdo-system'
  )
})

When('the User inputs the report date of sample collection', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('report-date'))
  await expect(browser).toHaveTitle(
    'What month does your submission cover? | apha-sdo-system'
  )
  await BatRabiesPage.enter_report_date()
})

When(
  'the User inputs reporting month {string} and year {string}',
  async (month, year) => {
    await expect(browser).toHaveUrl(expect.stringContaining('report-date'))
    await BatRabiesPage.enter_report_date(Number(year), Number(month))
  }
)

When('the User continues without entering a reporting period', async () => {
  await BatRabiesPage.clear_report_date()
  await HomePage.click_button_by_text('Continue')
})

When('the User enters only the reporting year', async () => {
  await BatRabiesPage.clear_report_date()
  await $('#reportDate__year').setValue(2025)
  await HomePage.click_button_by_text('Continue')
})

When('the User enters only the reporting month', async () => {
  await BatRabiesPage.clear_report_date()
  await $('#reportDate__month').setValue(5)
  await HomePage.click_button_by_text('Continue')
})

Then('the reporting period error says a month is required', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/report-date'))
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Reporting period must include a month')
  )
})

Then('the reporting period error says a year is required', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/report-date'))
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Reporting period must include a year')
  )
})

When('the User upload the Surveillance sample collection file', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('files-upload'))
  await BatRabiesPage.upload_report_file()
  await BatRabiesPage.click_button_by_text('Continue')
  await expect(browser).toHaveTitle(
    'Check your answers before submitting | apha-sdo-system'
  )
})

When(
  'the User uploads the June 2025 Surveillance sample collection file',
  async () => {
    await expect(browser).toHaveUrl(expect.stringContaining('files-upload'))
    await BatRabiesPage.upload_report_file('bat-rabies-test2025-06.xlsx')
    await BatRabiesPage.click_button_by_text('Continue')
    await expect(browser).toHaveTitle(
      'Check your answers before submitting | apha-sdo-system'
    )
  }
)

When('the User uploads a Bat Rabies file for removal', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('files-upload'))
  await BatRabiesPage.upload_report_file()
  await expect($('#uploadedFilesContainer')).toHaveText(
    expect.stringContaining('bat-rabies-test2025-05.xlsx')
  )
})

When('the User chooses to remove the uploaded Bat Rabies file', async () => {
  await BatRabiesPage.request_report_file_removal()
})

When('the User confirms removal of the Bat Rabies file', async () => {
  await BatRabiesPage.confirm_report_file_removal('bat-rabies-test2025-05.xlsx')
})

When('the User continues without uploading a report file', async () => {
  await HomePage.click_button_by_text('Continue')
})

Then('the report file validation error is displayed', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/files-upload'))
  const errorSummary = await $('.govuk-error-summary')
  await expect(errorSummary).toHaveText(
    expect.stringContaining('Select supporting documents')
  )
})

When('the User follows the reporting period back link', async () => {
  await BatRabiesPage.click_href_by_text('Back')
})

Then('Submission Welcome is displayed', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining('/submission-welcome')
  )
  await expect(HomePage.pageHeading).toHaveText('What would you like to do?')
})

When('the User follows the upload back link', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/files-upload'))
  await BatRabiesPage.click_href_by_text('Back')
})

Then('the reporting period is still May 2025', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/report-date'))
  const month = Number(await $('#reportDate__month').getValue())
  await expect(month).toBe(5)
  await expect($('#reportDate__year')).toHaveValue('2025')
})

When('the User continues to the Bat Rabies upload page', async () => {
  await HomePage.click_button_by_text('Continue')
})

Then('the upload page requires a filename for May 2025', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/files-upload'))
  await expect($('body')).toHaveText(
    expect.stringContaining(
      'The file name must include "2025-05", for example "2025-05.xlsx" or "2025-05-Report.xlsx"'
    )
  )
})

When('the User follows the summary back link', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/summary'))
  await BatRabiesPage.click_href_by_text('Back')
})

Then('the uploaded Bat Rabies file is still available', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/files-upload'))
  await expect($('#uploadedFilesContainer')).toHaveText(
    expect.stringContaining('bat-rabies-test2025-05.xlsx')
  )
})

When('the User opens the reporting period change link', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/summary'))
  await BatRabiesPage.click_reporting_period_change()
  await expect(browser).toHaveUrl(expect.stringContaining('/report-date'))
})

When(
  'the User changes the reporting month to {string} and year to {string}',
  async (month, year) => {
    await $('#reportDate__month').setValue(month)
    await $('#reportDate__year').setValue(year)
    await HomePage.click_button_by_text('Continue')
  }
)

Then('the previously uploaded Bat Rabies file must be replaced', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('/files-upload'))
  const uploadedFiles = await $('#uploadedFilesContainer')
  await expect(uploadedFiles).toHaveText('0 files uploaded')
  await expect($('body')).toHaveText(
    expect.stringContaining(
      '‘bat-rabies-test2025-05.xlsx’ must include ‘2025-06’'
    )
  )
  await expect($('body')).toHaveText(
    expect.stringContaining(
      'The file name must include "2025-06", for example "2025-06.xlsx" or "2025-06-Report.xlsx"'
    )
  )
})

Then('application displays the screen to check given information', async () => {
  const reportDate = await BatRabiesPage.get_report_date()
  await expect(reportDate).toHaveText(expect.stringContaining('May 2025'))
})

Then(
  'application displays the screen to check given information for {string}',
  async (reportingPeriod) => {
    const reportDate = await BatRabiesPage.get_report_date()
    await expect(reportDate).toHaveText(
      expect.stringContaining(reportingPeriod)
    )
  }
)
When('the User confirms the information', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('summary'))
  await BatRabiesPage.click_button_by_text('Submit')
  await expect(browser).toHaveUrl(expect.stringContaining('status'))
})

Then('the Form submitted confirmation page should display', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('status'))
  const heading = await BatRabiesPage.get_banner_text()
  await expect(heading).toHaveText('Form submitted')

  const confirmationPanel = await $('.govuk-panel__body')
  await expect(confirmationPanel).toHaveText(
    expect.stringContaining('Your reference number')
  )

  const referenceNumber = await $('.govuk-panel__body strong')
  await expect(referenceNumber).toBeDisplayed()
  await expect(referenceNumber).not.toHaveText('')

  await expect($('h2')).toHaveText('What happens next')
})

When('the User cicks Contact link', async () => {
  const contactLink = await HomePage.is_link('Contact')
  contactLink.click()
})

When('the User cicks APHA Dashboard link', async () => {
  const contactLink = await HomePage.is_link(`APHA's dashboard`)
  contactLink.click()
})

Then('application should redirects to contact screen', async () => {
  await expect(browser).toHaveUrl(expect.stringContaining('contact'))
})

When('the User decides to change report year as {string}', async (year) => {
  await BatRabiesPage.click_report_date_change()
  await expect(browser).toHaveUrl(
    expect.stringContaining('sample-details?returnUrl=%2Fbat-rabies%2Fsummary')
  )
  await BatRabiesPage.enter_report_date(year)
})

Then(
  'application displays the screen with updated year as {string}',
  async (year) => {
    const reportDate = await BatRabiesPage.get_report_date()
    await expect(reportDate).toHaveText(expect.stringContaining(year))
  }
)

Then('application shoudl redirects to Dashboard screen', async () => {
  await expect(browser).toHaveUrl(
    expect.stringContaining(
      'view-apha-surveillance-reports-publications-and-data'
    )
  )
})
