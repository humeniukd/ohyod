const aws = require('aws-sdk');

exports.handler = async (event) => {
    const ddb = new aws.DynamoDB.DocumentClient({region: 'eu-west-1'});
    const { user, body } = event;
    let rm = [], expr = [];
    const params = {
        TableName: 'users',
        Key: { id: user.id },
        ReturnValues: 'ALL_NEW',
        UpdateExpression: 'set last_modified = :m',
        ExpressionAttributeValues: {
            ':m': new Date().toJSON()
        }
    };
    const attributes = {
        permalink: ':p',
        username: ':u',
        first_name: ':f',
        last_name: ':l',
        description: ':d',
        country_code: ':c',
        city: ':t'
    };
    for (const key of Object.keys(attributes)) {
        const old = user[key];
        const val = body[key];
        if (val !== old)
            if (!!val) {
                expr.push(`${key} = ${attributes[key]}`);
                params.ExpressionAttributeValues[attributes[key]] = val;
            } else if (!!old) {
                rm.push(key);
            }
    }
    if (!rm.length && !expr.length) return user;
    if (expr.length) params.UpdateExpression += `, ${expr.join(',')}`;
    if (rm.length) params.UpdateExpression += ` remove ${rm.join(',')}`;
    try {
        const res = await ddb.update(params).promise();
        console.log('Success: ', res);
        return res.Attributes;
    } catch (e) {
        console.log('Error: ', e);
    }
    return user;
};

exports.handler({
    body: {
        "city": "",
        "first_name": "John",
        "last_name": "Done",
        "description": "",
        "permalink": "user-1551131432",
        "username": "User 1551131432",
        "country_code": ""
    },
    user:
        {
            "id": "0c54ed10-aa3c-44c5-a172-d9b18f5fef64",
            "permalink": "user-1551131432",
            "username": "User 1551131432",
            "email": "dmitry.gumenyuk@gmail.com",
            "created_at": "2019-02-25T21:50:32.403Z",
            "avatar_url": "https://s.tuq.me/6263134bd33ff0d462c4ddf288da48e8.jpg",
            "full_name": "John Done",
            "first_name": "John",
            "last_name": "Done",
            "city": "asdf",
            "tracks_count": 0
        }});
