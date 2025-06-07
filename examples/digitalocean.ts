import { buildUserData } from '@eighty4/c2'
import DigitalOcean from 'dots-wrapper'

if (!process.env.DIGITALOCEAN_TOKEN) {
    throw new Error('DIGITALOCEAN_TOKEN env var is required')
}

const userData = btoa(await buildUserData('cloud_init'))

const client = new DigitalOcean({
    token: process.env.DIGITALOCEAN_TOKEN,
})

await client.droplets.create()
