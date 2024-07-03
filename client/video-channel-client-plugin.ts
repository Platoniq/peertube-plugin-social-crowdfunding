import type { RegisterClientOptions } from '@peertube/peertube-types/client'

async function register ({ registerHook, peertubeHelpers }: RegisterClientOptions): Promise<void> {
  registerHook({
    target: 'action:video-channel-videos.video-channel.loaded',
    handler: async () => {
      const elem = document.createElement('a')

      elem.id = 'btn-fund-goteo-campaign'
      elem.className = 'btn btn-primary'
      elem.innerHTML = await peertubeHelpers.translate('Donate').then(translations => translations)
      elem.href = 'https://goteo.org/'
      elem.target = '_blank'

      const $videoChannelList = document.getElementsByTagName('my-video-channel-videos')

      for (const element of $videoChannelList) {
        element.before(elem)
      }
    }
  })
}

export {
  register
}
