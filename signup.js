const aws = require('aws-sdk');
const http = require('https');
const crypto = require("crypto");

const BUCKET = process.env.BUCKET || 'loimg';
const region = process.env.AWS_REGION || 'eu-central-1';

function get(url, callback) {
    http.get(url, function(response) {
        if (response.headers.location) {
            get(response.headers.location, callback);
        } else {
            callback(response);
        }
    });
}

function parse(identities) {
    if (identities) {
        const data = JSON.parse(identities);
        const identity = data.length && data[0];
        const userId = identity.userId;
        return `https://graph.facebook.com/v8.0/${userId}/picture`;
    }
}

exports.handler = function(event, context, callback) {
    const ddb = new aws.DynamoDB({ region });
    const s3 = new aws.S3();
    const uuid = crypto.randomBytes(16).toString("hex");

    if (event.request.userAttributes) {
        console.log(event.request.userAttributes);

        const {sub, given_name, family_name, name, email, picture, identities, 'cognito:user_status': status} = event.request.userAttributes;
        let avatar = 'default.png';
        if (status === 'EXTERNAL_PROVIDER') {
            const url = picture || parse(identities);
            avatar = uuid+'.jpg';
            get(url, (res) => {
                if (200 !== res.statusCode) return;
                const params = {
                    ACL: 'public-read',
                    Body: res,
                    ContentLength: res.headers['content-length'],
                    Bucket: BUCKET,
                    Key: avatar
                };
                s3.putObject(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log(data);           // successful response
                });
            });
        }

        const params = {
            TableName: 'users',
            Item: {
                'id' : {S: sub},
                'email' : {S: email},
                'avatar' : {S: avatar},
                'permalink' : {S: `User-${sub.slice(24)}`},
                'created_at': {S: (new Date()).toJSON()},
            }
        };

        if (name) params.Item['full_name'] = {S: name};
        if (given_name) params.Item['first_name'] = {S: given_name};
        if (family_name) params.Item['last_name'] = {S: family_name};

        ddb.putItem(params, function(err, data) {
            if (err) {
                console.log('Error', err);
            } else {
                console.log('Success', data);
            }
        });

    }
    callback(null, event);
};
