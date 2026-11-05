// Lets browser tabs of the same site tell each other that the session has ended
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ats-auth') : null

export const broadcastLogout = () => channel?.postMessage('logout')

// The callback runs in the other tabs only, never in the tab that sent the message
export const onLogoutBroadcast = (callback: () => void) => {
  channel?.addEventListener('message', e => {
    if (e.data === 'logout') callback()
  })
}
