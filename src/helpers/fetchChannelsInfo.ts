import axios from 'axios'

import type { Channel } from './fetchUserByName'

export const fetchChannelsInfo = async (channels: readonly string[]) => {
  try {
    if (!process.env.TWITCH_ACCESS_TOKEN || !process.env.TWITCH_CLIENT_ID) {
      throw new Error('Provide auth variables in .env file!')
    }

    const { data } = await axios.get<{ readonly data: readonly Channel[] }>(
      `https://api.twitch.tv/helix/users?login=${channels.join(`&login=`)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID
        }
      }
    )

    return data.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(err.message)
    }
    throw new Error('Failed to fetch channels')
  }
}
