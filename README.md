AWS Lambda Quick start
=========

This service processes documents sent to S3. It makes use of Amazon Lambda and S3 bucket events.
Here is the official walkthrough for [configuring S3 and Lambda](http://docs.aws.amazon.com/lambda/latest/dg/walkthrough-s3-events-adminuser.html).
The Setup steps below are only a summary for ongoing development. 
This code is and setup is further explained in my blog https://peekandpoke.wordpress.com/2015/02/26/dancing-the-lambada-with-aws-lambda-or-sending-emails-on-s3-events/

# Development Setup and Testing

1. Install pip
  * Download: curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
  * Install: sudo python get-pip.py
2. Use a python virtual environment
  * Install: sudo pip install virtualenv
  * Create: virtualenv lambda-env
  * Activate: source lambda-env/bin/activate
3. Install node using a virtual environment
  * Install nodeenv: pip install nodeenv
  * Install node: nodeenv -p --node=0.10.32 nenv
  * Update npm (installed with node): npm install npm -g
4. Install Amazon AWS [cli tools](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html)
  * Install: pip install awscli
  * Configure: aws configure
5. Update Lambda Function
  * Clone project: git@github.com:rmauge/aws-lambda-s3-email.git
  * Zip directory: 
   ```
   cd aws-lambda-s3-email/ && zip -r ../aws-lambda-s3-email.zip . -x build/ test/ *~ *.git* .gitignore && cd ..
   ```
  * Submit update:
  ``` 
  aws lambda upload-function
      --region us-east-1
      --function-name lambdaSubmissionFunction
      --function-zip aws-lambda-s3-email.zip
      --role arn:aws:iam::99999999:role/lamdba_exec_role
      --mode event
      --handler index.handler
      --runtime nodejs
      --debug
      --timeout 10
      --memory-size 128
    ```
6. Test function manually
  *
   ```
   aws lambda invoke-async --function-name lambdaSubmissionFunction --region us-east-1 --invoke-args aws-lambda-s3-email/test/submissionexample.txt --debug
   ```
  * When testing the key must exist in the S3 bucket

# AWS Policies and Roles
The Lambda Function requires certain roles/policies to work. These are:
An IAM user to send email (ses-smtp-user)
A role and policy allowing a bucket event to invoke a Lambda Function (lambda_invoke_role)
A role and policy allowing the Lambda Function to access the S3 bucket (lamdba_exec_role)
