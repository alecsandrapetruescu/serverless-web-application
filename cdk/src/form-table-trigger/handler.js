const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");
const client = new SESv2Client({ region: process.env.REGION });

const createSendEmailCommand = (toAddress, fromAddress, subject, message) => {
    return new SendEmailCommand({
        FromEmailAddress: fromAddress,
        Destination: {
            /* required */
            CcAddresses: [
                /* more items */
            ],
            ToAddresses: [
                toAddress,
                /* more To-email addresses */
            ],
        },
        ReplyToAddresses: [
            /* more items */
        ],
        Content: {
            Simple: {
                /* required */
                Body: {
                    /* required */
                    Html: {
                        Charset: "UTF-8",
                        Data: message,
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: "TEXT_FORMAT_BODY",
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject,
                },
            }
        },

    });
};

exports.handler =  async function(event, context) {
    let eventRecord = unmarshall(event.Records[0].dynamodb.NewImage);

    const sendEmailCommand = createSendEmailCommand(
        eventRecord.emailTo,
        process.env.VERIFIED_EMAIL,
        eventRecord.subject ? eventRecord.subject : "EMAIL_SUBJECT",
        eventRecord.message ? eventRecord.message : "EMAIL_MESSAGE"
    );

    try {
        const response = await client.send(sendEmailCommand);
    } catch (e) {
        console.error("Failed to send email.", JSON.stringify(e));
    }
}
