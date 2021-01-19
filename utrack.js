const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const {
        permalink,
        title,
        description,
        genre,
        tag_list
    } = event.body;
    const rm = [];
    const params = {
        TableName: 'tracks',
        Key: {id: event.id},
        UpdateExpression: 'set permalink = :p, title = :t, genre = :g, last_modified = :m',
        ExpressionAttributeValues: {
            ':p': permalink,
            ':t': title,
            ':g': genre,
            ':m': new Date().toJSON()
        },
        ReturnValues: 'ALL_NEW'
    };
    if (description.length) {
        params.ExpressionAttributeValues[':d'] = description;
        params.UpdateExpression += ', description = :d';
    } else {
        rm.push('description')
    }
    if (tag_list.length) {
        params.ExpressionAttributeValues[':h'] = tag_list;
        params.UpdateExpression += ', tag_list = :h';
    } else {
        rm.push('tag_list')
    }
    if (rm.length) params.UpdateExpression += ` remove ${rm.join(',')}`;

    const documentClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    try {
        const res = await documentClient.update(params).promise();
        console.log('Updated: ', res.Attributes);
        return res.Attributes;
    } catch (e) {
        console.log('Error: ', e);
    }
};
