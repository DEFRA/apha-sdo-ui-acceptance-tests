Feature: APHA SDO Bat Rabies Journey

    Validate Bat Rabies Journey

Scenario: Bat Rabies valid journey
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User sign in with Defra ID
    Then the User selects Bat Rabies Surveillance Report
    When the User inputs the report date of sample collection
    And the User upload the Surveillance sample collection file
    Then application displays the screen to check given information
    When the User confirms the information
    Then 'Form submitted' banner should display     

Scenario: Change sample details report year
    Given the User access APHA SDO portal
    And the User login to SDO
    When the User sign in with Defra ID
    Then the User selects Bat Rabies Surveillance Report
    When the User inputs the report date of sample collection
    And the User upload the Surveillance sample collection file
    Then application displays the screen to check given information
    When the User decides to change report year as '2050'
    Then application displays the screen with updated year as '2050'

Scenario: Access Contact
     Given the User access APHA SDO portal
     When the User cicks Contact link
     Then application should redirects to contact screen

Scenario: Redirect APHA's Dashboard
     Given the User access APHA SDO portal
     When the User cicks APHA Dashboard link
     Then application shoudl redirects to Dashboard screen
  
Scenario: Accessibility Testing - check APHA SDO Frontend Journey
    Given check APHA SDO Frontend for accessiblity issues    

Scenario: Accessibility Testing - check APHA SDO Frontend Contact screen
    Given check APHD SDO Contact screen for accessiblity issues
