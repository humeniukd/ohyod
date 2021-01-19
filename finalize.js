const AWS = require('aws-sdk');
var region = process.env.AWS_REGION || 'eu-central-1';

exports.handler = async (event) => {
  const documentClient = new AWS.DynamoDB.DocumentClient({ region });
  const sqs = new AWS.SQS({ region });
  try {
    const { QueueUrl } = await sqs.getQueueUrl({
      QueueName: 'transcodings.fifo'
    }).promise();
    console.log('Queue: ', QueueUrl);

    const { Messages = [] } = await sqs.receiveMessage({
      QueueUrl, MaxNumberOfMessages: 10
    }).promise();

    if (!Messages.length) return;

    const Entries = [];
    for (const { Body, MessageId: Id, ReceiptHandle } of Messages) {
      const { key, duration } = JSON.parse(Body);
      Entries.push({Id, ReceiptHandle})
      const params = {
        TableName: 'tracks',
        Key: { id: key },
        UpdateExpression: 'set #dur = :d, #st = :s',
        ExpressionAttributeValues: {
          ':d': duration,
          ':s': 'finished'
        },
        ExpressionAttributeNames: {
          "#dur": "duration",
          "#st": "state"
        }
      };
      const res = await documentClient.update(params).promise();
      const { QueueUrl } = await sqs.getQueueUrl({
        QueueName: `${key}.fifo`
      }).promise();
      const dq = await sqs.deleteQueue({ QueueUrl }).promise();
      console.log('Success: ', res);
    }
    if (Entries.length)
      sqs.deleteMessageBatch({ Entries, QueueUrl }).promise();

  } catch (e) {
    console.log('Error: ', e);
  }
}
