import { SES } from '@aws-sdk/client-ses'
import { S3 } from '@aws-sdk/client-s3'
const ses = new SES({ region: "eu-central-1" });
const s3 = new S3({ region: "eu-central-1" });

const config = {
    fromEmail: "noreply@ttcarservice.eu",
    subjectPrefix: "",
    emailBucket: "ttcarm",
    emailKeyPrefix: "",
    forwardMapping: {
        "ttcarservice.eu": [
            "ttcar@loudyo.com"
        ],
        // "support@ttcarservice.eu": [
        //     "tetyana.fetsachyn@gmail.com"
        // ],
    }
};

function parseEvent(event) {
    const record = event.Records?.[0]
    if (record?.eventSource !== 'aws:ses' || record?.eventVersion !== '1.0') {
        console.log("parseEvent() received invalid SES message:", JSON.stringify(event));
    }

    return {
        email: record.ses.mail,
        origRecipients: record.ses.receipt.recipients
    };
}

const transformRecipients = recipients => recipients.reduce((acc, r) =>  {
    const recipient = r.toLowerCase();
    const domain = recipient.split("@")[1];

    return [
        ...acc,
        ...config.forwardMapping[recipient] ?? [],
        ...config.forwardMapping[domain] ?? []
    ]
}, []);

async function fetchMessage(email) {
    // Copying email object to ensure read permission
    console.log(`Fetching email at s3://${config.emailBucket}/${email.messageId}`);
    try {
        const res = await s3.getObject({
            Bucket: config.emailBucket,
            Key: config.emailKeyPrefix + email.messageId
        })
        return await new Response(res.Body).text();
    } catch (e) {
        console.log(`Fetching email failed: ${e}`);
    }

};

function processMessage(emailData) {
    let match = emailData.match(/^((?:.+\r?\n)*)(\r?\n(?:.*\s+)*)/m);

    let header = match?.[1] ?? emailData;
    const body = match?.[2] ?? '';

    if (!/^Reply-To: /mi.test(header)) {
        match = header.match(/^From: (.*(?:\r?\n\s+.*)*\r?\n)/m);
        const from = match?.[1];

        if (from) {
            header = header + 'Reply-To: ' + from;
            console.log("Added Reply-To address of: " + from);
        }
    }

    header = header.replace(
        /^From: (.*(?:\r?\n\s+.*)*)/mg,
        (_, found) => `From: ${found.replace(/<(.*)>/, '').trim()} <${config.fromEmail}>`
    )
    header = header.replace(/^Return-Path: (.*)\r?\n/mg, '');

    header = header.replace(/^Sender: (.*)\r?\n/mg, '');

    header = header.replace(/^Message-ID: (.*)\r?\n/mig, '');

    header = header.replace(/^DKIM-Signature: .*\r?\n(\s+.*\r?\n)*/mg, '');

    return header + body;
}

async function sendMessage({ recipients, origRecipients, emailData }) {
    const params = {
        Destinations: recipients,
        Source: origRecipients[0],
        RawMessage: {
            Data: new TextEncoder().encode(emailData)
        }
    };
    try {
        const result = await ses.sendRawEmail(params)
        console.log("sendRawEmail() returned:", result);
    } catch (e) {
        console.log("sendRawEmail() returned error:", e)
    }
};

export async function handler(event) {
    const { email, origRecipients } = parseEvent(event);
    const recipients = transformRecipients(origRecipients);
    const data = await fetchMessage(email);
    const emailData = processMessage(data);

    await sendMessage({
        recipients, origRecipients, emailData
    });
}