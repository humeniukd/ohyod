const AWS = require("aws-sdk");

exports.handler = async (event) => {
    const ddb = new AWS.DynamoDB({region: 'eu-west-1'});
    const record = event.Records[0];
    console.log('Stream record: ', JSON.stringify(record));
    const { user_id } = record.dynamodb.NewImage;
    const params = {
        TableName: 'users',
        Key: {
            id: user_id
        },
        ExpressionAttributeNames: {
            "#c": "tracks_count"
        },
        ExpressionAttributeValues: {
            ':val': {
                'N': '1'
            }
        },
        ReturnValues: 'ALL_NEW',
    };

    if ('INSERT' === record.eventName) {
        try {
            const res = await ddb.updateItem({
                UpdateExpression: 'SET #c = #c + :val',
                ...params
            }).promise();
            console.log('User: ', res)
        } catch (e) {
            console.log('Error: ', e)
        }
    } else if ('REMOVE' === record.eventName) {
        try {
            let res = await ddb.updateItem({
                UpdateExpression: 'SET #c = #c - :val',
                ...params
            }).promise();
            console.log('User: ', res)
        } catch (e) {
            console.log('Error: ', e)
        }
    } else if ('MODIFY' === record.eventName) {
        const lambda = new AWS.Lambda({region: 'eu-west-1'});
        try {
            const res = await lambda.invoke({
                FunctionName: "esNewTrack",
                InvocationType: "Event",
                LogType: "Tail",
                Payload: JSON.stringify(record)
            }).promise();
            console.log('Executed')
        } catch (e) {
            console.log('Error: ', e)
        }
    }
};
//
// exports.handler({Records: [{
//     "eventID": "66d3a988264c60da809ed967beb0953a",
//     "eventName": "MODIFY",
//     "eventVersion": "1.1",
//     "eventSource": "aws:dynamodb",
//     "awsRegion": "eu-west-1",
//     "dynamodb": {
//         "ApproximateCreationDateTime": 1553177338,
//         "Keys": {
//             "id": {
//                 "S": "17b36a5c-95ab-4497-9153-8df07e2e0ba9"
//             }
//         },
//         "NewImage": {
//             "duration": {
//                 "N": "28000"
//             },
//             "artwork_url": {
//                 "S": "https://s.tuq.me/1df645a0a7e9e12cf77e6a36edbb3809.jpg"
//             },
//             "user_id": {
//                 "S": "0e9ae091-90df-4740-a2fd-a1ce4d0d044c"
//             },
//             "comments_count": {
//                 "N": "0"
//             },
//             "id": {
//                 "S": "17b36a5c-95ab-4497-9153-8df07e2e0ba9"
//             },
//             "state": {
//                 "S": "finished"
//             },
//             "waveform_url": {
//                 "S": "https://w.tuq.me/873da2e2-2799-44cc-b467-207df34800de_m.json"
//             },
//             "sharing": {
//                 "S": "public"
//             },
//             "user": {
//                 "M": {
//                     "full_name": {
//                         "S": "Dmitry Humeniuk"
//                     },
//                     "avatar_url": {
//                         "S": "https://s.tuq.me/1df645a0a7e9e12cf77e6a36edbb3809.jpg"
//                     },
//                     "tracks_count": {
//                         "N": "0"
//                     },
//                     "created_at": {
//                         "S": "2019-02-26T22:01:05.612Z"
//                     },
//                     "last_name": {
//                         "S": "Humeniuk"
//                     },
//                     "id": {
//                         "S": "0e9ae091-90df-4740-a2fd-a1ce4d0d044c"
//                     },
//                     "permalink": {
//                         "S": "user-1551218465"
//                     },
//                     "first_name": {
//                         "S": "Dmitry"
//                     },
//                     "username": {
//                         "S": "User 1551218465"
//                     }
//                 }
//             },
//             "playback_count": {
//                 "N": "0"
//             },
//             "stream_url": {
//                 "S": "https://w.tuq.me/832e0bc4-27a1-475f-b127-f12c942cc396.mp3"
//             }
//         },
//         "OldImage": {
//             "artwork_url": {
//                 "S": "https://s.tuq.me/1df645a0a7e9e12cf77e6a36edbb3809.jpg"
//             },
//             "user_id": {
//                 "S": "0e9ae091-90df-4740-a2fd-a1ce4d0d044c"
//             },
//             "comments_count": {
//                 "N": "0"
//             },
//             "id": {
//                 "S": "17b36a5c-95ab-4497-9153-8df07e2e0ba9"
//             },
//             "state": {
//                 "S": "preparing"
//             },
//             "sharing": {
//                 "S": "public"
//             },
//             "user": {
//                 "M": {
//                     "full_name": {
//                         "S": "Dmitry Humeniuk"
//                     },
//                     "avatar_url": {
//                         "S": "https://s.tuq.me/1df645a0a7e9e12cf77e6a36edbb3809.jpg"
//                     },
//                     "tracks_count": {
//                         "N": "0"
//                     },
//                     "created_at": {
//                         "S": "2019-02-26T22:01:05.612Z"
//                     },
//                     "last_name": {
//                         "S": "Humeniuk"
//                     },
//                     "id": {
//                         "S": "0e9ae091-90df-4740-a2fd-a1ce4d0d044c"
//                     },
//                     "permalink": {
//                         "S": "user-1551218465"
//                     },
//                     "first_name": {
//                         "S": "Dmitry"
//                     },
//                     "username": {
//                         "S": "User 1551218465"
//                     }
//                 }
//             },
//             "playback_count": {
//                 "N": "0"
//             }
//         },
//         "SequenceNumber": "209217900000000038639777540",
//         "SizeBytes": 1127,
//         "StreamViewType": "NEW_AND_OLD_IMAGES"
//     },
//     "eventSourceARN": "arn:aws:dynamodb:eu-west-1:752834445375:table/tracks/stream/2019-03-21T13:13:35.245"
// }]});
exports.handler({Records: [{
        "eventID": "f094b87bbdebe97851333ea4263a8864",
        "eventName": "INSERT",
        "eventVersion": "1.1",
        "eventSource": "aws:dynamodb",
        "awsRegion": "eu-west-1",
        "dynamodb": {
            "ApproximateCreationDateTime": 1553177334,
            "Keys": {
                "id": {
                    "S": "17b36a5c-95ab-4497-9153-8df07e2e0ba9"
                }
            },
            "NewImage": {
                "artwork_url": {
                    "S": "https://s.tuq.me/1df645a0a7e9e12cf77e6a36edbb3809.jpg"
                },
                "user_id": {
                    "S": "0e9ae091-90df-4740-a2fd-a1ce4d0d044c"
                },
                "comments_count": {
                    "N": "0"
                },
                "id": {
                    "S": "17b36a5c-95ab-4497-9153-8df07e2e0ba9"
                },
                "state": {
                    "S": "preparing"
                },
                "sharing": {
                    "S": "public"
                },
                "user": {
                    "M": {
                        "full_name": {
                            "S": "Dmitry Humeniuk"
                        },
                        "avatar_url": {
                            "S": "https://s.tuq.me/1df645a0a7e9e12cf77e6a36edbb3809.jpg"
                        },
                        "tracks_count": {
                            "N": "0"
                        },
                        "created_at": {
                            "S": "2019-02-26T22:01:05.612Z"
                        },
                        "last_name": {
                            "S": "Humeniuk"
                        },
                        "id": {
                            "S": "0e9ae091-90df-4740-a2fd-a1ce4d0d044c"
                        },
                        "permalink": {
                            "S": "user-1551218465"
                        },
                        "first_name": {
                            "S": "Dmitry"
                        },
                        "username": {
                            "S": "User 1551218465"
                        }
                    }
                },
                "playback_count": {
                    "N": "0"
                }
            },
            "SequenceNumber": "209217800000000038639774122",
            "SizeBytes": 508,
            "StreamViewType": "NEW_AND_OLD_IMAGES"
        },
        "eventSourceARN": "arn:aws:dynamodb:eu-west-1:752834445375:table/tracks/stream/2019-03-21T13:13:35.245"
}]})
