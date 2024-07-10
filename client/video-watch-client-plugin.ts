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
      const baseRoute: string = peertubeHelpers.getBaseRouterRoute()
      const settings = await peertubeHelpers.getSettings()
      const platformURL = settings['gote-platform-url'] as string

      if (!enableGoteoCampaignValue)
        return

      const $videoDescriptionList = document.getElementsByTagName('my-video-description')

      const projectData = await fetch(`${baseRoute}/goteo/project/${goteoCampaignValue}`)
        .then(async (res) => res.json())

      const amountFormated = new Intl.NumberFormat(undefined, { style: "currency", currency: projectData.currency }).format(projectData.amount)
      const minimumFormated = new Intl.NumberFormat(undefined, { style: "currency", currency: projectData.currency }).format(projectData.minimum)
      const donateText = await peertubeHelpers.translate('Donate').then(translations => translations)
      const projectInfo = `
<section class="project-details">
  <div class="row">
    <div class="col-md-4">
      <img src="${projectData.imgUrl}" title="${projectData.name}" class="img-thumbnail" width=150 height=150>
    </div>
    <div class="col-md-8">
      <h3>${projectData.name}</h3>
      <a id="btn-fund-goteo-campaign" class="btn btn-primary" href="${platformURL}/project/${projectData.id}" target="_blank">${donateText}</a>
    </div>
  </div>
  <div class="row amount-details">
    <div class="col-md-6"><span>${amountFormated}</span></div>
    <div class="col-md-6"><span>${minimumFormated}</span></div>
  </div>
</section>`

      for (const element of $videoDescriptionList) {
        element.innerHTML += projectInfo
      }

      const listOfRewards: HTMLElement = document.createElement('section')
      listOfRewards.classList.add('goteo-project-reward-list')

      const data = await fetch(`${baseRoute}/goteo/project/${goteoCampaignValue}/rewards`)
        .then(async (res) => res.json())

      for (const reward of data) {
        const rewardDiv: HTMLElement = document.createElement('article')
        rewardDiv.classList.add('goteo-project-reward')

        const rewardName: HTMLHeadingElement = document.createElement('h3')
        rewardName.classList.add('goteo-project-reward-name')
        rewardName.innerHTML = reward.name

        const rewardAmount: HTMLParagraphElement = document.createElement('p')
        rewardAmount.classList.add('goteo-project-reward-amount')
        rewardAmount.innerHTML = reward.amount

        const rewardDescription: HTMLParagraphElement = document.createElement('p')
        rewardDescription.classList.add('goteo-project-reward-description')
        rewardDescription.innerHTML = Marked.parse(reward.description)

        const rewardInvestAnchor: HTMLAnchorElement = document.createElement('a')
        rewardInvestAnchor.classList.add('btn', 'btn-primary')
        rewardInvestAnchor.href = `${platformURL}/project/${goteoCampaignValue}/invest/${reward.id}`
        rewardInvestAnchor.innerHTML = await peertubeHelpers.translate('Donate').then(translations => translations)

        rewardDiv.append(rewardName)
        rewardDiv.append(rewardDescription)
        rewardDiv.append(rewardInvestAnchor)

        listOfRewards.append(rewardDiv)
      }

      $videoDescriptionList[0].append(listOfRewards)
    }
  })
}

export { register }
