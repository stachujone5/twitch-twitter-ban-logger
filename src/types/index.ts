export interface Channel {
  readonly broadcaster_type: string
  readonly created_at: Date
  readonly description: string
  readonly display_name: string
  readonly id: string
  readonly login: string
  readonly offline_image_url: string
  readonly profile_image_url: string
  readonly type: string
  readonly view_count: number
}
