const AWS = require('aws-sdk');

const region = process.env.AWS_REGION || 'eu-central-1';

exports.handler = async (event) => {
    const {
        uid,
        permalink,
        title,
        description,
        tags,
        commentable = false
    } = event;

    const [genre, ...tag_list] = tags

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

    const documentClient = new AWS.DynamoDB.DocumentClient({ region });
    try {
        const res = await documentClient.update(params).promise();
        console.log('Tracks: ', res);
        return res.Attributes;
    } catch (e) {
        console.log('Tracks: ', e);
    }
};


exports.handler({
    "uid": "872d21ea84f5c74119757357e48c6559",
    "permalink": "asdf",
    "title": "asdf",
    "description": "",
    "genre": "Rock",
    "tag_list": [],
    "commentable": true
})