const AWS = require('aws-sdk');

exports.handler = async (event) => {
    const {
        uid,
        permalink,
        title,
        description,
        genre,
        tag_list,
        commentable
    } = event.body;
    if (event.id) {

    }
    const params = {
        TableName: 'tracks',
        Key: {id: uid},
        UpdateExpression: 'set permalink = :p, title = :t, genre = :g, commentable = :c',
        ExpressionAttributeValues: {
            ':p': permalink,
            ':t': title,
            ':g': genre,
            ':c': commentable,
        },
        ReturnValues: 'ALL_NEW'
    };
    if (description.length) {
        params.ExpressionAttributeValues[':d'] = description;
        params.UpdateExpression += ', description = :d';
    }
    if (tag_list.length) {
        params.ExpressionAttributeValues[':h'] = tag_list;
        params.UpdateExpression += ', tag_list = :h';
    }

    const documentClient = new AWS.DynamoDB.DocumentClient({region: 'eu-west-1'});
    try {
        const res = documentClient.update(params).promise();
        console.log('dsfge', res);
        return res.Attributes;
    } catch (e) {
        console.log('dsfge', e);
    }
};
