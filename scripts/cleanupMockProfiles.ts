/**
 * Script to remove mock profiles from Supabase database
 * 
 * Usage:
 * 1. Run this in your browser console while logged into the app
 * 2. Or use Supabase SQL Editor to run the SQL version
 */

import { supabase } from '../src/lib/supabase'

const mockProfileIds = [
  '00000000-0000-0000-0000-000000000001', // Sarah Chen
  '00000000-0000-0000-0000-000000000002', // Michael Rodriguez
  '00000000-0000-0000-0000-000000000003', // Emily Park
  '00000000-0000-0000-0000-000000000004', // David Kim
  '00000000-0000-0000-0000-000000000005', // Jessica Martinez
  '00000000-0000-0000-0000-000000000006', // Alex Thompson
  '00000000-0000-0000-0000-000000000007', // Maya Patel
  '00000000-0000-0000-0000-000000000008', // Ryan Wilson
]

export async function cleanupMockProfiles() {
  console.log('🧹 Starting cleanup of mock profiles...')
  
  // First, check which profiles exist
  const { data: existingProfiles, error: checkError } = await supabase
    .from('profiles')
    .select('id, full_name, linkedin_id')
    .in('id', mockProfileIds)
  
  if (checkError) {
    console.error('❌ Error checking profiles:', checkError)
    throw checkError
  }
  
  if (existingProfiles && existingProfiles.length > 0) {
    console.log(`📋 Found ${existingProfiles.length} mock profiles to delete:`)
    existingProfiles.forEach(p => {
      console.log(`  - ${p.full_name} (${p.id})`)
    })
  } else {
    console.log('✅ No mock profiles found with those IDs')
    return
  }
  
  // Delete the mock profiles
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .in('id', mockProfileIds)
    .select()
  
  if (error) {
    console.error('❌ Error deleting profiles:', error)
    throw error
  }
  
  console.log(`✅ Successfully deleted ${data?.length || 0} mock profiles!`)
  console.log('🔄 Refresh the Explore page to see the changes.')
  
  return data
}

// For browser console usage
if (typeof window !== 'undefined') {
  (window as any).cleanupMockProfiles = cleanupMockProfiles
  console.log('💡 Run cleanupMockProfiles() in the console to remove mock profiles')
}

