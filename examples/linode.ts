import { buildUserData } from '@eighty4/c2'
import { createLinode, setToken } from '@linode/api-v4'

if (process.env.LINODE_TOKEN) {
    setToken(process.env.LINODE_TOKEN)
} else {
    throw new Error('LINODE_TOKEN env var is required')
}

// build user data payload and base64 encode it
const userData = btoa(await buildUserData('cloud_init'))

const linode = await createLinode({
    label: 'linode-c2-example',
    region: 'us-sea',
    image: 'linode/debian12',
    type: 'g6-nanode-1',
    root_pass: 'BeeGeesBeforeAbba',
    metadata: {
        user_data: userData,
    },
})

console.log('created linode', linode.id, linode.label, linode.ipv4[0])
