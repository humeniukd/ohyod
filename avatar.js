const AWS = require('aws-sdk');
const crypto = require("crypto");

const BUCKET = process.env.BUCKET || 'hamedia';
const CDN = process.env.CDN || 'https://s.tuq.me';

exports.handler = async (event) => {
    const ddb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    const s3 = new AWS.S3();
    const Key = `${crypto.randomBytes(16).toString("hex")}.jpg`;
    const {body, pathParameters} = event;
    const Body = new Buffer(body, 'base64');
    const params = {
        TableName: 'users',
        Key: { id: pathParameters.id },
        UpdateExpression: 'set avatar_url = :a',
        ExpressionAttributeValues: {
            ':a': `${CDN}/${Key}`,
        }
    };
    try {
        await s3.putObject({
            Key,
            Body,
            ACL: 'public-read',
            Bucket: BUCKET,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        }).promise();

        const res = await ddb.update(params).promise();
        console.log('Success: ', res);

        console.log('Error: ', res)
    } catch (e) {
        console.log('Error: ', e)
    }
};

exports.handler({
        "resource": "/users/{id}",
        "path": "/users/79708eb4-55b9-4314-9677-9274b2a18bfd",
        "httpMethod": "PUT",
        "headers": {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding": "br, gzip, deflate",
            "Accept-Language": "en-us",
            "Authorization": "eyJraWQiOiJBYUo1YkV3UDkwVEpqVWN2dldnU1A1V3F1U0NoVkVtN1V4SUVYNjQrbzg0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3OTcwOGViNC01NWI5LTQzMTQtOTY3Ny05Mjc0YjJhMThiZmQiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNTUxNzIwODYwLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9VQVowY3B0NjciLCJleHAiOjE1NTE3MjQ0NjAsImlhdCI6MTU1MTcyMDg2MSwidmVyc2lvbiI6MiwianRpIjoiZTI2ZmFkMzYtZDYyOC00OTBjLWJhYmItYWY5MWRhNjkxMDljIiwiY2xpZW50X2lkIjoiMzJiajVtbmtwM2U0aGQ3N2ptNHRjczlnYjciLCJ1c2VybmFtZSI6Ijc5NzA4ZWI0LTU1YjktNDMxNC05Njc3LTkyNzRiMmExOGJmZCJ9.o7mTgb2dAsbC6KqBqZwO93oNi1_cBjouTo9OUM5Q6erYzGwiLXoImSAW9HIwm1ZXSAmjPhoWoZNh0NEVX5NoOGKM-GOncg76s2M1cvUdm-FqgCh8cE0E8GK6XwujvPlKt-eOT4No_waqGyMSfISU9HWmFsRldXEESkLWZDZprT13g5G22FTN3WR_IxW0pzpekwEj_h8XYqxoH40UcID0ufhIpZJhCIBK2sj5Tyi2jfOgqUKeeep35TpXCXG26em4KxDAX2U6s_Tj8IlgNWVlvNKIkDw7dT2u_bxGP9LZ3S9rx4vGb-z5VK0_Bw_gSuyEGYKAlDl49hoKSGluQRiP-w",
            "CloudFront-Forwarded-Proto": "https",
            "CloudFront-Is-Desktop-Viewer": "true",
            "CloudFront-Is-Mobile-Viewer": "false",
            "CloudFront-Is-SmartTV-Viewer": "false",
            "CloudFront-Is-Tablet-Viewer": "false",
            "CloudFront-Viewer-Country": "PL",
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOytScKML3sK2ZC0y",
            "Host": "api.tuq.me",
            "origin": "https://tuq.me",
            "Referer": "https://tuq.me/user-1551223257",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15",
            "Via": "2.0 89879a0242d5d2d5537231b1e168f07f.cloudfront.net (CloudFront)",
            "X-Amz-Cf-Id": "zz7exSErtIVpBo0A7MlYFo9qTyEc9phDWW90_8Nl0MopQ5zxOpTHmA==",
            "X-Amzn-Trace-Id": "Root=1-5c7d6c04-daa9b1547175ea1cab005388",
            "X-Forwarded-For": "104.132.189.96, 54.239.171.153",
            "X-Forwarded-Port": "443",
            "X-Forwarded-Proto": "https"
        },
        "multiValueHeaders": {
            "Accept": [
                "application/json, text/javascript, */*; q=0.01"
            ],
            "Accept-Encoding": [
                "br, gzip, deflate"
            ],
            "Accept-Language": [
                "en-us"
            ],
            "Authorization": [
                "eyJraWQiOiJBYUo1YkV3UDkwVEpqVWN2dldnU1A1V3F1U0NoVkVtN1V4SUVYNjQrbzg0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3OTcwOGViNC01NWI5LTQzMTQtOTY3Ny05Mjc0YjJhMThiZmQiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNTUxNzIwODYwLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV9VQVowY3B0NjciLCJleHAiOjE1NTE3MjQ0NjAsImlhdCI6MTU1MTcyMDg2MSwidmVyc2lvbiI6MiwianRpIjoiZTI2ZmFkMzYtZDYyOC00OTBjLWJhYmItYWY5MWRhNjkxMDljIiwiY2xpZW50X2lkIjoiMzJiajVtbmtwM2U0aGQ3N2ptNHRjczlnYjciLCJ1c2VybmFtZSI6Ijc5NzA4ZWI0LTU1YjktNDMxNC05Njc3LTkyNzRiMmExOGJmZCJ9.o7mTgb2dAsbC6KqBqZwO93oNi1_cBjouTo9OUM5Q6erYzGwiLXoImSAW9HIwm1ZXSAmjPhoWoZNh0NEVX5NoOGKM-GOncg76s2M1cvUdm-FqgCh8cE0E8GK6XwujvPlKt-eOT4No_waqGyMSfISU9HWmFsRldXEESkLWZDZprT13g5G22FTN3WR_IxW0pzpekwEj_h8XYqxoH40UcID0ufhIpZJhCIBK2sj5Tyi2jfOgqUKeeep35TpXCXG26em4KxDAX2U6s_Tj8IlgNWVlvNKIkDw7dT2u_bxGP9LZ3S9rx4vGb-z5VK0_Bw_gSuyEGYKAlDl49hoKSGluQRiP-w"
            ],
            "CloudFront-Forwarded-Proto": [
                "https"
            ],
            "CloudFront-Is-Desktop-Viewer": [
                "true"
            ],
            "CloudFront-Is-Mobile-Viewer": [
                "false"
            ],
            "CloudFront-Is-SmartTV-Viewer": [
                "false"
            ],
            "CloudFront-Is-Tablet-Viewer": [
                "false"
            ],
            "CloudFront-Viewer-Country": [
                "PL"
            ],
            "content-type": [
                "multipart/form-data; boundary=----WebKitFormBoundaryOytScKML3sK2ZC0y"
            ],
            "Host": [
                "api.tuq.me"
            ],
            "origin": [
                "https://tuq.me"
            ],
            "Referer": [
                "https://tuq.me/user-1551223257"
            ],
            "User-Agent": [
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15"
            ],
            "Via": [
                "2.0 89879a0242d5d2d5537231b1e168f07f.cloudfront.net (CloudFront)"
            ],
            "X-Amz-Cf-Id": [
                "zz7exSErtIVpBo0A7MlYFo9qTyEc9phDWW90_8Nl0MopQ5zxOpTHmA=="
            ],
            "X-Amzn-Trace-Id": [
                "Root=1-5c7d6c04-daa9b1547175ea1cab005388"
            ],
            "X-Forwarded-For": [
                "104.132.189.96, 54.239.171.153"
            ],
            "X-Forwarded-Port": [
                "443"
            ],
            "X-Forwarded-Proto": [
                "https"
            ]
        },
        "queryStringParameters": {
            "app_version": "1",
            "client_id": "32bj5mnkp3e4hd77jm4tcs9gb7"
        },
        "multiValueQueryStringParameters": {
            "app_version": [
                "1"
            ],
            "client_id": [
                "32bj5mnkp3e4hd77jm4tcs9gb7"
            ]
        },
        "pathParameters": {
            "id": "79708eb4-55b9-4314-9677-9274b2a18bfd"
        },
        "stageVariables": {
            "CDN": "https://s.tuq.me",
            "API": "https://api.tuq.me"
        },
        "requestContext": {
            "resourceId": "t2hcgg",
            "authorizer": {
                "avatar_url": "https://s.tuq.me/default.jpg",
                "comments_count": "0",
                "tracks_count": "0",
                "created_at": "2019-02-26T23:20:57.609Z",
                "principalId": "79708eb4-55b9-4314-9677-9274b2a18bfd",
                "integrationLatency": 201,
                "id": "79708eb4-55b9-4314-9677-9274b2a18bfd",
                "permalink": "user-1551223257",
                "last_modified": "2019-03-04T18:14:35.007Z",
                "email": "test@tuq.me",
                "username": "User 1551223257"
            },
            "resourcePath": "/users/{id}",
            "httpMethod": "PUT",
            "extendedRequestId": "WB3QqE7KjoEF5sA=",
            "requestTime": "04/Mar/2019:18:18:44 +0000",
            "path": "/users/79708eb4-55b9-4314-9677-9274b2a18bfd",
            "accountId": "752834445375",
            "protocol": "HTTP/1.1",
            "stage": "prod",
            "domainPrefix": "api",
            "requestTimeEpoch": 1551723524254,
            "requestId": "f2085cc8-3ea9-11e9-9f29-d5a0b2d5fa78",
            "identity": {
                "cognitoIdentityPoolId": null,
                "accountId": null,
                "cognitoIdentityId": null,
                "caller": null,
                "sourceIp": "104.132.189.96",
                "accessKey": null,
                "cognitoAuthenticationType": null,
                "cognitoAuthenticationProvider": null,
                "userArn": null,
                "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15",
                "user": null
            },
            "domainName": "api.tuq.me",
            "apiId": "g2r7hs31e9"
        },
        "body": "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",
        "isBase64Encoded": true
    }
);
