const AWS = require('aws-sdk');

const region = process.env.AWS_REGION || 'eu-central-1';

exports.handler = async (event) => {
    const { ids } = event;
    const Keys = [];
    for (const id of  Array.isArray(ids) ? ids : [ids]) {
        Keys.push({ id });
    }
    const documentClient = new AWS.DynamoDB.DocumentClient({ region });
    try {
        const params = {
            RequestItems: {
                tracks: { Keys }
            }
        };
        const res = await documentClient.batchGet(params).promise();
        console.log('Success: ', res);
        return res.Responses && res.Responses.tracks;
    } catch (e) {
        console.log('Error: ', e);
    }
};

exports.handler({ids: '717d656708533b3cba0b03d5a08b13d2'})
