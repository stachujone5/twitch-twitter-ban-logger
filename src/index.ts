import dotenv from 'dotenv'
import tmi from 'tmi.js'

import { fetchChannelsInfo } from './helpers/fetchChannelsInfo'
import { fetchStreamsInfo } from './helpers/fetchStreamsInfo'
import { fetchUserByName } from './helpers/fetchUserByName'
import { prisma } from './helpers/prisma'

dotenv.config()

const CHANNELS = ['crownycro']

// eslint-disable-next-line -- let needed
let liveChannelsIds: string[] = []

export const client = new tmi.Client({
  identity: {
    username: 'goniu_sroniu',
    password: process.env.TWITCH_AUTH
  },
  channels: [...CHANNELS]
})

client.on('message', async (_, client, message) => {
  try {
    const { 'room-id': channel_id, 'user-id': user_id } = client

    if (!user_id || !channel_id) {
      throw new Error('Missing client data!')
    }

    const user = await prisma.users.findFirst({
      where: {
        id: user_id
      }
    })

    if (!user) {
      await prisma.users.create({
        data: {
          id: user_id
        }
      })
    }

    await prisma.messages.create({
      data: {
        user_id,
        channel_id,
        content: message
      }
    })
  } catch (err) {
    console.log(err)
  }
})

client.on('ban', async (channel, username) => {
  try {
    const { id: streamerId } = await fetchUserByName(channel)

    const isLive = liveChannelsIds.includes(streamerId)

    if (!isLive) return

    const { id: viewerId } = await fetchUserByName(username)

    const user = await prisma.users.findFirst({ where: { id: viewerId } })

    if (user) {
      // user exists if he has any messages
      console.log(`Channel: ${channel}, User: ${username}`)

      // find user messages
      const messages = await prisma.messages.findMany({
        where: {
          user_id: viewerId
        }
      })

      console.log(messages.map(m => m.content))
    }
  } catch (err) {
    console.log(err)
  }
})

client.on('connected', async () => {
  try {
    const channelsInfo = await fetchChannelsInfo(CHANNELS)
    await prisma.channels.createMany({ data: channelsInfo.map(c => ({ id: c.id })) })
  } catch (err) {
    console.log(err)
  }
})

void client.connect()

setInterval(async () => {
  const streamsInfo = await fetchStreamsInfo(CHANNELS)

  liveChannelsIds = streamsInfo.map(c => c.user_id)

  // delete all messages in offline channels
  const deltedMessages = await prisma.messages.deleteMany({
    where: {
      channel_id: {
        not: { in: liveChannelsIds }
      }
    }
  })

  console.log(`Deleted ${deltedMessages.count} messages`)
}, 30000)
