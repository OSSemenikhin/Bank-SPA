/// <reference types="cypress" />
const url = 'http://localhost:8080';
const urlServer = 'http://localhost:3000';

describe("Coin app test", () => {
  beforeEach(() => {
    cy.visit(url);
  });

  //  Authorization
  it("Authorization passes correctly", () => {
    cy.get('#nav').then(($nav) => {
      if (!$nav.hasClass('header-nav--hidden')) {
        cy.get('#logout').click();
        cy.reload();
      }
    }).then(() => {
      cy.get('#login').type('developer');
      cy.get('#pass').type('skillbox');
      cy.get('.login__button').click();
      cy.url().should('not.include', '/login');
    });
  });

  // Accaunts list
  it("Accaunts list", () => {
    cy.intercept({
      method: 'GET',
      url: `${urlServer}/accounts`,
    }).as('checkList');
    cy.visit(url);
    cy.wait('@checkList').then((interception) => {
      assert.isNotNull(interception.response.body, 'API call has data');
    });
    cy.get('#main_list');
    cy.get('.main-content__item');
  });

  // Transaction
  it("Transaction", () => {
    cy.get('[href="/view#74213041477477406320783754"]').click();
    cy.intercept({
      method: 'POST',
      url: `${urlServer}/transfer-funds`,
    }).as('checkTransaction');
    cy.get('#recipient').type('61253747452820828268825011');
    cy.get('#summ').type('100');
    cy.get('.view-main__button').click();
    cy.wait('@checkTransaction').then((interception) => {
      assert.isNotNull(interception.response.body, 'API call has data');
    });
  });

  //  New account and transaction
  it("New account and transaction", () => {
    cy.intercept({
      method: 'POST',
      url: `${urlServer}/create-account`,
    }).as('checkNew');

    cy.intercept({
      method: 'POST',
      url: `${urlServer}/transfer-funds`,
    }).as('checkTransaction');

    cy.reload().then(() => {
      cy.get('.main__new-bill').click();
      cy.wait('@checkNew').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        const resp = JSON.parse(interception.response.body)
        cy.visit(`${url}/view#${resp.payload.account}`);
      });
    });

    cy.get('#recipient').type('61253747452820828268825011');
    cy.get('#summ').type('100');
    cy.get('.view-main__button').click();
    cy.wait('@checkTransaction').then((interception) => {
      assert.isNotNull(interception.response.body, 'API call has data');
    });
  });
});
