import type { RegisterClientOptions } from "@peertube/peertube-types/client"

async function register ({ registerHook, peertubeHelpers }: RegisterClientOptions ): Promise<void> {

    registerHook({
        target: 'action:video-channel-videos.video-channel.loaded',
        handler: () => {
            const elem = document.createElement('a')

            elem.id = 'btn-fund-goteo-campaign'
            elem.className = 'btn btn-primary'
            elem.innerHTML = 'Dona a la campaña'
            elem.href = 'https://goteo.org/'
            elem.target = '_blank'
        
            const $videoChannelList = document.getElementsByTagName('my-video-channel-videos');

            // iterate through videodescriptionlist
            for (const element of $videoChannelList) {
                element.before(elem)
            }
        }
    })
}

export {
    register
}