const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const userPoolId = 'eu-west-1_UAZ0cpt67';
const region = 'eu-west-1';
const iss = 'https://cognito-idp.' + region + '.amazonaws.com/' + userPoolId;
const pems = {
    'M/Ngdl0ZAbmt+PR5Pn0f1effXlJErK6XMBpWksDWeo0=':
`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApUNGnwbBtR4b48AB4iBN
9J/KLsgyLzbhoP5GOVYVmV+e/RLxzkEZPUpi0UYcrXNueO5V/Sjn7yc0i2Uj6XbU
ah/gHvozlB63qQvUUNVxUDrzIBPA8Gztdd4c0Q4z4C4iKbvdd15Tlz9J0GEUSba5
fvcCMOEiEM+Stzo2l7+YGOZ/lmpGdPNlC6R/geqaO1lSZWZOrvR0G5jh3pUUlGtI
UKP+XYmCGqb6BgJ15RPKRTt2uJph1+Bf1hbQPgH5rj0pQAPsMPMYOji4tXAfJOpj
xo6Adq0dktv8yImHwxQ75j0lBviwZIDxEp0/bcKXga6gTS8j5T152Tqx+VVd7Jg/
/QIDAQAB
-----END PUBLIC KEY-----`,
    'AaJ5bEwP90TJjUcvvWgSP5WquSChVEm7UxIEX64+o84=':
`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAugH+du3jXZYakJCRFi4G
Io6b/RSbSKEdghJxOwZ+80KcYAhJ7v63CBp4s5VG7Z8SmCz6Pg2ApClIY1Uceqpq
dnLEq2QAeW39QfptpAyAZ5X+JN/mel/vk/3p4cwWy5tiaF5uy8SA74BkvsPyU0Mj
TC7Oa0dlEu3VVQm4TWvJ3D6sxckTmcvZh6T9FPxdHMNP2NKJ+jJ72mvEYuST9jhR
kcGSuYaTQEMU5OhtB5j7TRlWHXq32TNMPvHACd2glU6XZRbf78p66X8usuE3/cwu
Go49N/ZbOFPo28jNo36+AUQpJ5Ep8atrnyk4MGgnw2rKwh0fyGl33VzP3QY1tSno
cwIDAQAB
-----END PUBLIC KEY-----`};

exports.handler = function(event, context) {
    const token = event.authorizationToken;

    // Create the DynamoDB service object
    var ddb = new AWS.DynamoDB.DocumentClient();

    const decodedJwt = jwt.decode(token, {complete: true});
    if (!decodedJwt) {
        console.log("Not a valid JWT token");
        context.fail("Unauthorized");
        return;
    }

    //Fail if token is not from your UserPool
    if (decodedJwt.payload.iss != iss) {
        console.log("invalid issuer");
        context.fail("Unauthorized");
        return;
    }

    //Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use != 'access') {
        console.log("Not an access token");
        context.fail("Unauthorized");
        return;
    }

    //Get the kid from the token and retrieve corresponding PEM
    const kid = decodedJwt.header.kid;
    const pem = pems[kid];
    if (!pem) {
        console.log('Invalid access token');
        context.fail("Unauthorized");
        return;
    }

    //Verify the signature of the JWT token to ensure it's really coming from your User Pool

    jwt.verify(token, pem, { issuer: iss }, function(err, payload) {
        if(err) {
            context.fail("Unauthorized");
        } else {
            const principalId = payload.sub;
            const params = {
                TableName: 'users',
                Key: {
                    'id': principalId,
                }
            };

            // Call DynamoDB to read the item from the table
            ddb.get(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    context.fail("Unauthorized");
                } else {
                    const policy = {
                        principalId,
                        policyDocument: {
                            Version: '2012-10-17',
                            Statement:[{
                                Action: "execute-api:Invoke",
                                Effect: "Allow",
                                Resource:
                                    "arn:aws:execute-api:eu-west-1:752834445375:g2r7hs31e9/*/*/*"
                            }]
                        },
                        context: data.Item
                    };
                    context.succeed(policy);
                }
            });
        }
    });
};

