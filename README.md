apha-sdo-ui-acceptance-tests

The template to create a service that runs WDIO tests against an environment.

- [Local](#local)
  - [Requirements](#requirements)
    - [Node.js](#nodejs)
  - [Setup](#setup)
  - [Running local tests](#running-local-tests)
  - [Debugging local tests](#debugging-local-tests)
- [Production](#production)
  - [Debugging tests](#debugging-tests)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v20` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

### Setup

Install application dependencies:

```bash
npm install
```

### Running local tests

The local WDIO configuration targets `http://localhost:3000` by default. To test
internal sign-in against APHA SDO's local Entra/OIDC stub, start the SDO app and
its stub first. Follow the [local setup in apha-sdo-system](../apha-sdo-system/apha-sdo-system/README.md#run-it-locally);
that starts the OIDC stub on port `5556` and the app on port `3000`.

In a terminal opened in `apha-sdo-system/apha-sdo-system`, run:

```bash
npm run docker:up
npm run dev
```

Keep that terminal running. In a second terminal opened in
`apha-sdo-ui-acceptance-tests`, run:

```bash
npm run test:local
```

The sign-in journey chooses **Defra Single Sign-on** and follows the OIDC
authorization-code flow through the stub. The stub's default user has the
Bat Rabies role needed by the acceptance journey. Set `BASE_URL` to target a
different running app URL; that app must be configured to use the same OIDC
stub if the test is expected to authenticate without a real Entra tenant.

The local run generates an Allure report in `allure-report`. In the report's
Suites view, results are grouped under their feature filename and then by
scenario. Open a scenario to see its Cucumber steps and their screenshot
attachments, numbered in execution order and prefixed with the scenario name.

### Running the Bat Rabies DEV submission

The DEV-only feature includes the Bat Rabies home-page links, authenticated
journey, file-management, navigation, and validation scenarios. Its valid
journey uploads the June 2025 fixture and submits a report to DEV. The
reporting-period validation scenario still uses the May fixture to verify that
changing the period to June rejects an old-period file. Run the feature only
when you intend to create a real test submission. It is tagged `@dev` and
excluded from normal feature-suite runs.

The DEV runner keeps one browser session for the feature and returns to the
DEV homepage between scenarios, so Microsoft sign-in is performed once per run.
The unauthenticated sign-in validation scenario runs before that login.

From Git Bash in this repository, run only that feature. The runner defaults to the
`SDO.test1@defradev.onmicrosoft.com` account and prompts for its password
without showing what you type:

```bash
npm run test:local:dev
```

To run only one scenario, pass its exact scenario name after `--`. For example:

```bash
npm run test:local:dev -- "DEV changing the reporting period rejects a file named for the old period"
```

Alternatively, add the current test-account credentials to a local `.env` file.
It is ignored by Git. Quote the password in single quotes so shell characters
are treated literally:

```bash
DEV_ENTRA_USERNAME='SDO.test1@defradev.onmicrosoft.com'
DEV_ENTRA_PASSWORD='your-current-password'
```

The runner reads `.env` automatically, or prompts for the password without
echoing it when the password is blank. The dedicated command fixes the target to
`https://apha-sdo-system.dev.cdp-int.defra.cloud` and runs only
`test/features/dev/sdo-bat-rabies-dev.feature`. If a different DEV account is needed, set
`DEV_ENTRA_USERNAME` before running. The runner clears the credential variables
when it exits. Do not run this feature against production.

### Running the AHR DEV journeys

The AHR DEV feature mirrors the AHR upload, web-form, diagnostic-test, and
validation scenarios. Its upload and web-form happy paths submit real reports
to DEV. When the account is awaiting diagnostic-test setup, the runner completes
the laboratory details and diagnostic-test setup first. This submits a diagnostic
test configuration and updates the DEV lab profile. Run only when you intend to
create these submissions:

```bash
npm run test:local:dev:ahr
```

It uses the same local `.env`, masked password prompt, and pinned DEV URL.
Laboratory details are read from the ignored `.env.ahr` file and are only used
if the DEV account needs the initial setup. To run one AHR scenario, pass its
exact name:

```bash
npm run test:local:dev:ahr -- "DEV AHR report file is required"
```

### Running the TEST journeys

The TEST-only BR and AHR features mirror the scenarios in their DEV feature
files and are tagged `@test`, so normal feature-suite runs exclude them. The
BR happy path submits a report to TEST. The AHR happy paths submit reports, and
the setup helper may update the TEST lab profile if diagnostic tests are not
configured. Run these commands only when those changes are intended:

```bash
npm run test:local:test
npm run test:local:test:ahr
```

Both runners use
`https://apha-sdo-system.test.cdp-int.defra.cloud`. Credentials are read from
`TEST_ENTRA_USERNAME` and `TEST_ENTRA_PASSWORD` in the ignored `.env` file.
If those are not set, the runner reuses `DEV_ENTRA_USERNAME` and
`DEV_ENTRA_PASSWORD`; otherwise it prompts for the password without echoing it.
The username defaults to the DEV test account used by the DEV runner.

The AHR runner also reads `.env.ahr`. Use `TEST_LAB_ADDRESS_LINE_1`,
`TEST_LAB_ADDRESS_LINE_2`, `TEST_LAB_TOWN`, and `TEST_LAB_POSTCODE` there if
the TEST account requires first-time laboratory setup. Existing `DEV_LAB_*`
values are used as fallback. To run one scenario, pass its exact name, for
example:

```bash
npm run test:local:test:ahr -- "TEST AHR report file is required"
```

### Debugging local tests

```bash
npm run test:local:debug
```

## Production

### Running the tests

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

For a CDP Portal TEST run, select `test` in the Run panel. The WebdriverIO
configuration uses the selected environment to target the TEST system service
and run scenarios tagged `@test`. Add `TEST_ENTRA_USERNAME` and
`TEST_ENTRA_PASSWORD` in the Test Suite's Secrets tab; the password must remain
a secret. Credentials in a local `.env` file are not copied into the CDP
container. Do not commit credentials to the repository.

If AHR needs to complete first-time laboratory setup, CDP secret values for the
address may not contain spaces. Add each laboratory detail as a separate
Base64-encoded secret value:

- `TEST_LAB_ADDRESS_LINE_1_BASE64`
- `TEST_LAB_TOWN_BASE64`
- `TEST_LAB_POSTCODE_BASE64`
- `TEST_LAB_ADDRESS_LINE_2_BASE64` (optional)

Encode each original value locally in PowerShell, one at a time, using:

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Read-Host "Laboratory detail")))
```

Paste only the encoded output into that secret's value field. The test decodes
the value before entering it in the form. Keep these secrets scoped to Test;
never put the original or encoded values in source control. Local runs continue
to use plain `TEST_LAB_*` or `DEV_LAB_*` values from `.env.ahr`.

## Requirements of CDP Environment Tests

1. Your service builds as a docker container using the `.github/workflows/publish.yml`
   The workflow tags the docker images allowing the CDP Portal to identify how the container should be run on the platform.
   It also ensures its published to the correct docker repository.

2. The Dockerfile's entrypoint script should return exit code of 0 if the test suite passes or 1/>0 if it fails

3. Test reports should be published to S3 using the script in `./bin/publish-tests.sh`

## Running on GitHub

Alternatively you can run the test suite as a GitHub workflow.
Test runs on GitHub are not able to connect to the CDP Test environments. Instead, they run the tests agains a version of the services running in docker.
A docker compose `compose.yml` is included as a starting point, which includes the databases (mongodb, redis) and infrastructure (localstack) pre-setup.

Steps:

1. Edit the compose.yml to include your services.
2. Modify the scripts in docker/scripts to pre-populate the database, if required and create any localstack resources.
3. Test the setup locally with `docker compose up` and `npm run test:github`
4. Set up the workflow trigger in `.github/workflows/journey-tests`.

By default, the provided workflow will run when triggered manually from GitHub or when triggered by another workflow.

If you want to use the repository exclusively for running docker composed based test suites consider displaying the publish.yml workflow.

## BrowserStack

Two WebdriverIO configuration files are provided for BrowserStack:
`wdio.browserstack.conf.js` for `npm run test:browserstack` and
`wdio.github.browserstack.conf.js` for `npm run test:github:browserstack`.
The BrowserStack configuration runs the Cucumber features under
`test/features` using the step definitions under `test/steps`.

In the CDP Test Suite's Secrets tab, configure `BROWSERSTACK_USERNAME` and
`BROWSERSTACK_KEY` with your BrowserStack account credentials. To run against
TEST, select `test` in the Run panel and configure `TEST_ENTRA_USERNAME` and
`TEST_ENTRA_PASSWORD` with the TEST application account credentials. For DEV,
use `DEV_ENTRA_USERNAME` and `DEV_ENTRA_PASSWORD`. The environment selection
chooses the matching APHA SDO system URL and `@test` or `@dev` feature tag.
These journeys can submit reports or update diagnostic-test settings in the
selected environment, so run them only when those changes are intended.

Runs are reported to the BrowserStack Test Observability project
`cdp-node-env-test-suite`. See the CDP documentation for configuring and
running BrowserStack-enabled test suites.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
