/**
 * Created by Maksym Krutskykh on 15/10/16.
 */
'use strict';

var faker = require('faker/locale/en_US');
var chai = require('chai');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);
var chaiMatchPattern = require('chai-match-pattern');
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
var env = require('../../support/env');

var CustomersStepsWrapper = function () {

    var self = this;

    self.lastResponse = null;
    self.baseUrl = env.BASE_URL;
    self.binfindUrl = env.BINFIND_URL;
    self.apiKeyTestSecure = env.API_TEST_KEY_SEC;
    self.apiKeyTestPublic = env.API_TEST_KEY_PUB;
    self.requestBody = {};
    self.userObject = {};
    self.id = null;

    this.When(/^I do POST request to "([^"]+)" endpoint$/, function (endpoint, callback) {
        sendPostRequest(endpoint, callback);
    });

    this.When(/^I do GET request to "([^"]+)" endpoint$/, function (endpoint, callback) {
        if (assertEndpointHasString(endpoint, "_ID")) {
            endpoint = "customers/" + self.id
        }
        sendGetRequest(endpoint, callback);
    });

    this.When(/^I generate new user data$/, function () {
        self.requestBody = generateUserObject();
        console.log("\n\nNew user data generated: " + JSON.stringify(self.requestBody, undefined, 2) + "\n\n")
    });

    this.Then(/^The response property "(.*)" should be "(.*)"$/i, function (property, expectedValue, callback) {
        if (!assertResponse(self.lastResponse, callback)) {
            return
        }
        var responseBody = self.lastResponse.body;
        try {
            chai.assert.equal(responseBody[property], expectedValue);
            callback()
        } catch (e) {
            callback('The last response did not have the expected ' +
                'property value, expected ' + expectedValue + ' but got ' +
                responseBody[property])
        }
    });

    this.Then(/^the response has object "([^"]*)"$/, function (object, callback) {
        if (!assertResponse(self.lastResponse, callback)) {
            return
        }
        var responseBody = self.lastResponse.body;
        try {
            chai.expect(responseBody[object]).to.exist;
            callback()
        } catch (e) {
            callback('The last response did not have the expected ' +
                'object, expected ' + object + ' but got ' +
                responseBody[object])
        }
    });

    this.Then(/^The response has object "(.*)" with property "(.*)" set as "(.*)"$/i, function (object, property, expectedValue, callback) {
        if (!assertResponse(self.lastResponse, callback)) {
            return
        }
        var responseBody = self.lastResponse.body;
        try {
            chai.assert.equal(responseBody[object][property], expectedValue);
            callback()
        } catch (e) {
            callback('The last response did not have the expected ' +
                object + ' object property value, expected ' + expectedValue + ' but got ' +
                responseBody[property])
        }
    });

    this.Then(/^The response status code should be (\d+)$/i, function (status, callback) {
        if (!assertResponse(self.lastResponse, callback)) {
            return
        }
        try {
            chai.assert.equal(self.lastResponse.statusCode, status);
            callback()
        } catch (e) {
            callback('The last response did not have the expected ' +
                'status, expected ' + status + ' but got ' +
                self.lastResponse.statusCode)
        }
    });

    function assertResponse(lastResponse, callback) {
        if (!lastResponse) {
            callback(new Error('No request has been made until now.'));
            return false
        }
        return true
    }

    function assertEndpointHasString(endpoint, part) {
        if (endpoint.indexOf(part) !== -1) {
            return true
        }
        return false
    }

    function getHeaderValues(endpoint) {
        if (assertEndpointHasString(endpoint, "customers")) {
            var headerValues = {
                'Authorization': 'Bearer ' + self.apiKeyTestSecure,
                'Content-Type': 'application/json'
            }
        } else {
            headerValues = {'Content-Type': 'application/json'}
        }
        return headerValues
    }

    function generateUserObject() {
        const newUserFirstName = faker.name.firstName();
        const newUserLastName = faker.name.lastName();
        const newUserEmail = faker.internet.email(newUserFirstName, newUserLastName);
        const addressObject = {
            "street1": faker.address.streetAddress(),
            "street2": faker.address.secondaryAddress(),
            "city": faker.address.city(),
            "postalCode": faker.address.zipCode(),
            "phone": faker.phone.phoneNumber(),
            "country": faker.address.country(),
            "region": faker.address.county()
        };
        self.userObject = self.userObject || {};
        _.set(self.userObject, "firstName", newUserFirstName);
        _.set(self.userObject, "lastName", newUserLastName);
        _.set(self.userObject, "email", newUserEmail);
        _.set(self.userObject, "address", addressObject);

        return self.userObject
    }

    function sendPostRequest(endpoint, callback) {
        var uri = self.baseUrl + endpoint;
        // console.log("\n\nCall will be made to url: " + uri + "\n\n");
        // console.log("\n\nRequest body to consist of: " + JSON.stringify(self.requestBody, undefined, 2) + "\n\n");
        var headerValues = getHeaderValues(endpoint);

        chai.request(self.baseUrl)
            .post(endpoint)
            .set(headerValues)
            .send(self.requestBody)
            .end(
                function (error, response) {
                    if (error) {
                        return callback(new Error('Error on POST request to ' + uri + ': ' +
                            error.message))
                    }
                    var data = response.body;
                    // callback(console.log("\n\nResponse code is: " + response.statusCode + "\n\n"));
                    // callback(console.log("\n\nResponse is: " + JSON.stringify(data, undefined, 2) + "\n\n"));
                    self.lastResponse = response;
                    if (assertEndpointHasString(endpoint, "customers")) {
                        self.id = data["id"];
                    }
                    callback()
                }
            )
    }

    function sendGetRequest(endpoint, callback) {
        if (assertEndpointHasString(endpoint, "json")) {
            self.baseUrl = self.binfindUrl;
        }
        var uri = self.baseUrl + endpoint;
        // console.log("\n\nCall will be made to url: " + uri + "\n\n");
        var headerValues = getHeaderValues(endpoint);
        chai.request(self.baseUrl)
            .get(endpoint)
            .set(headerValues)
            .end(
                function (error, response) {
                    if (error) {
                        return callback(new Error('Error on GET request to ' + uri + ': ' +
                            error.message))
                    }
                    var data = response.body;
                    // callback(console.log("\n\nResponse code is: " + response.statusCode + "\n\n"));
                    // callback(console.log("\n\nResponse is: " + JSON.stringify(data, undefined, 2) + "\n\n"));
                    self.lastResponse = response;
                    callback()
                }
            )
    }

    function sleep(sleepDuration) {
        var now = new Date().getTime();
        while (new Date().getTime() < now + sleepDuration * 1000) { /* do nothing */
        }
    }

};

module.exports = CustomersStepsWrapper;