'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { Notification, Activity, UserPresence } from '@/types'
import { toast } from 'sonner'

// State
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  activities: Activity[]
  onlineUsers: UserPresence[]
  isConnected: boolean
  soundEnabled: boolean
}

// Actions
type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'SET_ONLINE_USERS'; payload: UserPresence[] }
  | { type: 'UPDATE_USER_PRESENCE'; payload: UserPresence }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'TOGGLE_SOUND' }

// Reducer
function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.read).length,
      }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }
    case 'REMOVE_NOTIFICATION':
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      )
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
        unreadCount: notification && !notification.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload }
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 50),
      }
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload }
    case 'UPDATE_USER_PRESENCE':
      const existingIndex = state.onlineUsers.findIndex(
        (u) => u.id === action.payload.id
      )
      if (existingIndex >= 0) {
        const newUsers = [...state.onlineUsers]
        newUsers[existingIndex] = action.payload
        return { ...state, onlineUsers: newUsers }
      }
      return { ...state, onlineUsers: [...state.onlineUsers, action.payload] }
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled }
    default:
      return state
  }
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  activities: [],
  onlineUsers: [],
  isConnected: false,
  soundEnabled: true,
}

// Context
interface NotificationContextType extends NotificationState {
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  toggleSound: () => void
  sendEmergencyAlert: (type: string, location: string, department: string) => void
  sendTaskNotification: (taskId: string, assigneeId: string, title: string) => void
  sendHandoverRequest: (fromNurse: string, toNurseId: string, patientName: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

// Provider
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  // Simulate Firebase Realtime connection
  useEffect(() => {
    // In production, this would connect to Firebase Realtime Database
    // const unsubscribe = onValue(ref(realtimeDb, 'notifications'), (snapshot) => {
    //   const data = snapshot.val()
    //   dispatch({ type: 'SET_NOTIFICATIONS', payload: Object.values(data || {}) })
    // })

    // Simulate connection
    const connectTimeout = setTimeout(() => {
      dispatch({ type: 'SET_CONNECTED', payload: true })
    }, 1000)

    // Simulate initial notifications
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'emergency_code',
        title: 'Code Blue Activated',
        titleAr: 'تفعيل كود أزرق',
        message: 'Code Blue in ICU - Room 302',
        messageAr: 'كود أزرق في العناية المركزة - غرفة 302',
        priority: 'urgent',
        read: false,
        actionUrl: '/emergency',
        actionLabel: 'View Details',
        actionLabelAr: 'عرض التفاصيل',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        recipientId: 'all',
      },
      {
        id: '2',
        type: 'handover_request',
        title: 'Handover Request',
        titleAr: 'طلب تسليم مناوبة',
        message: 'Sarah Ahmed requested handover for 5 patients',
        messageAr: 'سارة أحمد طلبت تسليم 5 مرضى',
        priority: 'high',
        read: false,
        actionUrl: '/handover',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        recipientId: 'user-1',
        senderId: 'user-2',
        senderName: 'سارة أحمد',
      },
      {
        id: '3',
        type: 'vital_alert',
        title: 'Critical Vital Signs',
        titleAr: 'علامات حيوية حرجة',
        message: 'Patient Ahmed Hassan (MRN: 12345) - Low oxygen saturation',
        messageAr: 'المريض أحمد حسن (MRN: 12345) - انخفاض تشبع الأكسجين',
        priority: 'urgent',
        read: false,
        actionUrl: '/vitals',
        createdAt: new Date(Date.now() - 900000).toISOString(),
        recipientId: 'user-1',
      },
      {
        id: '4',
        type: 'task_overdue',
        title: 'Overdue Task',
        titleAr: 'مهمة متأخرة',
        message: 'Medication administration for Room 201 is overdue',
        messageAr: 'إعطاء الأدوية للغرفة 201 متأخر',
        priority: 'high',
        read: true,
        actionUrl: '/tasks',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        recipientId: 'user-1',
      },
      {
        id: '5',
        type: 'inventory_low',
        title: 'Low Stock Alert',
        titleAr: 'تنبيه انخفاض المخزون',
        message: 'IV Cannula 20G is below minimum stock level',
        messageAr: 'كانيولا وريدية 20G أقل من الحد الأدنى',
        priority: 'normal',
        read: true,
        actionUrl: '/inventory',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        recipientId: 'user-1',
      },
    ]

    dispatch({ type: 'SET_NOTIFICATIONS', payload: initialNotifications })

    // Simulate initial activities
    const initialActivities: Activity[] = [
      {
        id: '1',
        type: 'report_submitted',
        userId: 'user-2',
        userName: 'سارة أحمد',
        action: 'submitted shift report',
        actionAr: 'أرسلت تقرير المناوبة',
        target: 'Morning Shift Report',
        department: 'ICU',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '2',
        type: 'patient_admitted',
        userId: 'user-3',
        userName: 'محمد علي',
        action: 'admitted new patient',
        actionAr: 'قبول مريض جديد',
        target: 'فاطمة محمود',
        department: 'Emergency',
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: '3',
        type: 'handover_completed',
        userId: 'user-4',
        userName: 'نورا حسين',
        action: 'completed handover',
        actionAr: 'أكملت تسليم المناوبة',
        department: 'Medical Ward',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
    ]

    dispatch({ type: 'SET_ACTIVITIES', payload: initialActivities })

    // Simulate online users
    const initialOnlineUsers: UserPresence[] = [
      {
        id: 'user-1',
        name: 'أحمد محمد',
        department: 'ICU',
        role: 'supervisor',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        currentPage: '/dashboard',
      },
      {
        id: 'user-2',
        name: 'سارة أحمد',
        department: 'Emergency',
        role: 'head_nurse',
        isOnline: true,
        lastSeen: new Date().toISOString(),
        currentPage: '/reports',
      },
      {
        id: 'user-3',
        name: 'محمد علي',
        department: 'Medical Ward',
        role: 'staff',
        isOnline: true,
        lastSeen: new Date().toISOString(),
      },
      {
        id: 'user-4',
        name: 'نورا حسين',
        department: 'Surgical',
        role: 'staff',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1800000).toISOString(),
      },
    ]

    dispatch({ type: 'SET_ONLINE_USERS', payload: initialOnlineUsers })

    return () => {
      clearTimeout(connectTimeout)
    }
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (state.soundEnabled && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {
          // Ignore autoplay errors
        })
      } catch {
        // Ignore audio errors
      }
    }
  }, [state.soundEnabled])

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      }

      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification })

      // Show toast notification
      const toastOptions = {
        description: notification.messageAr,
        action: notification.actionUrl
          ? {
              label: notification.actionLabelAr || 'عرض',
              onClick: () => {
                window.location.href = notification.actionUrl!
              },
            }
          : undefined,
      }

      switch (notification.priority) {
        case 'urgent':
          toast.error(notification.titleAr, toastOptions)
          playNotificationSound()
          break
        case 'high':
          toast.warning(notification.titleAr, toastOptions)
          playNotificationSound()
          break
        default:
          toast.info(notification.titleAr, toastOptions)
      }

      // In production, save to Firebase
      // await set(ref(realtimeDb, `notifications/${newNotification.id}`), newNotification)
    },
    [playNotificationSound]
  )

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id })
    // In production, update Firebase
    // await update(ref(realtimeDb, `notifications/${id}`), { read: true })
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' })
    // In production, batch update Firebase
  }, [])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    // In production, delete from Firebase
    // await remove(ref(realtimeDb, `notifications/${id}`))
  }, [])

  // Add activity
  const addActivity = useCallback(
    (activity: Omit<Activity, 'id' | 'timestamp'>) => {
      const newActivity: Activity = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_ACTIVITY', payload: newActivity })
      // In production, save to Firebase
    },
    []
  )

  // Toggle sound
  const toggleSound = useCallback(() => {
    dispatch({ type: 'TOGGLE_SOUND' })
  }, [])

  // Send emergency alert
  const sendEmergencyAlert = useCallback(
    (type: string, location: string, department: string) => {
      addNotification({
        type: 'emergency_code',
        title: `Emergency Code ${type.toUpperCase()}`,
        titleAr: `كود طوارئ ${type === 'blue' ? 'أزرق' : type === 'red' ? 'أحمر' : type}`,
        message: `Emergency at ${location} - ${department}`,
        messageAr: `طوارئ في ${location} - ${department}`,
        priority: 'urgent',
        read: false,
        actionUrl: '/emergency',
        actionLabel: 'Respond',
        actionLabelAr: 'استجابة',
        recipientId: 'all',
        data: { type, location, department },
      })

      addActivity({
        type: 'emergency_code',
        userId: 'current-user',
        userName: 'المستخدم الحالي',
        action: `activated Code ${type.toUpperCase()}`,
        actionAr: `فعّل كود ${type === 'blue' ? 'أزرق' : type === 'red' ? 'أحمر' : type}`,
        target: location,
        department,
      })
    },
    [addNotification, addActivity]
  )

  // Send task notification
  const sendTaskNotification = useCallback(
    (taskId: string, assigneeId: string, title: string) => {
      addNotification({
        type: 'task_assigned',
        title: 'New Task Assigned',
        titleAr: 'مهمة جديدة',
        message: `You have been assigned: ${title}`,
        messageAr: `تم تعيين مهمة لك: ${title}`,
        priority: 'high',
        read: false,
        actionUrl: '/tasks',
        recipientId: assigneeId,
        data: { taskId },
      })
    },
    [addNotification]
  )

  // Send handover request
  const sendHandoverRequest = useCallback(
    (fromNurse: string, toNurseId: string, patientName: string) => {
      addNotification({
        type: 'handover_request',
        title: 'Handover Request',
        titleAr: 'طلب تسليم مناوبة',
        message: `${fromNurse} requested handover for ${patientName}`,
        messageAr: `${fromNurse} طلب تسليم ${patientName}`,
        priority: 'high',
        read: false,
        actionUrl: '/handover',
        recipientId: toNurseId,
        senderName: fromNurse,
      })
    },
    [addNotification]
  )

  const value: NotificationContextType = {
    ...state,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    addActivity,
    toggleSound,
    sendEmergencyAlert,
    sendTaskNotification,
    sendHandoverRequest,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    )
  }
  return context
}
