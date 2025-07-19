// Tests generally have to form of
// 1. arrange things
// 2. act (e.g., click buttons)
// 3. assert results (e.g., check that the page changed)

// a couple of tips
// if you change any describe to describe.only then it will only run that test group
// within a describe if you change any if to if.only then it will only run that test

// cy.clearLocalStorage() clears the local storage
// cy.get().should('be.visible') checks if the element is visible
// cy.get().should('not.be.visible') checks if the element is not visible

describe('user flow', () => {
  beforeEach(() => {
    // interestingly setting the viewport in the before each works better
    cy.viewport(1000, 1200) // cy.viewport('iphone-11)
    cy.visit(Cypress.env('VITE_DEPLOY_BASE_PATH'))
  })

  it('completes the experiment without issue', () => {
    // verify the first ad page is loaded
    cy.get('.title').should('contain', 'Please help us')

    // consent page
    cy.contains("I'm ready!").click() // click the continue button
    cy.url().should('include', '/consent') // should go to consent next
    cy.get('.consentbox').should('contain', 'We first must verify') // verify it loaded by checking text on the page
    cy.get('.formkit-outer').get('[name="consent_toggle"]').check({ force: true }) // required with formkit, sorry, toggles the consent switch
    cy.contains("Let's start").click() // continue now

    // demographic page
    cy.url().should('include', '/demograph') // should go to demographic survey next
    // select dob
    cy.get('[name="dob"]').type('1990-01-01')
    // select gender
    cy.get('[name=gender]').select('Male')
    // select race
    cy.get('[name=race]').select('Asian')
    // select hispanic
    cy.get('[name=hispanic]').select('No')
    // select fluent
    cy.get('[name=english]').select('Yes')
    // click button
    cy.contains('Continue').click()

    // next page
    cy.get('[name=vision').select('Yes')

    cy.get('[name=colorblind').select('Yes')

    cy.get('[name=learningdisability').select('Yes')
    cy.get('[name=neurodevelopmentaldisorder').select('Yes')
    cy.get('[name=psychiatricdisorder').select('Yes')
    cy.contains('Continue').click()

    cy.get('[name=country]').select('United States')
    cy.get('[name=zipcode]').type('12345')
    cy.get('[name=education]').select('Secondary Education (ie. GED/GCSE)')
    cy.get('[name=income]').select('Less than $20,000')
    cy.contains('That was easy!').click()

    cy.url().should('include', '/exp') // should go to the "exp" next
    cy.contains('next').click() // click to continue
    cy.url().should('include', '/debrief') // should end up on the "debrief" page
    cy.contains('next').click() // click to continue
    cy.url().should('include', '/thanks') // should end up at the "thanks" page
  })

  it('falls for the honeypot', () => {
    // if you type text into the honey pot then
    // you'll get flagged
  })
})

// mischief agents
// runs test corresponding to non-compliant/lazy participants
describe('mischief agents', () => {})

// tests that state is updated correct
describe('state integrity', () => {})

// tests for data integrity
// checks that firebase data is correct given
// user actions
describe('data integrity', () => {})
