const AWS = require("aws-sdk");

exports.handler = async (event) => {
    event.Records.forEach(async record => {
        console.log('Stream record: ', JSON.stringify(record, null, 2));
        const ddb = new AWS.DynamoDB();
        const user = record.dynamodb.NewImage;

        let params = {
            TableName: 'tracks',
            IndexName: 'user_id-created_at-index',
            KeyConditionExpression: 'user_id = :i',
            ExpressionAttributeValues: {
                ':i': user.id.S,
            }
        };

        let res = await ddb.query(params).promise();

        params = {
            RequestItems: {
                tracks: []
            }
        };

        if (!res.Items.length) return;

        const {
            avatar_url,
            first_name,
            full_name,
            id,
            last_modified,
            last_name,
            permalink,
            username
        } = user;

        for (const item of res.Items) {
            params.RequestItems.tracks.push({
                PutRequest: {
                    Item: {
                        user: {
                            M: {
                                avatar_url,
                                first_name,
                                full_name,
                                id,
                                last_modified,
                                last_name,
                                permalink,
                                username
                            }
                        },
                        ...item
                    }
                }
            })
        }
        res = await ddb.batchWriteItem(params).promise();

        params = {
            TableName: 'comments',
            IndexName: 'user_id-id-index',
            KeyConditionExpression: 'user_id = :i',
            ExpressionAttributeValues: {
                ':i': user.id.S,
            }
        };
        res = await ddb.query(params).promise();

        if (res.Items.length) {
            params = {
                RequestItems: {
                    comments: []
                }
            };
            for (const item of res.Items) {
                params.RequestItems.comments.push({
                    PutRequest: {
                        Item: {
                            user: {
                                M: {
                                    id,
                                    permalink,
                                    username,
                                    avatar_url,
                                    last_modified
                                }
                            },
                            ...item
                        }
                    }
                })
            }
            res = await ddb.query(params).promise();
        }
    });
};

exports.handler({Records: [{
        "eventID": "fdecd9acc1fdc7e5cb860ba87960e947",
        "eventName": "MODIFY",
        "eventVersion": "1.1",
        "eventSource": "aws:dynamodb",
        "awsRegion": "eu-west-1",
        "dynamodb": {
            "ApproximateCreationDateTime": 1552574436,
            "Keys": {
                "id": {
                    "S": "0c54ed10-aa3c-44c5-a172-d9b18f5fef64"
                }
            },
            "NewImage": {
                "city": {
                    "S": "asdf"
                },
                "created_at": {
                    "S": "2019-02-25T21:50:32.403Z"
                },
                "last_name": {
                    "S": "Done"
                },
                "full_name": {
                    "S": "John Done"
                },
                "avatar_url": {
                    "S": "https://s.tuq.me/6263134bd33ff0d462c4ddf288da48e8.jpg"
                },
                "comments_count": {
                    "N": "1"
                },
                "tracks_count": {
                    "N": "0"
                },
                "id": {
                    "S": "0c54ed10-aa3c-44c5-a172-d9b18f5fef64"
                },
                "permalink": {
                    "S": "user-1551131432"
                },
                "first_name": {
                    "S": "John"
                },
                "last_modified": {
                    "S": "2019-03-14T14:40:35.938Z"
                },
                "email": {
                    "S": "dmitry.gumenyuk@gmail.com"
                },
                "username": {
                    "S": "User 1551131432"
                }
            },
            "SequenceNumber": "211884800000000002489891353",
            "SizeBytes": 369,
            "StreamViewType": "NEW_IMAGE"
        },
        "eventSourceARN": "arn:aws:dynamodb:eu-west-1:752834445375:table/users/stream/2019-03-05T17:20:59.528"
    }]
});
