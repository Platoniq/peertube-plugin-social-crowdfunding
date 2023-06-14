import type { RegisterServerOptions } from '@peertube/peertube-types'

async function register ({ registerSetting, getRouter, settingsManager }: RegisterServerOptions): Promise<void> {
  registerSetting({
    name: 'goteo-url',
    label: 'Goteo URL',
    type: 'input',
    private: true,
    default: 'https://api.goteo.org/v1'
  })

  registerSetting({
    name: 'goteo-api-user',
    label: 'Goteo API User',
    type: 'input',
    private: true,
    default: ''
  })

  registerSetting({
    name: 'goteo-api-key',
    label: 'Goteo API Key',
    type: 'input',
    private: true,
    default: ''
  })

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
}

async function unregister (): Promise<void> {}

module.exports = {
  register,
  unregister
}
