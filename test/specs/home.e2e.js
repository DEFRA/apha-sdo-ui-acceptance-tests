import { browser, expect } from '@wdio/globals'

import HomePage from 'page-objects/home.page'

describe('Home page', () => {
  it('Should be on the "Home" page', async () => {
    await HomePage.open()
    await expect(browser).toHaveTitle('Home | APHA SDO')
    await HomePage.signInSDOPortal()
    await expect(browser).toHaveTitle('Sign In | APHA SDO')
  })
})
