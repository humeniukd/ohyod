import datetime, uuid, boto3

def handler(event, context):
    id = str(uuid.uuid4())
    user = event.get('user')
    comment = event.get('comment')
    track_id = event.get('track_id')
    created_at = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
    client = boto3.client('dynamodb')
    response = client.put_item(
        TableName='comments',
        ReturnValues='ALL_OLD',
        Item={
            'id': {
                'S': id,
            },
            'user_id': {
                'S': user.get('id'),
            },
            'track_id': {
                'S': track_id,
            },
            'body': {
                'S': comment.get('body'),
            },
            'timestamp': {
                'N': str(comment.get('timestamp')),
            },
            'created_at': {
                'S': created_at,
            },
            'user': {
                'M': {
                    'id': {
                        'S': user.get('id'),
                    },
                    'permalink': {
                        'S': user.get('permalink'),
                    },
                    'username': {
                        'S': user.get('username'),
                    },
                    'avatar_url': {
                        'S': user.get('avatar_url'),
                    },
                    'last_modified': {
                        'S': user.get('last_modified'),
                    },

                },
            }
        },
        ReturnConsumedCapacity='TOTAL',
    )
    response = client.update_item(
        TableName='tracks',
        Key={
            'id': {
                'S': track_id
            }
        },
        UpdateExpression='SET #c = #c + :val',
        ExpressionAttributeNames={
            "#c": "comment_count"
        },
        ExpressionAttributeValues={
            ':val': {
                'N': '1'
            }
        }
    )
    response = client.update_item(
        TableName='users',
        Key={
            'id': {
                'S': user.get('id')
            }
        },
        UpdateExpression='SET #c = #c + :val',
        ExpressionAttributeNames={
            "#c": "comments_count"
        },
        ExpressionAttributeValues={
            ':val': {
                'N': '1'
            }
        }
    )
    return {
        'id': id,
        'user_id': user.get('id'),
        'track_id': track_id,
        'body': comment.get('body'),
        'timestamp': comment.get('timestamp'),
        'created_at': created_at,
        'user': {
            'id': user.get('id'),
            'permalink': user.get('permalink'),
            'username': user.get('username'),
            'avatar_url': user.get('avatar_url'),
            'last_modified': user.get('last_modified'),

        },
    }

handler({'track_id': 'dcd471e5-5ec6-477c-9184-861525a44835', 'comment': {'body': 'erhy', 'timestamp': 23380}, 'user': {'id': '0c54ed10-aa3c-44c5-a172-d9b18f5fef64', 'permalink': 'user-1551131432', 'username': 'User 1551131432', 'last_modified': '2019-02-25T21:50:32Z', 'avatar_url': 'https://s.tuq.me/6263134bd33ff0d462c4ddf288da48e8.jpg'}}, {})
