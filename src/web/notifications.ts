import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import i18n from './i18n'

const REMINDER_ID = 1

// Programa (o reprograma) la notificación diaria nativa según reminderTime.
// En web es un no-op: el navegador no permite notificaciones programadas offline.
export const syncDailyReminder = async (time: string | undefined): Promise<void> => {
  if (!Capacitor.isNativePlatform()) return

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })

  const [hour, minute] = (time ?? '').split(':').map(Number)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return

  let perm = await LocalNotifications.checkPermissions()
  if (perm.display === 'prompt' || perm.display === 'prompt-with-rationale') {
    perm = await LocalNotifications.requestPermissions()
  }
  if (perm.display !== 'granted') return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: i18n.t('reminder.title'),
        body: i18n.t('reminder.body'),
        schedule: { on: { hour, minute }, allowWhileIdle: true },
      },
    ],
  })
}
