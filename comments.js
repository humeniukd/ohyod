const AWS = require('aws-sdk');

exports.handler = async (event = {}) => {
    const ddb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    const { track_id, offset, limit = 10, path } = event;
    console.log('Track Id: ', track_id);
    const params = {
        TableName: 'comments',
        KeyConditionExpression: 'track_id = :i',
        ExpressionAttributeValues: {
            ':i': track_id,
        },
        Limit: limit
    };
    if (offset) {
        params.ExclusiveStartKey = {id: offset, track_id}
    }

    try {
        const res = await ddb.query(params).promise();
        console.log('Success: ', JSON.stringify(res));
        let next_href = null;
        if (res.LastEvaluatedKey) {
            const offset = res.LastEvaluatedKey.id;
            next_href = `${path}?offset=${offset}`
        }
        return {
            collection: res.Items,
            next_href
        };
    } catch (e) {
        console.log('Error: ', e);
    }
};

exports.handler({'track_id': 'dcd471e5-5ec6-477c-9184-861525a44835', 'comment': {'body': 'erhy', 'timestamp': 23380}, 'user': {'id': '0c54ed10-aa3c-44c5-a172-d9b18f5fef64', 'permalink': 'user-1551131432', 'username': 'User 1551131432', 'last_modified': '2019-02-25T21:50:32Z', 'avatar_url': 'https://s.tuq.me/6263134bd33ff0d462c4ddf288da48e8.jpg'}});
