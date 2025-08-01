import allure from 'allure-commandline'
import { integrateAccessibilityWithAllure } from './allure-accessibility-plugin/allure-accessibility-integration.js'

const debug = process.env.DEBUG
const oneMinute = 60 * 1000
const oneHour = 60 * 60 * 1000

const execArgv = ['--loader', 'esm-module-alias/loader']

if (debug) {
  execArgv.push('--inspect')
}

export const config = {
  runner: 'local',
  specs: ['./test/accessibility/**/*.e2e.js'],
  exclude: [],
  maxInstances: 1,
  capabilities: debug
    ? [{ browserName: 'chrome' }]
    : [
        {
          maxInstances: 1,
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: [
              '--no-sandbox',
              '--disable-infobars',
              '--disable-gpu',
              '--headless',
              '--window-size=1920,1080'
            ]
          }
        }
      ],

  execArgv,
  logLevel: debug ? 'debug' : 'info',
  logLevels: {
    webdriver: debug ? 'debug' : 'error'
  },
  bail: 1,
  baseUrl: `https://apha-sdo-frontend.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`,
  waitforTimeout: 10000,
  waitforInterval: 200,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'mocha',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results'
      }
    ]
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: debug ? oneHour : 60000
  },
  afterTest: async function (
    test,
    context,
    { error, result, duration, passed, retries }
  ) {
    await browser.takeScreenshot()

    if (error) {
      browser.executeScript(
        'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "At least 1 assertion failed"}}'
      )
    }
  },
  onComplete: function (exitCode, config, capabilities, results) {
    const reportError = new Error('Could not generate Allure report')
    const generation = allure(['generate', 'allure-results', '--clean'])

    return new Promise((resolve, reject) => {
      const generationTimeout = setTimeout(() => reject(reportError), oneMinute)

      generation.on('exit', function (exitCode) {
        clearTimeout(generationTimeout)

        if (exitCode !== 0) {
          return reject(reportError)
        }

        allure(['open'])
        resolve()
        integrateAccessibilityWithAllure()
      })
    })
  }
}
