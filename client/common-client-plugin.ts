import type { RegisterClientOptions } from '@peertube/peertube-types/client'
import type { RegisterClientFormFieldOptions, RegisterClientVideoFieldOptions } from '@peertube/peertube-types'

async function register ({ registerVideoField }: RegisterClientOptions): Promise<void> {
  const enableGoteoOptions: RegisterClientFormFieldOptions = {
    name: 'enable-goteo-campaign',
    label: 'Enable Goteo Campaign',
    descriptionHTML: 'This options enables the connection with a campaign in the CrowdFunding platform Goteo.org',
    type: 'input-checkbox',
    default: false
  }

  const campaignGoteoOptions: RegisterClientFormFieldOptions = {
    name: 'goteo-campaign',
    label: 'Goteo Campaign ID',
    descriptionHTML: 'This is the ID of the campaign in Goteo.org',
    type: 'input',
    default: ''
  }

  for (const type of ['upload', 'import-url', 'import-torrent', 'update', 'go-live']) {
    const videoFormOptions: RegisterClientVideoFieldOptions = {
      type: type as RegisterClientVideoFieldOptions['type'],
      tab: 'main'
    }

    registerVideoField(enableGoteoOptions, videoFormOptions)
    registerVideoField(campaignGoteoOptions, videoFormOptions)
  }
}

export {
  register
}
