const AWS = require("aws-sdk");

exports.handler = async (event) => {
    const ddb = new AWS.DynamoDB({region: 'eu-west-1'});
    const record = event.Records[0];
    console.log('Stream record: ', JSON.stringify(record));
    const { track_id } = record.dynamodb.Keys;
    const params = {
        ExpressionAttributeNames: {
            "#c": "comments_count"
        },
        ExpressionAttributeValues: {
            ':val': {
                'N': '1'
            }
        },
        ReturnValues: 'ALL_NEW',
    };

    if ('INSERT' === record.eventName) {
        try {
            let res = await ddb.updateItem({
                TableName: 'tracks',
                UpdateExpression: 'SET #c = #c + :val',
                Key: {
                    'id': track_id
                },
                ...params
            }).promise();
            console.log('Track: ', res);
            const { user_id } = res.Attributes;

            res = await ddb.updateItem({
                TableName: 'users',
                UpdateExpression: 'SET #c = #c + :val',
                Key: {
                    id: user_id
                },
                ...params
            }).promise();
            console.log('User: ', res)
        } catch (e) {
            console.log('Error: ', e)
        }
    } else if ('REMOVE' === record.eventName) {
        try {
            let res = await ddb.updateItem({
                TableName: 'tracks',
                UpdateExpression: 'SET #c = #c - :val',
                Key: {
                    id: track_id
                },
                ...params
            }).promise();
            console.log('Track: ', res);
            const { user_id } = res.Attributes;

            res = await ddb.updateItem({
                TableName: 'users',
                UpdateExpression: 'SET #c = #c - :val',
                Key: {
                    id: user_id
                },
                ...params
            }).promise();
            console.log('User: ', res)
        } catch (e) {
            console.log('Error: ', e)
        }
    }
};

exports.handler({Records: [{
        "eventID": "a18ce421d8a189495580181ff15fcdf8",
        "eventName": "INSERT",
        "eventVersion": "1.1",
        "eventSource": "aws:dynamodb",
        "awsRegion": "eu-west-1",
        "dynamodb": {
            "ApproximateCreationDateTime": 1552920652,
            "Keys": {
                "track_id": {
                    "S": "6be8302d-654a-4f28-b23a-9d18a77bc62a"
                },
                "id": {
                    "S": "b4cd6145-7453-4839-8a48-3c4fc9888f00"
                }
            },
            "SequenceNumber": "164443500000000042168082658",
            "SizeBytes": 82,
            "StreamViewType": "NEW_IMAGE"
        },
        "eventSourceARN": "arn:aws:dynamodb:eu-west-1:752834445375:table/comments/stream/2019-03-15T14:06:06.610"
    }]})
