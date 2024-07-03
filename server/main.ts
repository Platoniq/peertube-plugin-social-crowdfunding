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
  const goteoURLSetting: RegisterServerSettingOptions = {
    name: 'goteo-url',
    label: 'Goteo URL',
    type: 'input',
    private: true,
    default: 'https://api.goteo.org/v1'
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

  registerSetting(goteoURLSetting)
  registerSetting(goteoAPIUserSetting)
  registerSetting(goteoAPIKeySetting)

  const router = getRouter()
  router.get('/login', async (_, res) => {
    try {
      const username = await settingsManager.getSetting('goteo-api-user') as string
      const apikey = await settingsManager.getSetting('goteo-api-key') as string

      if (username && apikey) {
        const response = await fetch('https://api.goteo.org/v1/login', {
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
      const project = req.params.id

      const response = await fetch(`https://api.goteo.org/v1/projects/${project}`, {
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
