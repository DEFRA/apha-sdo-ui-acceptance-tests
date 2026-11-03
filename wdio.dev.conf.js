import { config as localConfig } from './wdio.local.conf.js'

export const config = {
  ...localConfig,
  baseUrl: 'https://apha-sdo-system.dev.cdp-int.defra.cloud',
  afterScenario: async function () {
    await browser.url('/')
  },
  cucumberOpts: {
    ...localConfig.cucumberOpts,
    tagExpression: '@dev'
  }
}
