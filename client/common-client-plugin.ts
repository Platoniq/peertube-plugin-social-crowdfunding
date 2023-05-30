import type { RegisterClientOptions  } from '@peertube/peertube-types/client'
import type { RegisterClientFormFieldOptions, RegisterClientVideoFieldOptions } from '@peertube/peertube-types/shared/models'
/*
NB: if you need some types like `video`, `playlist`, ..., you can import them like that:
import type { Video } from '@peertube/peertube-types'
*/

async function register ({ peertubeHelpers, registerVideoField }: RegisterClientOptions): Promise<void> {
  const enableGoteoOptions: RegisterClientFormFieldOptions  = {
    name: 'enable-goteo-campaign',
    label: 'Enable Goteo Campaign',
    descriptionHTML: 'This options enables the connection with a campaign in the CrowdFunding platform Goteo.org',

    // type: 'input' | 'input-checkbox' | 'input-password' | 'input-textarea' | 'markdown-text' | 'markdown-enhanced' | 'select' | 'html'
    // /!\ 'input-checkbox' could send "false" and "true" strings instead of boolean
    type: 'input-checkbox',

    default: false,
  }

  const campaignGoteoOptions : RegisterClientFormFieldOptions = {
    name: 'goteo-campaign',
    label: 'Goteo Campaign ID',
    descriptionHTML: 'This is the ID of the campaign in Goteo.org',

    type: 'input',
    default: ''
  }


  for (const type of [ 'upload', 'import-url', 'import-torrent', 'update', 'go-live' ]) {
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
