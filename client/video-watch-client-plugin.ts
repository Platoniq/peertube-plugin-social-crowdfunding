import type { RegisterClientOptions } from '@peertube/peertube-types/client'

async function register ({ registerHook }: RegisterClientOptions): Promise<void> {
  registerHook({
    target: 'action:video-watch.video.loaded',
    handler: () => {
      const elem = document.createElement('a')

      elem.id = 'btn-fund-goteo-campaign'
      elem.className = 'btn btn-primary'
      elem.innerHTML = 'Dona a la campaña'
      elem.href = 'https://goteo.org/'
      elem.target = '_blank'

      const $videoDescriptionList = document.getElementsByTagName('my-video-description')

      for (const element of $videoDescriptionList) {
        element.append(elem)
      }
    }
  })
}

export {
  register
}
