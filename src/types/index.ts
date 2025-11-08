export interface Profile {
  id: string
  created_at: string
  updated_at: string
  linkedin_id: string
  linkedin_profile_url: string | null
  full_name: string
  date_of_birth: string
  age: number
  profile_photo_url: string | null
  city: string
  state: string
  country: string
  latitude: number | null
  longitude: number | null
  job_title: string
  company: string
  industry: string | null
  employment_type: 'intern' | 'new_grad' | null
  work_schedule: 'remote' | 'hybrid' | 'in-office' | null
  bio: string
  budget_min: number | null
  budget_max: number | null
  move_in_date: string | null
  move_in_flexible: boolean
  interests: string[] | null
  cleanliness_level: number | null
  noise_tolerance: number | null
  has_pets: boolean
  pet_friendly: boolean
  smoking_friendly: boolean
  is_active: boolean
  is_verified: boolean
  profile_completed: boolean
  last_active: string
}

export interface ProfilePhoto {
  id: string
  profile_id: string
  photo_url: string
  photo_order: number
  is_primary: boolean
  uploaded_at: string
}

export interface Conversation {
  id: string
  created_at: string
  updated_at: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string
  last_message_preview: string | null
}

export interface Message {
  id: string
  conversation_id: string
  created_at: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  read_at: string | null
  is_deleted: boolean
}

export interface Bookmark {
  id: string
  user_id: string
  bookmarked_profile_id: string
  created_at: string
}

export interface Block {
  id: string
  blocker_id: string
  blocked_id: string
  created_at: string
  reason: string | null
}

