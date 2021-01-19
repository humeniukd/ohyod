import json, uuid, boto3, botocore
from os import environ

BUCKET = environ.get('BUCKET')
REGION = environ.get('AWS_REGION')

def handler(event, context):
    key = str(uuid.uuid4())
    s3 = boto3.client('s3', region_name=REGION, config=botocore.client.Config(signature_version='s3v4'))
    url = s3.generate_presigned_url('put_object', Params = {'Bucket': BUCKET, 'Key': key})
    return {"url": url, "key": key}


    try:
        data = open(WORK_DIR + fileName, 'rb')
        bucket.put_object(Key=fileName, Body=data, ACL='public-read', Metadata={
            'id': self.__key,
            'duration': str(self.__duration),
            'stream': self.__outFile,
            'waveform': self.__mJsonFile,
        })
