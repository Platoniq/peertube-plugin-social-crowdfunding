import type { RegisterServerOptions } from '@peertube/peertube-types'

async function register ({ registerSetting }: RegisterServerOptions): Promise<void> {
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
}

async function unregister (): Promise<void> {}

module.exports = {
  register,
  unregister
}
