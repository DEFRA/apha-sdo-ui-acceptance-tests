@dev
Feature: APHA SDO Animal Health Regulations DEV journeys

  Scenario: DEV upload an Animal Health Regulations report
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    Then Animal Health Regulations reporting is available
    Then the User selects Animal Health Regulations report
    When the User chooses to upload an AHR file
    And the User enters the AHR reporting month and year
    When the User uploads the AHR report spreadsheet
    Then the AHR summary shows May 2021
    When the User submits the AHR report
    Then the AHR Form submitted confirmation displays a reference number

  Scenario: DEV submit an AHR report using the web form
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    Then the User selects Animal Health Regulations report
    When the User chooses to complete an AHR web form
    And the User enters the AHR web-form reporting month and year
    And the User selects the first pathogen
    And the User selects Other as the species
    And the User enters other species as "test"
    And the User selects "England" as the country
    And the User enters the AHR web-form submission totals
    Then the AHR report entries page shows one entry
    When the User continues to check AHR web-form answers
    Then the AHR web-form answers are ready to submit
    When the User confirms and submits the AHR web form
    Then the AHR Form submitted confirmation displays a reference number

  Scenario: DEV diagnostic tests must be selected
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User opens AHR diagnostic test settings
    When the User continues without selecting diagnostic tests
    Then the diagnostic test selection error is displayed

  Scenario: DEV selected diagnostic tests require accreditation
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User opens AHR diagnostic test settings
    When the User selects Mycoplasma PCR without choosing accreditation
    Then the diagnostic test accreditation error is displayed

  Scenario: DEV AHR report method must be selected
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    When the User opens the AHR report method page
    And the User continues without choosing an AHR report method
    Then the AHR report method validation error is displayed

  Scenario: DEV AHR reporting period is required
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    When the User opens the AHR reporting period page
    And the User continues without entering the AHR reporting period
    Then the AHR reporting period month error is displayed

  Scenario: DEV AHR reporting period requires a month
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    When the User opens the AHR reporting period page
    And the User enters only the AHR reporting year
    Then the AHR reporting period month error is displayed

  Scenario: DEV AHR reporting period requires a year
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    When the User opens the AHR reporting period page
    And the User enters only the AHR reporting month
    Then the AHR reporting period year error is displayed

  Scenario: DEV AHR report file is required
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    When the User opens the AHR reporting period page
    And the User enters the AHR reporting month and year
    And the User continues without uploading an AHR report file
    Then the AHR report file validation error is displayed

  Scenario: DEV AHR diagnostic test status must be confirmed before submission
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to DEV with environment credentials
    And the User ensures AHR reporting is available
    When the User opens the AHR reporting period page
    And the User enters the AHR reporting month and year
    And the User uploads the AHR report spreadsheet
    And the User submits the AHR report without confirming diagnostic tests
    Then the AHR diagnostic test confirmation error is displayed
