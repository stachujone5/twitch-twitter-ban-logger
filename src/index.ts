import dotenv from 'dotenv'
import tmi from 'tmi.js'

import { fetchChannelsInfo } from './helpers/fetchChannelsInfo'
import { fetchStreamsInfo } from './helpers/fetchStreamsInfo'
import { fetchUserByName } from './helpers/fetchUserByName'
import { prisma } from './helpers/prisma'

dotenv.config()

const CHANNELS = [
  'cinkrofwest',
  'overpow',
  'bartek_ja_to',
  'sawardega',
  'meduska',
  'aki_997',
  'banduracartel',
  'kamyk',
  'slayproxx',
  'kubx',
  'testree',
  'xn0rth'
]

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
    const { id } = await fetchUserByName(username)
    const { id: channelId } = await fetchUserByName(channel.slice(1))

    // channel is offline
    if (!liveChannelsIds.includes(channelId)) return

    const messages = await prisma.messages.findMany({ where: { user_id: id } })

    if (messages.length) {
      // user has messages

      console.log(
        `${username} banned in channel ${channel.slice(1)}
        ${messages.slice(-3).map(m => `${username}: ${m.content}`).join(` 
        `)}`
      )
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
  try {
    const streamsInfo = await fetchStreamsInfo(CHANNELS)

    liveChannelsIds = streamsInfo.map(c => c.user_id)

    // delete all messages in offline channels
    const messages = await prisma.messages.deleteMany({
      where: {
        channel_id: {
          not: { in: liveChannelsIds }
        }
      }
    })

    if (messages.count) {
      console.log(`Deleted ${messages.count} messages`)
    }
  } catch (err) {
    console.log(err)
  }
}, 1000)
