import dotenv from 'dotenv'
import tmi from 'tmi.js'

import { fetchChannelsInfo } from './helpers/fetchChannelsInfo'
import { fetchUserByName } from './helpers/fetchUserByName'
import { prisma } from './helpers/prisma'

dotenv.config()

const CHANNELS = [
  'h2p_gucio',
  'HasanAbi',
  'EWROON',
  'loltyler1',
  'kubon_',
  'boxbox',
  'akanemsko',
  'adamcy_',
  'xntentacion',
  'gosu',
  'scrubnoob',
  'paulinholokobr',
  'xqc',
  'kaicenat',
  'westcol'
]

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
  console.log(channel, username)

  const { id } = await fetchUserByName(username)

  // find user messages
  const messages = await prisma.messages.findMany({
    where: {
      user_id: id
    }
  })

  console.log(messages.map(m => m.content))
})

client.on('connected', async () => {
  try {
    const channelsInfo = await fetchChannelsInfo(CHANNELS)
    await prisma.channels.createMany({ data: channelsInfo.map(c => ({ name: c.login, id: c.id })) })
    console.log(`* Connected to ${CHANNELS.join(', ')}`)
  } catch (err) {
    console.log(err)
  }
})

void client.connect()
