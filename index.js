"use strict";

var aws = require('aws-sdk');
var async = require('async');
var util = require('util');
var yaml = require('js-yaml');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var sesTransport = require('nodemailer-ses-transport');

var SubmissionNotifier = (function(config, s3) {

    var defaultMailOptions = {
        "from" : config.defaultEmailFrom,
        "to" : config.defaultEmailTo,
        "subject" : config.defaultEmailSubject,
        "text" : config.defaultEmailText,
    };

    var sesOptions = {
        accessKeyId: config.SES_STMP_USERNAME,
        secretAccessKey: config.SES_SMTP_PASSWORD,
    };

    var validateEvent = function (event) {
        return function(next) {
            var bucketName = event.Records[0].s3.bucket.name;
            var key = event.Records[0].s3.object.key; // Keys contain values, Ex. '@' which may be encoded

            s3.getObject(
            {
                Bucket:bucketName, Key:decodeURIComponent(key)
            },
            function(err, data) {
                if (err) {
                    next('Error: Failed to get object ' + key + ' from bucket ' + bucketName + 
                        '. Make sure it exists and your bucket is in the same region as this function. \n' + err);
                } else {
                    var prefix = key.substr(0, config.submissionsKeyPrefix.length);
                    if (prefix === config.submissionsKeyPrefix) { // Only process keys with this prefix
                        var filename = key.substr(key.lastIndexOf('/') + 1);
                        console.log('Filename: ', filename);
                        console.log('Email: ', data.Metadata[config.emailMetaKey]);
                        console.log('Content Type: ', data.ContentType);
                        next(null, key, filename, data);
                    } else {
                        next('The object key: ' + key + ' is not valid for this process');
                    }
                }
            });
        };
    };

    var moveKey = function(key, filename, submissionKeyData, next) {
        s3.copyObject(
        {
            CopySource: config.appBucket + '/' + key,
            Bucket: config.appBucket,
            Key: decodeURIComponent(config.processedKeyPrefix + filename),
        },
        function(err, templatesKeyData) {
            if (err) {
                next('Error: Failed to copy object ' + key + ' from bucket ' + config.appBucket + 
                    '. Make sure it exists and your bucket is in the same region as this function. \n' + err);
            } else {
                 s3.deleteObject(
                {
                    Bucket: config.appBucket,
                    Key: decodeURIComponent(key),
                },
                function(err, data) {
                    if (err) {
                        next('Error: Failed to delete ' + key + ' from bucket ' + config.appBucket + 
                        '. Make sure it exists and your bucket is in the same region as this function. \n' + err);
                    } else {   
                        next(null, submissionKeyData);
                    }
                });
            }
        });
    };

    var getEmailTemplates = function (submissionKeyData, next) {
        s3.getObject(
        {
            Bucket:config.appBucket, Key:config.emailTemplatesKey
        },
        function(err, templatesKeyData) {
            if (err) {
                next('Error: Failed to get email templates object ' + emailTemplatesKey + ' from bucket ' + config.appBucket + 
                    '. Make sure it exists and your bucket is in the same region as this function. \n' + err);
            } else {
                var templates = yaml.safeLoad(templatesKeyData.Body);
                next(null, templates, submissionKeyData);
            }
        });
    };

    var sendEmail = function(templates, submissionKeyData, next) {
        console.log('Sending message..');

        var email;
        if (submissionKeyData.Metadata[config.emailMetaKey]) {
            email = submissionKeyData.Metadata[config.emailMetaKey];
        } else {
            email = config.defaultEmailFrom;
        }

        var template = templates["defalt"]; // use default template for now

        var mailOptions = {
            "from" : config.defaultEmailFrom,
            "to" : email + ',' + config.defaultEmailFrom,
            "subject" : template["subject"],
            "text" : template["text"],
        };

        var transporter = nodemailer.createTransport(sesTransport(sesOptions));
        transporter.sendMail(mailOptions, function(err, info){
            if (err) {
                next('Error: Sending email failed: ' + err)
            } else {
                next(null, info.response);
            }
        });
    };

    var ensurePrefix = function(prefix, key) {
        return key.substr(0, prefix.length) === prefix;
    };

    return {
        validateEvent: validateEvent,
        moveKey: moveKey,
        getEmailTemplates: getEmailTemplates,
        sendEmail: sendEmail,
    };
        
});

exports.handler = function(event, context) {

    var config = require('./config.js');
    var s3 = new aws.S3({apiVersion: config.AWS_API_VERSION});
    var app = new SubmissionNotifier(config, s3);
    console.log('Received event:\n', util.inspect(event, {depth:5}));

    async.waterfall(
        [
            app.validateEvent(event),
            app.moveKey,
            app.getEmailTemplates,
            app.sendEmail,
        ],
        function (err, result) {
            if (err) {
                console.error(err);
            } else {
                console.log('Processes completed successfully: ' + result);
            }
            context.done();            
        }
    );
};
