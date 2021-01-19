const aws = require('aws-sdk');
const region = process.env.AWS_REGION || 'eu-central-1';

exports.handler = async (event) => {
    console.log('Event: ', event);
    const ddb = new aws.DynamoDB.DocumentClient({ region });
    if (event.body && event.body.uid) {
        const params = {
            TableName: 'tracks',
            Item: {
                id : event.body.uid,
                user_id : event.user.id,
                playback_count: 0,
                comments_count: 0,
                sharing: 'public',
                state: 'preparing'
            }
        };
        try {
            const data = await ddb.put(params).promise();
            console.log('Success', data);
        } catch (e) {
            console.log('Error', e);
        }
    } else { // TODO:
        const sqs = new aws.SQS({ region });
        try {
            const { QueueUrl } = await sqs.getQueueUrl({
                QueueName: event.uid + '.fifo'
            }).promise();
            console.log('Queue: ', QueueUrl);

            const { Messages = [] } = await sqs.receiveMessage({
                QueueUrl, MaxNumberOfMessages: 10
            }).promise();

            if (!Messages.length) return; //TODO

            const last = Messages[Messages.length - 1];
            const data = JSON.parse(last.Body);
            const Entries = [];
            for (const { MessageId: Id, ReceiptHandle } of Messages)
                Entries.push({Id, ReceiptHandle})

            sqs.deleteMessageBatch({ Entries, QueueUrl }).promise();
            if ('error' === data.type) return { status: 'failure' };
            return {
                status: 100 === data.value ? 'finished' : 'transcoding',
                percentage: data.value
            };

        } catch (e) {
            console.log(e);
        }
    }

    return {status: 'preparing'};
};
