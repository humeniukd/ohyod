const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const key = event.Records[0].s3.object.key;
    const Bucket = event.Records[0].s3.bucket.name;
    const id = key.substring(0, key.length-4);

    const s3 = new AWS.S3();
    const documentClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    try {
        const info = await s3.headObject({
            Bucket,
            Key: key
        }).promise();

        const { duration } = info.Metadata;

        const params = {
            TableName: 'tracks',
            Key: { id },
            UpdateExpression: 'set #dur = :d',
            ExpressionAttributeValues: {
                ':d': parseInt(duration)
            },
            ExpressionAttributeNames: {
                "#order_status": "status"
            }
        };
        const res = await documentClient.update(params).promise();
        console.log('Success: ', res);
    } catch (e) {
        console.log('Error: ', e);
    }
};

exports.handler({
    "Records": [
        {
            "eventVersion": "2.1",
            "eventSource": "aws:s3",
            "awsRegion": "eu-west-1",
            "eventTime": "2019-02-24T15:38:49.323Z",
            "eventName": "ObjectCreated:Put",
            "userIdentity": {
                "principalId": "AWS:AROAIGIYLKVWGUKMO6MKU:wf"
            },
            "requestParameters": {
                "sourceIPAddress": "52.208.92.147"
            },
            "responseElements": {
                "x-amz-request-id": "E1B16EEA18279B7D",
                "x-amz-id-2": "OZ2PbcXI9hzGL1NUupbApb6cBY6dNdLonTtqofJ/B6RJaI2hPZr1fUUp2CJUQIfYaAUJ9vS/4t8="
            },
            "s3": {
                "s3SchemaVersion": "1.0",
                "configurationId": "Duration",
                "bucket": {
                    "name": "hastream",
                    "ownerIdentity": {
                        "principalId": "A1W3YBNPG8MAQG"
                    },
                    "arn": "arn:aws:s3:::hastream"
                },
                "object": {
                    "key": "56af49fc-f1c7-41aa-9d6e-008f7270234b.mp3",
                    "size": 448978,
                    "eTag": "a1b4df82e9797b5ca9921ece6a4c14b6",
                    "sequencer": "005C72BA894A348659"
                }
            }
        }
    ]
});
