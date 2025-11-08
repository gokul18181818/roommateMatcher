import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import UserCard from '@/components/explore/UserCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, Grid, List } from 'lucide-react'

export default function ExplorePage() {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    city: '',
    industry: '',
    company: '',
  })

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles', searchQuery, filters],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .neq('id', user?.id || '')

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,job_title.ilike.%${searchQuery}%`)
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry)
      }

      if (filters.company) {
        query = query.ilike('company', `%${filters.company}%`)
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      return data as Profile[]
    },
    enabled: !!user,
  })

  const filteredProfiles = profiles || []

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-3 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Explore
          </h1>
          <p className="text-gray-600 text-xl font-medium">Find your perfect roommate match</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
            <Input
              placeholder="Search by name, company, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 text-base border-0 bg-white shadow-lg focus:shadow-xl focus:ring-2 focus:ring-indigo-500/20 rounded-2xl"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto h-14 px-6 border-0 bg-white shadow-lg hover:shadow-xl hover:bg-indigo-50 rounded-2xl font-semibold text-gray-700"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </Button>
          <div className="flex gap-3">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={`h-14 w-14 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white' 
                  : 'bg-white text-gray-600 hover:bg-indigo-50'
              }`}
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={`h-14 w-14 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white' 
                  : 'bg-white text-gray-600 hover:bg-indigo-50'
              }`}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="p-8 bg-white rounded-2xl border-0 shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">City</label>
                <Input
                  placeholder="San Francisco"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="border-0 bg-gray-50 rounded-xl h-12 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Industry</label>
                <Input
                  placeholder="Technology"
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  className="border-0 bg-gray-50 rounded-xl h-12 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Company</label>
                <Input
                  placeholder="Google"
                  value={filters.company}
                  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  className="border-0 bg-gray-50 rounded-xl h-12 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setFilters({ city: '', industry: '', company: '' })}
              className="text-gray-600 border-0 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold px-6"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[500px] bg-gradient-to-br from-white to-indigo-50/50 animate-pulse rounded-2xl shadow-lg" />
            ))}
          </div>
        ) : filteredProfiles && filteredProfiles.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredProfiles.map((profile) => (
              <UserCard key={profile.id} profile={profile} currentUserId={user?.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white rounded-2xl shadow-xl">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto flex items-center justify-center">
                <Search className="h-10 w-10 text-indigo-400" />
              </div>
              <p className="text-gray-700 text-xl font-bold">No profiles found</p>
              <p className="text-gray-500 text-base">Try adjusting your search or filters to find more matches.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

