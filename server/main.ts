import type { RegisterServerOptions, RegisterServerSettingOptions, RegisterServerHookOptions, MVideoFullLight } from '@peertube/peertube-types'

async function register ({ registerSetting, getRouter, settingsManager, registerHook, storageManager }: RegisterServerOptions): Promise<void> {

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
  router.get('/login', async (req, res) => {

    const username = await settingsManager.getSetting('goteo-api-user')
    const apikey = await settingsManager.getSetting('goteo-api-key')

    const fetch = require('node-fetch')
    const response = await fetch('https://api.goteo.org/v1/login', {
      headers: {
        'Authorization': 'Basic ' + btoa(username + ":" + apikey)
      }
    }).json()

    res.send(response)
  })

  router.get('/goteo/project/:id/rewards', async (req, res) => {
    const username = await settingsManager.getSetting('goteo-api-user')
    const apikey = await settingsManager.getSetting('goteo-api-key')

    const project = req.params.id

    const fetch = require('node-fetch')
    const response = await fetch('https://api.goteo.org/v1/projects/' + project, {
      headers: {
        'Authorization': 'Basic ' + btoa(username + ":" + apikey)
      }
    })

    const data = await response.json()
    res.send(data.rewards)
  })

  const updateVideoHook: RegisterServerHookOptions = {
    target: 'action:api.video.updated',
    handler: async (params: any) => {
      const video = params.video as MVideoFullLight
      const body = params.body
 
      if (!body.pluginData) return

      const enableGoteoOptionValue = body.pluginData['enable-goteo-campaign']
      if (!enableGoteoOptionValue) return

      const goteoCampaignOptionValue = body.pluginData['goteo-campaign']
      if (!goteoCampaignOptionValue) return

      storageManager.storeData('enable-goteo-campaign-' + video.id, enableGoteoOptionValue)
      storageManager.storeData('goteo-campaign-' + video.id, goteoCampaignOptionValue)
    }
  }

  registerHook(updateVideoHook)

  const videoGetResultHook: RegisterServerHookOptions = {
    target: 'filter:api.video.get.result',
    handler: async (video: any) => {
      if (!video) return video
      if (!video.pluginData) video.pluginData = {}

      const enableGoteoOptionValue = await storageManager.getData('enable-goteo-campaign-' + video.id)
      const goteoCampaignOptionValue = await storageManager.getData('goteo-campaign-' + video.id)

      console.log('enableGoteoOptionValue', enableGoteoOptionValue)
      console.log('goteoCampaignOptionValue', goteoCampaignOptionValue)

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
