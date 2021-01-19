const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const { ids } = event;
    const Keys = [];
    for (const id of  Array.isArray(ids) ? ids : [ids]) {
        Keys.push({id});
    }
    const documentClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    try {
        const params = {
            TableName : 'tracks',
            Key: { id }
        };
        const res = await documentClient.get(params).promise();
        console.log('Success: ', res);
        return res.Item;
    } catch (e) {
        console.log('Error: ', e);
    }
};

exports.handler({ids: 'asdf'})
