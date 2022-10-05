import tmi from 'tmi.js'
import dotenv from 'dotenv'

dotenv.config()

const opts = {
  identity: {
    username: 'goniu_sroniu',
    password: process.env.TWITCH_AUTH
  },
  channels: ['goniu_sroniu']
}

const client = new tmi.Client(opts)

client.on('ban', (channel, username) => {
  console.log(channel, username)
})

const onConnectedHandler = (addr: string) => {
  console.log(`* Connected to ${addr}`)
}

client.on('connected', onConnectedHandler)

client.connect()
