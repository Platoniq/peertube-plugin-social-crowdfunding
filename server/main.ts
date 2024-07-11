import type {
  RegisterServerOptions,
  RegisterServerSettingOptions,
  RegisterServerHookOptions,
  MVideoFullLight,
  Video
} from '@peertube/peertube-types'

import('node-fetch')

async function register ({
  registerSetting,
  getRouter,
  settingsManager,
  registerHook,
  storageManager
}: RegisterServerOptions): Promise<void> {
  const goteoAPIURLSetting: RegisterServerSettingOptions = {
    name: 'goteo-api-url',
    label: 'Goteo API URL',
    type: 'input',
    private: false,
    default: 'https://api.goteo.org/v1'
  }

  const goteoPlatformURLSetting: RegisterServerSettingOptions = {
    name: 'goteo-platform-url',
    label: 'Goteo Platform URL',
    descriptionHTML: 'This is the platform URL (i.e. https://goteo.org)',
    type: 'input',
    private: false,
    default: 'https://goteo.org'
  }

  const goteoAPIUserSetting: RegisterServerSettingOptions = {
    name: 'goteo-api-user',
    label: 'Goteo API User',
    type: 'input',
    private: true,
    default: ''
  }

  const goteoAPIKeySetting: RegisterServerSettingOptions = {
    name: 'goteo-api-key',
    label: 'Goteo API Key',
    type: 'input-password',
    private: true,
    default: ''
  }

  registerSetting(goteoPlatformURLSetting)
  registerSetting(goteoAPIURLSetting)
  registerSetting(goteoAPIUserSetting)
  registerSetting(goteoAPIKeySetting)

  const router = getRouter()
  router.get('/login', async (_, res) => {
    try {
      const username = await settingsManager.getSetting('goteo-api-user') as string
      const apikey = await settingsManager.getSetting('goteo-api-key') as string
      const apiUrl = await settingsManager.getSetting('goteo-api-url') as string

      if (username && apikey) {

        const response = await fetch(`${apiUrl}/login`, {
          headers: {
            Authorization: 'Basic ' + btoa(username + ':' + apikey)
          }
        })

        const data = await response.json()
        return res.send(data)
      } else {
        return res.status(404).send({ error: 'Goteo API not correctly configured.' })
      }
    } catch (error) {
      return res.status(500).send({ error: 'Goteo API server error' })
    }
  })

  router.get('/goteo/project/:id/rewards', async (req, res) => {
    try {
      const username = await settingsManager.getSetting('goteo-api-user') as string
      const apikey = await settingsManager.getSetting('goteo-api-key') as string
      const apiUrl = await settingsManager.getSetting('goteo-api-url') as string
      const project = req.params.id

      const response = await fetch(`${apiUrl}/projects/${project}`, {
        headers: {
          Authorization: 'Basic ' + btoa(`${username}:${apikey}`)
        }
      })

      const data: any = await response.json()
      return res.send(data.rewards)
    } catch (error) {
      const message = error.message as string
      return res.status(500).send({ error: 'Goteo API server error catch' + message })
    }
  })

  router.get('/goteo/project/:id', async (req, res) => {
    try {
      const username = await settingsManager.getSetting('goteo-api-user') as string
      const apikey = await settingsManager.getSetting('goteo-api-key') as string
      const apiUrl = await settingsManager.getSetting('goteo-api-url') as string
      const project = req.params.id

      const response = await fetch(`${apiUrl}/projects/${project}`, {
        headers: {
          Authorization: 'Basic ' + btoa(`${username}:${apikey}`)
        }
      })

      const data: any = await response.json()
      const projectData = {
        id: data.id,
        name: data.name,
        description: data.description,
        amount: data.amount,
        about: data.about,
        imgUrl: data['image-url'],
        minimum: data.minimum,
        currency: data.currency
      }

      return res.send(projectData)
    } catch (error) {
      const message = error.message as string
      return res.status(500).send({ error: 'Goteo API server error catch' + message })
    }
  })

  const updateVideoHook: RegisterServerHookOptions = {
    target: 'action:api.video.updated',
    handler: async ({ video, body }: {video: MVideoFullLight, body: any}) => {
      if (!body.pluginData) return

      const enableGoteoOptionValue = body.pluginData['enable-goteo-campaign']
      if (!enableGoteoOptionValue) return

      const goteoCampaignOptionValue = body.pluginData['goteo-campaign']
      if (!goteoCampaignOptionValue) return

      await storageManager.storeData(`enable-goteo-campaign-${video.id}`, enableGoteoOptionValue)
      await storageManager.storeData(`goteo-campaign-${video.id}`, goteoCampaignOptionValue)
    }
  }

  registerHook(updateVideoHook)

  const videoGetResultHook: RegisterServerHookOptions = {
    target: 'filter:api.video.get.result',
    handler: async (video: Video): Promise<Video> => {
      if (!video.pluginData) video.pluginData = {}

      const enableGoteoOptionValue = await storageManager.getData(`enable-goteo-campaign-${video.id}`)
      const goteoCampaignOptionValue = await storageManager.getData(`goteo-campaign-${video.id}`)

      video.pluginData['enable-goteo-campaign'] = enableGoteoOptionValue
      video.pluginData['goteo-campaign'] = goteoCampaignOptionValue

      return video
    }
  }
  registerHook(videoGetResultHook)
}

async function unregister (): Promise<void> {}

module.exports = {
  register,
  unregister
}
