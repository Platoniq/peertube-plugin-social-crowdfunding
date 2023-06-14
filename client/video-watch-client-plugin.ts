import type { RegisterClientOptions } from '@peertube/peertube-types/client'
import { Marked } from '@ts-stack/markdown'

async function register ({ registerHook, peertubeHelpers }: RegisterClientOptions): Promise<void> {
  registerHook({
    target: 'action:video-watch.video.loaded',
    handler: () => {
      const elem: HTMLAnchorElement  = document.createElement('a')

      elem.id = 'btn-fund-goteo-campaign'
      elem.className = 'btn btn-primary'
      elem.innerHTML = 'Dona a la campaña'
      elem.href = 'https://goteo.org/'
      elem.target = '_blank'

      let listOfRewards: HTMLDivElement = document.createElement('div')
      listOfRewards.classList.add('goteo-project-reward-list')

      const $videoDescriptionList = document.getElementsByTagName('my-video-description')

      fetch(peertubeHelpers.getBaseRouterRoute() + '/goteo/project/salvaje/rewards')
        .then(res => res.json())
        .then((data) => {
          for (const reward of data) {

            let rewardDiv: HTMLDivElement = document.createElement('div')
            rewardDiv.classList.add('goteo-project-reward')

            let rewardName: HTMLHeadingElement = document.createElement('h3')
            rewardName.classList.add('goteo-project-reward-name')
            rewardName.innerHTML = reward.name

            let rewardAmount: HTMLParagraphElement = document.createElement('p')
            rewardAmount.classList.add('goteo-project-reward-amount')
            rewardAmount.innerHTML = reward.amount

            let rewardDescription: HTMLParagraphElement = document.createElement('p')
            rewardDescription.classList.add('goteo-project-reward-description')
            rewardDescription.innerHTML = Marked.parse(reward.description)

            let rewardInvesAnchor: HTMLAnchorElement = document.createElement('a')
            rewardInvesAnchor.classList.add('btn', 'btn-primary')
            rewardInvesAnchor.href = 'https://goteo.org/project/salvaje/invest/' + reward.id
            rewardInvesAnchor.innerHTML = "Donate"

            rewardDiv.append(rewardName)
            rewardDiv.append(rewardDescription)
            rewardDiv.append(rewardInvesAnchor)

            listOfRewards.append(rewardDiv)
          }

          $videoDescriptionList[0].append(listOfRewards)
        })

      for (const element of $videoDescriptionList) {
        element.append(elem)
      }
    }
  })
}

export {
  register
}
