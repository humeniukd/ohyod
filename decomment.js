const AWS = require('aws-sdk');

exports.handler = async (event = {}) => {
    const ddb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    const { track_id, user_id, id } = event;
    console.log('Track Id: ', track_id);
    const params = {
        TableName : 'comments',
        Key: {
            id,
            track_id
        }
    };

    const tparams = {
        TableName:'tracks',
        Key: {
            'id': track_id
        },
        UpdateExpression: 'SET #c = #c - :val',
        ExpressionAttributeNames: {
            "#c": "comments_count"
        },
        ExpressionAttributeValues: {
            ':val': 1
        }

    };

    const uparams = {
        TableName:'users',
        Key: {
            'id': user_id
        },
        UpdateExpression: 'SET #c = #c - :val',
        ExpressionAttributeNames: {
            "#c": "comments_count"
        },
        ExpressionAttributeValues: {
            ':val': 1
        }

    };


    try {
        const res = await ddb.delete(params).promise();
        await ddb.update(tparams).promise();
        await ddb.update(uparams).promise();
        return null;
    } catch (e) {
        console.log('Error: ', e);
    }
};

exports.handler({user_id: '0c54ed10-aa3c-44c5-a172-d9b18f5fef64', track_id:'dcd471e5-5ec6-477c-9184-861525a44835', id: '24a4d811-d8f8-4b5f-b0d9-16b7b0b153b4'})
