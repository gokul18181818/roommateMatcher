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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
        <p className="text-muted-foreground">Find your perfect roommate match</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="p-4 bg-white rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Input
                placeholder="San Francisco"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Input
                placeholder="Technology"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <Input
                placeholder="Google"
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilters({ city: '', industry: '', company: '' })}
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredProfiles && filteredProfiles.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredProfiles.map((profile) => (
            <UserCard key={profile.id} profile={profile} currentUserId={user?.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No profiles found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  )
}

