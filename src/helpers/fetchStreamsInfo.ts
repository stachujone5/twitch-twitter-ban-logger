import axios from 'axios'

interface StreamInfo {
  readonly game_id: string
  readonly game_name: string
  readonly id: string
  readonly is_mature: boolean
  readonly language: string
  readonly started_at: Date
  readonly tag_ids: readonly string[]
  readonly thumbnail_url: string
  readonly title: string
  readonly type: string
  readonly user_id: string
  readonly user_login: string
  readonly user_name: string
  readonly viewer_count: number
}

export const fetchStreamsInfo = async (channels: readonly string[]) => {
  try {
    if (!process.env.TWITCH_ACCESS_TOKEN || !process.env.TWITCH_CLIENT_ID) {
      throw new Error('Provide auth variables in .env file!')
    }

    const { data } = await axios.get<{ readonly data: readonly StreamInfo[] }>(
      `https://api.twitch.tv/helix/streams?user_login=${channels.join(`&user_login=`)}`,
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
