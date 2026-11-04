import fs from 'node:fs'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { bootstrap } from 'global-agent'

const environment = (process.env.ENVIRONMENT || 'test').toLowerCase()
const environmentBaseUrls = {
  dev: 'https://apha-sdo-system.dev.cdp-int.defra.cloud',
  test: 'https://apha-sdo-system.test.cdp-int.defra.cloud'
}
const browserStackUsername =
  process.env.BROWSERSTACK_USERNAME || process.env.BROWSERSTACK_USER
const browserStackKey = process.env.BROWSERSTACK_KEY
const tagExpression =
  process.env.CUCUMBER_TAG_EXPRESSION ||
  (environment === 'test'
    ? '@test'
    : environment === 'dev'
      ? '@dev'
      : 'not @wip and not @dev and not @test')

if (!environmentBaseUrls[environment] && !process.env.BASE_URL) {
  throw new Error(
    `Set BASE_URL for the unsupported BrowserStack environment "${environment}"`
  )
}

/**
 * Enable webdriver.io to use the outbound proxy.
 * This is required for the test suite to be able to talk to BrowserStack.
 */
if (process.env.HTTP_PROXY) {
  const dispatcher = new ProxyAgent({
    uri: process.env.HTTP_PROXY
  })
  setGlobalDispatcher(dispatcher)
  bootstrap()
  global.GLOBAL_AGENT.HTTP_PROXY = process.env.HTTP_PROXY
}

export const config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  // WebdriverIO supports running e2e tests as well as unit and component tests.
  runner: 'local',
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  baseUrl: environmentBaseUrls[environment] || process.env.BASE_URL,

  // You will need to provide your own BrowserStack credentials.
  // These should be added as secrets to the test suite.
  user: browserStackUsername,
  key: browserStackKey,

  // Tests to run
  specs: ['./test/features/**/*.feature'],
  // Tests to exclude
  exclude: [],
  maxInstances: 1,

  commonCapabilities: {
    'bstack:options': {
      buildName: `apha-sdo-ui-acceptance-tests-${environment}`
    }
  },

  capabilities: [
    {
      browserName: 'Chrome', // Set as required
      'bstack:options': {
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '11'
      }
    }
  ],

  services: [
    [
      'browserstack',
      {
        testObservability: true, // Disable if you do not want to use the browserstack test observer functionality
        testObservabilityOptions: {
          user: browserStackUsername,
          key: browserStackKey,
          projectName: 'cdp-node-env-test-suite',
          buildName: `apha-sdo-ui-acceptance-tests-${environment}`
        },
        acceptInsecureCerts: true,
        forceLocal: false,
        browserstackLocal: true
      }
    ]
  ],

  execArgv: ['--loader', 'esm-module-alias/loader'],

  logLevel: 'info',

  // Number of failures before the test suite bails.
  bail: 0,
  waitforTimeout: 10000,
  waitforInterval: 200,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'cucumber',

  reporters: [
    [
      // Spec reporter provides rolling output to the logger so you can see it in-progress
      'spec',
      {
        addConsoleLogs: true,
        realtimeReporting: true,
        color: false
      }
    ],
    [
      // Allure is used to generate the final HTML report
      'allure',
      {
        outputDir: 'allure-results'
      }
    ]
  ],

  cucumberOpts: {
    require: ['./test/steps/*.js'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    tagExpression,
    timeout: 180000,
    ignoreUndefinedDefinitions: false
  },

  // Hooks
  afterTest: async function (
    test,
    context,
    { error, result, duration, passed, retries }
  ) {
    if (error) {
      await browser.takeScreenshot()
    }
  },

  onComplete: function (exitCode, config, capabilities, results) {
    // !Do Not Remove! Required for test status to show correctly in portal.
    if (results?.failed && results.failed > 0) {
      fs.writeFileSync('FAILED', JSON.stringify(results))
    }
  }
}
