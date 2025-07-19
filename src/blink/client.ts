import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'slack-clone-n1vybohz',
  authRequired: true
})

export default blink