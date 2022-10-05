import tmi from 'tmi.js'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { fetchChannelsInfo } from './helpers/fetchChannelsInfo'

const prisma = new PrismaClient()

dotenv.config()

const CHANNELS = ['h2p_gucio']

const opts = {
  identity: {
    username: 'goniu_sroniu',
    password: process.env.TWITCH_AUTH
  },
  channels: [...CHANNELS]
}

const client = new tmi.Client(opts)

client.on('ban', (channel, username) => {
  console.log(channel, username)
})

client.on('message', async (channel, u, message) => {
  const user = await prisma.users.findFirst({
    where: {
      id: u['user-id']
    }
  })

  if (!user) {
    await prisma.users.create({
      data: {
        id: u['user-id']!,
        name: u.username!
      }
    })
  }

  const msg = await prisma.message.create({
    data: {
      userId: u['user-id']!,
      channelId: u['room-id']!,
      userName: u.username!,
      content: message
    }
  })

  console.log('created message: ', msg)
})

const onConnect = async () => {
  const channelsInfo = await fetchChannelsInfo(CHANNELS)
  await prisma.channels.createMany({ data: channelsInfo.map(c => ({ name: c.login, id: c.id })) })
  console.log(`* Connected to ${CHANNELS.join(', ')}`)
}

client.on('connected', onConnect)

client.connect()
