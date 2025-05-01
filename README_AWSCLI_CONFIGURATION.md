## Configure AWS CLI
### IAM User with Access Keys

 * You will need to create an IAM user, to securely manage access to your AWS resources.
 * Sign in to the `AWS Management Console` and go to the `IAM` Service.
 * in the left sidebar click on `Users` and select the IAM user for whom you want to create access keys.
 * On the `User` details page, click on `Security credentials` tab.
 * Scroll down to the `Access keys` section, click on `Create access key`, select `Command Line Interface (CLI)`, and then click `Next`, afterwards click `Create access key`.
 * Download the .csv file or copy the Access key ID and Secret access key. You will need them to configure the AWS CLI.

### Configure AWS CLI
 * Run the following command to configure AWS CLI:
``` 
aws configure
``` 
 * You will be prompted to enter:
   * AWS Access Key ID
   * AWS Secret Access Key
   * Default region name (for example, us-east-1)
   * Default output format (such as json)
 * These credentials allow you to interact with AWS services from your machine.