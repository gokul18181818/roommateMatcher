/**
 * Script to populate Supabase with mock profiles for testing
 * 
 * Usage:
 * 1. Copy this script and run it in your browser console while logged into the app
 * 2. Or use Supabase SQL Editor to run the SQL version
 * 
 * Note: This creates profiles with fake UUIDs. In production, profiles are linked to auth.users
 */

import { supabase } from '../src/lib/supabase'

const mockProfiles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    linkedin_id: 'sarah-chen-123',
    linkedin_profile_url: 'https://www.linkedin.com/in/sarah-chen-123/',
    full_name: 'Sarah Chen',
    date_of_birth: '1998-05-15',
    profile_photo_url: 'https://i.pravatar.cc/300?img=1',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'Product Designer',
    company: 'Meta',
    industry: 'Technology',
    bio: 'Passionate product designer with 5 years of experience creating user-centered designs. Love hiking, cooking, and exploring new coffee shops. Looking for a roommate who values cleanliness and quiet evenings. I work hybrid and enjoy hosting small dinner parties on weekends.',
    budget_min: 1800,
    budget_max: 2500,
    move_in_date: '2024-03-01',
    move_in_flexible: true,
    work_schedule: 'hybrid',
    is_active: true,
    is_verified: true,
    profile_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    linkedin_id: 'michael-rodriguez-456',
    linkedin_profile_url: 'https://www.linkedin.com/in/michael-rodriguez-456/',
    full_name: 'Michael Rodriguez',
    date_of_birth: '1997-08-22',
    profile_photo_url: 'https://i.pravatar.cc/300?img=12',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'Data Scientist',
    company: 'Netflix',
    industry: 'Technology',
    bio: 'Data scientist passionate about machine learning and analytics. I enjoy playing guitar, going to concerts, and trying new restaurants. Prefer a clean living space and someone who respects quiet hours. I work remotely most days and love having roommates who are social but also value personal space.',
    budget_min: 2000,
    budget_max: 2800,
    move_in_date: '2024-02-15',
    move_in_flexible: false,
    work_schedule: 'remote',
    is_active: true,
    is_verified: true,
    profile_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    linkedin_id: 'emily-park-789',
    linkedin_profile_url: 'https://www.linkedin.com/in/emily-park-789/',
    full_name: 'Emily Park',
    date_of_birth: '1999-11-03',
    profile_photo_url: 'https://i.pravatar.cc/300?img=5',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'Software Engineer',
    company: 'Apple',
    industry: 'Technology',
    bio: 'Full-stack engineer building amazing products. Love yoga, reading, and exploring the city. Looking for a roommate who is tidy, respectful, and enjoys occasional movie nights. I work in-office 3 days a week and appreciate a quiet home environment for focused work.',
    budget_min: 1900,
    budget_max: 2600,
    move_in_date: '2024-03-15',
    move_in_flexible: true,
    work_schedule: 'hybrid',
    is_active: true,
    is_verified: false,
    profile_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    linkedin_id: 'david-kim-321',
    linkedin_profile_url: 'https://www.linkedin.com/in/david-kim-321/',
    full_name: 'David Kim',
    date_of_birth: '1996-02-18',
    profile_photo_url: 'https://i.pravatar.cc/300?img=15',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'Product Manager',
    company: 'Google',
    industry: 'Technology',
    bio: 'Product manager with a passion for building products that matter. Enjoy rock climbing, cooking, and board games. Looking for a roommate who is clean, communicative, and enjoys social activities. I work hybrid and love hosting game nights with friends.',
    budget_min: 2100,
    budget_max: 2900,
    move_in_date: '2024-02-01',
    move_in_flexible: false,
    work_schedule: 'hybrid',
    is_active: true,
    is_verified: true,
    profile_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    linkedin_id: 'jessica-martinez-654',
    linkedin_profile_url: 'https://www.linkedin.com/in/jessica-martinez-654/',
    full_name: 'Jessica Martinez',
    date_of_birth: '1998-07-25',
    profile_photo_url: 'https://i.pravatar.cc/300?img=9',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'UX Researcher',
    company: 'Airbnb',
    industry: 'Technology',
    bio: 'UX researcher focused on understanding user behavior. Love photography, traveling, and trying new cuisines. Prefer a clean and organized living space. I work remotely and enjoy having roommates who are friendly but respect boundaries. Looking for someone who values communication and shared responsibilities.',
    budget_min: 1850,
    budget_max: 2550,
    move_in_date: '2024-03-01',
    move_in_flexible: true,
    work_schedule: 'remote',
    is_active: true,
    is_verified: true,
    profile_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    linkedin_id: 'alex-thompson-987',
    linkedin_profile_url: 'https://www.linkedin.com/in/alex-thompson-987/',
    full_name: 'Alex Thompson',
    date_of_birth: '1997-12-10',
    profile_photo_url: 'https://i.pravatar.cc/300?img=20',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'Backend Engineer',
    company: 'Stripe',
    industry: 'Technology',
    bio: 'Backend engineer building scalable systems. Enjoy running, reading sci-fi, and playing video games. Looking for a roommate who is clean, quiet during work hours, and enjoys occasional conversations. I work fully remote and appreciate a peaceful home environment.',
    budget_min: 2000,
    budget_max: 2700,
    move_in_date: '2024-02-20',
    move_in_flexible: true,
    work_schedule: 'remote',
    is_active: true,
    is_verified: false,
    profile_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    linkedin_id: 'maya-patel-147',
    linkedin_profile_url: 'https://www.linkedin.com/in/maya-patel-147/',
    full_name: 'Maya Patel',
    date_of_birth: '1999-04-08',
    profile_photo_url: 'https://i.pravatar.cc/300?img=25',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'Frontend Engineer',
    company: 'Figma',
    industry: 'Technology',
    bio: 'Frontend engineer passionate about creating beautiful user interfaces. Love painting, hiking, and trying new restaurants. Looking for a roommate who is tidy, respectful, and enjoys social activities. I work hybrid and love having roommates who are friendly and communicative.',
    budget_min: 1950,
    budget_max: 2650,
    move_in_date: '2024-03-10',
    move_in_flexible: true,
    work_schedule: 'hybrid',
    is_active: true,
    is_verified: true,
    profile_completed: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    linkedin_id: 'ryan-wilson-258',
    linkedin_profile_url: 'https://www.linkedin.com/in/ryan-wilson-258/',
    full_name: 'Ryan Wilson',
    date_of_birth: '1996-09-14',
    profile_photo_url: 'https://i.pravatar.cc/300?img=30',
    city: 'San Francisco',
    state: 'CA',
    job_title: 'DevOps Engineer',
    company: 'Amazon',
    industry: 'Technology',
    bio: 'DevOps engineer focused on infrastructure and automation. Enjoy cycling, cooking, and watching sports. Prefer a clean living space and someone who respects quiet hours. I work in-office most days and appreciate roommates who are social but also value personal space.',
    budget_min: 2050,
    budget_max: 2750,
    move_in_date: '2024-02-25',
    move_in_flexible: false,
    work_schedule: 'in-office',
    is_active: true,
    is_verified: true,
    profile_completed: true,
  },
]

export async function populateMockProfiles() {
  console.log('🚀 Starting to populate mock profiles...')
  
  // First, check if profiles already exist
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('id')
    .in('id', mockProfiles.map(p => p.id))
  
  if (existingProfiles && existingProfiles.length > 0) {
    console.log(`⚠️ Found ${existingProfiles.length} existing profiles. Skipping duplicates.`)
  }
  
  const profilesToInsert = mockProfiles.filter(
    profile => !existingProfiles?.some(existing => existing.id === profile.id)
  )
  
  if (profilesToInsert.length === 0) {
    console.log('✅ All mock profiles already exist!')
    return
  }
  
  console.log(`📝 Inserting ${profilesToInsert.length} new profiles...`)
  
  const { data, error } = await supabase
    .from('profiles')
    .insert(profilesToInsert)
    .select()
  
  if (error) {
    console.error('❌ Error populating profiles:', error)
    throw error
  }
  
  console.log(`✅ Successfully inserted ${data?.length || 0} profiles!`)
  return data
}

// For browser console usage
if (typeof window !== 'undefined') {
  (window as any).populateMockProfiles = populateMockProfiles
}

