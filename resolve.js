const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const ddb = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    const { permalinkUrl } = event;
    console.log('Permalink: ', permalinkUrl);
    let params = {s
        ExpressionAttributeValues: {
            ':p': permalinkUrl
        }
    };
    if (permalinkUrl.indexOf('/') > -1) {
        params = {
            ...params,
            TableName: 'tracks',
            IndexName: 'permalink_url-index',
            KeyConditionExpression: 'permalink_url = :p'

        }
    } else {
        params = {
            ...params,
            TableName: 'users',
            IndexName: 'permalink-index',
            KeyConditionExpression: 'permalink = :p'
        }
    }

    try {
        const res = await ddb.query(params).promise();
        console.log('Success: ', res);
        if (res.Items.length) {
            return res.Items[0];
        } else {
            throw new Error('NotFound');
        }
    } catch (e) {
        console.log('Error: ', e);
        throw e;
    }
};
