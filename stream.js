const AWS = require('aws-sdk');

exports.handler = async (event = {}) => {
    const ddb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    const { id= '', offset = '2019-03-18', limit = 10 } = event;
    console.log('UserId: ', id);
    const params = {
        TableName: 'tracks',
        IndexName: 'user_id-created_at-index',
        KeyConditionExpression: 'user_id = :i and created_at < :o',
        ExpressionAttributeValues: {
            ':i': id,
            ':o': offset
        },
        ScanIndexForward: false,
        Limit: 2
    };

    try {
        const res = await ddb.query(params).promise();
        console.log('Success: ', JSON.res);
        let query = null;
        if (res.LastEvaluatedKey) {
            const offset = res.LastEvaluatedKey.created_at;
            query = `offset=${offset}`
        }
        return {
            collection: res.Items,
            query
        };
    } catch (e) {
        console.log('Error: ', e);
    }
};

exports.handler();
