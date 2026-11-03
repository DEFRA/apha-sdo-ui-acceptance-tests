@test
Feature: APHA SDO Bat Rabies TEST journey

  Scenario Outline: TEST home page link opens its destination
    Given the User access APHA SDO portal
    When the User clicks the home page link "<link>"
    Then the browser opens the page titled "<title>"

    Examples:
      | link                                            | title                                                                  |
      | Continue to Surveillance data submission portal | How do you want to sign in? \| apha-sdo-system                          |
      | Privacy                                         | Privacy notice - GOV.UK                                                |
      | Cookies                                         | Cookies on GOV.UK - GOV.UK                                             |
      | Accessibility statement                        | Accessibility statement for www.gov.uk - GOV.UK                        |
      | Go to APHA Dashboard                            | APHA animal surveillance reports, publications and dashboards - GOV.UK |
      | Open Government Licence v3.0                    | Open Government Licence                                                |
      | © Crown copyright                               | Crown copyright - Re-using PSI                                         |

  Scenario: TEST sign-in method is required
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User continues without selecting a sign-in method
    Then the sign-in method validation error is displayed

  Scenario: TEST Bat Rabies valid journey
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User inputs reporting month "06" and year "2025"
    And the User uploads the June 2025 Surveillance sample collection file
    Then application displays the screen to check given information for "June 2025"
    When the User confirms the information
    Then the Form submitted confirmation page should display

  Scenario: TEST remove an uploaded Bat Rabies report file
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User inputs the report date of sample collection
    And the User uploads a Bat Rabies file for removal
    And the User chooses to remove the uploaded Bat Rabies file
    And the User confirms removal of the Bat Rabies file

  Scenario: TEST back links preserve progress through the Bat Rabies journey
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User follows the reporting period back link
    Then Submission Welcome is displayed
    When the User selects Bat Rabies Surveillance Report
    And the User inputs the report date of sample collection
    When the User follows the upload back link
    Then the reporting period is still May 2025
    When the User continues to the Bat Rabies upload page
    Then the upload page requires a filename for May 2025

  Scenario: TEST back from check your answers keeps the uploaded Bat Rabies file
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User inputs the report date of sample collection
    And the User upload the Surveillance sample collection file
    When the User follows the summary back link
    Then the uploaded Bat Rabies file is still available

  Scenario: TEST changing the reporting period rejects a file named for the old period
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User inputs the report date of sample collection
    And the User upload the Surveillance sample collection file
    When the User opens the reporting period change link
    And the User changes the reporting month to "06" and year to "2025"
    Then the previously uploaded Bat Rabies file must be replaced

  Scenario: TEST Submission Welcome requires a submission action
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    And the User continues without selecting a submission action
    Then the submission action validation error is displayed

  Scenario: TEST Bat Rabies reporting period is required
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User continues without entering a reporting period
    Then the reporting period error says a month is required

  Scenario: TEST Bat Rabies reporting period requires a month
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User enters only the reporting year
    Then the reporting period error says a month is required

  Scenario: TEST Bat Rabies reporting period requires a year
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User enters only the reporting month
    Then the reporting period error says a year is required

  Scenario: TEST Bat Rabies report file is required
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User signs in to TEST with environment credentials
    Then the User selects Bat Rabies Surveillance Report
    When the User inputs the report date of sample collection
    And the User continues without uploading a report file
    Then the report file validation error is displayed
