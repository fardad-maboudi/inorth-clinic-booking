export function sendNotification({ userIds, all, title, body, type, link, dedupKey, channels, sms }: {
    userIds: any;
    all: any;
    title: any;
    body: any;
    type: any;
    link: any;
    dedupKey: any;
    channels: any;
    sms: any;
}): Promise<unknown>;
export function sendSms({ to, message, smsTemplate, smsTokens, patternKey, allowFreeText }: {
    to: any;
    message: any;
    smsTemplate: any;
    smsTokens: any;
    patternKey: any;
    allowFreeText?: boolean;
}): Promise<unknown>;
