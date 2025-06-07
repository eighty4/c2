import { EC2Client, RunInstancesCommand } from '@aws-sdk/client-ec2'
import { buildUserData } from '@eighty4/c2'

const userData = btoa(await buildUserData('cloud_init'))

const command = new RunInstancesCommand({
    ImageId: 'debian-12-arm64',
    InstanceType: 't2.micro',
    MinCount: 1,
    MaxCount: 1,
    InstanceName: 'my-instance-name',
    UserData: userData,
})

const output = await new EC2Client({}).send(command)
const instance = output.Instances[0]

console.log('created ec2 instance', instance.InstanceId, instance.Ipv4Address)
