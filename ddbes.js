var AWS = require('aws-sdk');

var region = process.env.AWS_REGION || 'eu-west-1';
var domain = process.env.DOMAIN;
var index = 'tags';
var type = '_search';

/*
 host = '' # the Amazon ES domain, with https://
 index = 'lambda-index'
 type = 'lambda-type'
 url = host + '/' + index + '/' + type + '/'

 headers = { "Content-Type": "application/json" }

 def handler(event, context):
     count = 0
     for record in event['Records']:
         # Get the primary key for use as the Elasticsearch ID
         id = record['dynamodb']['Keys']['id']['S']

     if record['eventName'] == 'REMOVE':
        r = requests.delete(url + id, auth=awsauth)
     else:
        document = record['dynamodb']['NewImage']
        r = requests.put(url + id, auth=awsauth, json=document, headers=headers)
     count += 1
     return str(count) + ' records processed.'
*/

var document = {
    "_source": "suggest",
    "suggest": {
        "tags" : {
            "completion" : {
                "field" : "suggest",
                "size" : 5,
                "skip_duplicates" : true
            }
        }
    }
};

exports.handler = function ({ prefix }, context, callback) {
    var endpoint = new AWS.Endpoint(domain);
    var request = new AWS.HttpRequest(endpoint, region);

    request.method = 'POST';
    request.path += index + '/' + type;
    document.suggest.tags.prefix = prefix;
    request.body = JSON.stringify(document);
    request.headers['host'] = domain;
    request.headers['Content-Type'] = 'application/json';
    request.headers["Content-Length"] = request.body.length;

    var credentials = new AWS.EnvironmentCredentials('AWS');
    var signer = new AWS.Signers.V4(request, 'es');
    signer.addAuthorization(credentials, new Date());

    var client = new AWS.HttpClient();
    client.handleRequest(request, null, function(response) {
        console.log(response.statusCode + ' ' + response.statusMessage);
        var responseBody = '';
        response.on('data', function (chunk) {
            responseBody += chunk;
        });
        response.on('end', function (chunk) {
            const data = JSON.parse(responseBody);
            callback(null, data.suggest['tags'][0].options);
        });
    }, function(error) {
        console.log('Error: ' + error);
        callback(error);
    });
}
