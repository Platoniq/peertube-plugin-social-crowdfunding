import { Video } from '@peertube/peertube-types'
import type { RegisterClientOptions } from '@peertube/peertube-types/client'
import { Marked } from '@ts-stack/markdown'

async function register (
  { registerHook, peertubeHelpers }: RegisterClientOptions
): Promise<void> {
  registerHook({
    target: 'action:video-watch.video.loaded',
    handler: async ({ video }: { video: Video }) => {
      const enableGoteoCampaignValue: boolean =
        video.pluginData['enable-goteo-campaign']
      const goteoCampaignValue: string =
        video.pluginData['goteo-campaign']

      if (enableGoteoCampaignValue) {
        const elem = createAnchor(goteoCampaignValue)
        const $videoDescriptionList = document.getElementsByTagName('my-video-description')

        for (const element of $videoDescriptionList) {
          element.append(elem)
        }

        const listOfRewards: HTMLElement = document.createElement('section')
        listOfRewards.classList.add('goteo-project-reward-list')

        const baseRoute = peertubeHelpers.getBaseRouterRoute()
        const data = await fetch(`${baseRoute}/goteo/project/${goteoCampaignValue}/rewards`)
          .then(async (res) => res.json())

        for (const reward of data) {
          const rewardDiv: HTMLElement = document.createElement('article')
          rewardDiv.classList.add('goteo-project-reward')

          const rewardName: HTMLHeadingElement = document.createElement(
            'h3'
          )
          rewardName.classList.add('goteo-project-reward-name')
          rewardName.innerHTML = reward.name

          const rewardAmount: HTMLParagraphElement = document.createElement(
            'p'
          )
          rewardAmount.classList.add('goteo-project-reward-amount')
          rewardAmount.innerHTML = reward.amount

          const rewardDescription: HTMLParagraphElement = document.createElement('p')
          rewardDescription.classList.add('goteo-project-reward-description')
          rewardDescription.innerHTML = Marked.parse(reward.description)

          const rewardInvestAnchor: HTMLAnchorElement = document.createElement('a')
          rewardInvestAnchor.classList.add('btn', 'btn-primary')
          rewardInvestAnchor.href = `https://goteo.org/project/${goteoCampaignValue}/invest/${reward.id}`
          rewardInvestAnchor.innerHTML = await peertubeHelpers.translate('Donate').then(translations => translations)

          rewardDiv.append(rewardName)
          rewardDiv.append(rewardDescription)
          rewardDiv.append(rewardInvestAnchor)

          listOfRewards.append(rewardDiv)
        }

        $videoDescriptionList[0].append(listOfRewards)
      }
    }
  })
}

function createAnchor (goteoCampaignValue: string): HTMLAnchorElement {
  const elem: HTMLAnchorElement = document.createElement('a')
  elem.id = 'btn-fund-goteo-campaign'
  elem.className = 'btn btn-primary'
  elem.innerHTML = 'Dona a la campaña'
  elem.href = `https://goteo.org/project/${goteoCampaignValue}`
  elem.target = '_blank'

  return elem
}

export { register }
