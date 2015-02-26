"use strict";

var config = {
    "AWS_API_VERSION" : "2006-03-01",
    "appBucket" : "your-bucket",
    "submissionsKeyPrefix" : "path/to/submissions",
    "processedKeyPrefix" : "path/to/processed/",
    "emailTemplatesKey" : "path/to/templates.yml",
    "emailMetaKey" : "email",
    "defaultEmailTo" : "you@example.com",
    "defaultEmailFrom" : "you@example.com",
    "defaultEmailSubject" : "Thank You",
    "defaultEmailText" : "Thank You",
    "SES_STMP_USERNAME" : "YOUR_SMTP_USERNAME",
    "SES_SMTP_PASSWORD" : "YOUR_SMTP_PASSWORD",
}

module.exports = config
