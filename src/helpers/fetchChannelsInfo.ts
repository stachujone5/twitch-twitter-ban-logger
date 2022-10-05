import axios from 'axios'

interface Channel {
  id: string
  login: string
  display_name: string
  type: string
  broadcaster_type: string
  description: string
  profile_image_url: string
  offline_image_url: string
  view_count: number
  created_at: Date
}

export const fetchChannelsInfo = async (channels: string[]) => {
  try {
    if (!process.env.TWITCH_ACCESS_TOKEN || !process.env.TWITCH_CLIENT_ID) {
      throw new Error('Provide auth variables in .env file!')
    }

    const data = await axios.get<{ data: Channel[] }>(
      `https://api.twitch.tv/helix/users?login=${channels.join(`&login=`)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
          'Client-Id': process.env.TWITCH_CLIENT_ID
        }
      }
    )

    return data.data.data
  } catch (err) {
    console.log(err)
    throw new Error('Failed to fetch channels')
  }
}
