import { TwitterApi } from 'twitter-api-v2'

const twitterClient = new TwitterApi()

export const createTwitterPost = async () => {
  try {
    await twitterClient.v1.tweet('Hello, this is a test.')
  } catch (err) {
    console.log(err)
  }
}
