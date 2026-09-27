describe("Register", () => {
    beforeEach(() => {
        cy.visit("/register");
    })
    it("should allow a user to register as a candidate", () => {
        cy.get('div.mb-4 > input[type="email"]').as("email");
        cy.get('div.mb-6 > div.relative > input[id="password"]').as("password");
        cy.get('div.mb-6 > div.relative > input[id="confirmPassword"]').as("confirmPassword");

        cy.get('@email').type("teste@email.com")
        .should("have.value","teste@email.com");
        cy.get('@password').type("Testes1!")
        .should("have.value","Testes1!");
        cy.get('@confirmPassword').type("Testes1!")
        .should("have.value","Testes1!");  
        cy.get('button[type="submit"]').click();
    })

    it("should allow a user to register as a company", () => {
        cy.get('div.mb-4 > input[type="email"]').as("email");
        cy.get('div.mb-6 > div.relative > input[id="password"]').as("password");
        cy.get('div.mb-6 > div.relative > input[id="confirmPassword"]').as("confirmPassword");
        
        cy.get('#companyButton').click();
        cy.get('@email').type("teste@email.com")
        .should("have.value","teste@email.com");
        cy.get('@password').type("Testes1!")
        .should("have.value","Testes1!");
        cy.get('@confirmPassword').type("Testes1!")
        .should("have.value","Testes1!");  
        cy.get('button[type="submit"]').click();
    });

    it("should allow a user to register as a mentor", () => {
        cy.get('div.mb-4 > input[type="email"]').as("email");
        cy.get('div.mb-6 > div.relative > input[id="password"]').as("password");
        cy.get('div.mb-6 > div.relative > input[id="confirmPassword"]').as("confirmPassword");

        cy.get('#mentorButton').click();
        cy.get('@email').type("teste@email.com")
        .should("have.value","teste@email.com");
        cy.get('@password').type("Testes1!")
        .should("have.value","Testes1!");
        cy.get('@confirmPassword').type("Testes1!")
        .should("have.value","Testes1!");  
        cy.get('button[type="submit"]').click();
    });

    it("should show an error message when the email is invalid", () => {
        cy.get('div.mb-4 > input[type="email"]').as("email");
        cy.get('div.mb-6 > div.relative > input[id="password"]').as("password");
        cy.get('div.mb-6 > div.relative > input[id="confirmPassword"]').as("confirmPassword");

        cy.get('@email').type("teste")
        .should("have.value","teste");
        cy.get('@password').type("Testes1!")
        .should("have.value","Testes1!");
        cy.get('@confirmPassword').type("Testes1!")
        .should("have.value","Testes1!");  
        cy.get('button[type="submit"]').click();

        cy.get('@email').then(($email) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            expect($email[0].checkValidity()).to.be.false;
            expect($email[0].validationMessage).to.include("@");
        });
    });

    it("should block submit when any password requirement is missing", () => {
        const cases = [
            { password: "Test1!", missingRequirement: 0 }, // Fewer than 8 characters
            { password: "testes1!", missingRequirement: 1 }, // No uppercase letter
            { password: "TESTES1!", missingRequirement: 2 }, // No lowercase letter
            { password: "Testes!!", missingRequirement: 3 }, // No number
            { password: "Testes12", missingRequirement: 4 }, // No special character
        ];

        cy.intercept("POST", "/api/auth/register").as("register");

        cases.forEach(({ password, missingRequirement }) => {
            cy.get('input[type="email"]').clear().type("teste@email.com");
            cy.get('#password').clear().type(password);
            cy.get('#confirmPassword').clear().type(password);

            cy.get('#password').parent().parent().find("li").each(($requirement, index) => {
                if (index === missingRequirement) {
                    cy.wrap($requirement).should("have.class", "text-gray-500");
                } else {
                    cy.wrap($requirement).should("have.class", "text-green-600");
                }
            });

            cy.get('button[type="submit"]').click();
            cy.contains("A senha não atende aos requisitos.").should("be.visible");
            cy.get("@register.all").should("have.length", 0);
        });
    });
});

