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
    state: '',
    job_title: '',
    company: '',
    industry: '',
    work_schedule: '',
    budget_min: '',
    budget_max: '',
  })

  // Get unique filter values from existing profiles
  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('city, state, job_title, company, industry, work_schedule')
        .eq('is_active', true)

      if (error) throw error

      const profiles = data as Profile[]

      // Extract unique values
      const cities = [...new Set(profiles.map(p => p.city).filter(Boolean))].sort()
      const states = [...new Set(profiles.map(p => p.state).filter(Boolean))].sort()
      const jobTitles = [...new Set(profiles.map(p => p.job_title).filter(Boolean))].sort()
      const companies = [...new Set(profiles.map(p => p.company).filter(Boolean))].sort()
      const industries = [...new Set(profiles.map(p => p.industry).filter(Boolean))].sort()
      const workSchedules = [...new Set(profiles.map(p => p.work_schedule).filter(Boolean))].sort()

      return { cities, states, jobTitles, companies, industries, workSchedules }
    },
    enabled: !!user,
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
        query = query.eq('city', filters.city)
      }

      if (filters.state) {
        query = query.eq('state', filters.state)
      }

      if (filters.job_title) {
        query = query.eq('job_title', filters.job_title)
      }

      if (filters.company) {
        query = query.eq('company', filters.company)
      }

      if (filters.industry) {
        query = query.eq('industry', filters.industry)
      }

      if (filters.work_schedule) {
        query = query.eq('work_schedule', filters.work_schedule)
      }

      if (filters.budget_min) {
        query = query.gte('budget_max', parseInt(filters.budget_min))
      }

      if (filters.budget_max) {
        query = query.lte('budget_min', parseInt(filters.budget_max))
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
          <p className="text-muted-foreground text-xl font-medium">Find your perfect roommate match</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400 dark:text-indigo-500" />
            <Input
              placeholder="Search by name, company, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 text-base border-0 bg-card shadow-lg focus:shadow-xl focus:ring-2 focus:ring-indigo-500/20 rounded-2xl"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto h-14 px-6 border-0 bg-card shadow-lg hover:shadow-xl hover:bg-muted rounded-2xl font-semibold"
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
                  : 'bg-card text-muted-foreground hover:bg-muted'
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
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="p-8 bg-card rounded-2xl border shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* City Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-0 bg-muted px-3 py-2 text-sm focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">All Cities</option>
                  {filterOptions?.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">State</label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-0 bg-muted px-3 py-2 text-sm focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">All States</option>
                  {filterOptions?.states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Job Title Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">Job Title</label>
                <select
                  value={filters.job_title}
                  onChange={(e) => setFilters({ ...filters, job_title: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-0 bg-muted px-3 py-2 text-sm focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">All Job Titles</option>
                  {filterOptions?.jobTitles.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">Company</label>
                <select
                  value={filters.company}
                  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-0 bg-muted px-3 py-2 text-sm focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">All Companies</option>
                  {filterOptions?.companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-0 bg-muted px-3 py-2 text-sm focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">All Industries</option>
                  {filterOptions?.industries.map(industry => (
                    <option key={industry} value={industry || ''}>{industry}</option>
                  ))}
                </select>
              </div>

              {/* Work Schedule Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">Work Schedule</label>
                <select
                  value={filters.work_schedule}
                  onChange={(e) => setFilters({ ...filters, work_schedule: e.target.value })}
                  className="flex h-12 w-full rounded-xl border-0 bg-muted px-3 py-2 text-sm focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                >
                  <option value="">All Schedules</option>
                  {filterOptions?.workSchedules.map(schedule => (
                    <option key={schedule} value={schedule || ''} className="capitalize">{schedule}</option>
                  ))}
                </select>
              </div>

              {/* Budget Min Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">Min Budget</label>
                <Input
                  type="number"
                  placeholder="Min ($)"
                  value={filters.budget_min}
                  onChange={(e) => setFilters({ ...filters, budget_min: e.target.value })}
                  className="border-0 bg-muted rounded-xl h-12 focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>

              {/* Budget Max Filter */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-card-foreground uppercase tracking-wide">Max Budget</label>
                <Input
                  type="number"
                  placeholder="Max ($)"
                  value={filters.budget_max}
                  onChange={(e) => setFilters({ ...filters, budget_max: e.target.value })}
                  className="border-0 bg-muted rounded-xl h-12 focus:bg-card focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setFilters({ city: '', state: '', job_title: '', company: '', industry: '', work_schedule: '', budget_min: '', budget_max: '' })}
              className="border-0 bg-muted hover:bg-muted/80 rounded-xl font-semibold px-6"
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
              <div key={i} className="h-[500px] bg-gradient-to-br from-card to-muted animate-pulse rounded-2xl shadow-lg" />
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
          <div className="text-center py-20 px-4 bg-card rounded-2xl shadow-xl">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 dark:from-indigo-900/30 to-purple-100 dark:to-purple-900/30 rounded-full mx-auto flex items-center justify-center">
                <Search className="h-10 w-10 text-indigo-400 dark:text-indigo-500" />
              </div>
              <p className="text-card-foreground text-xl font-bold">No profiles found</p>
              <p className="text-muted-foreground text-base">Try adjusting your search or filters to find more matches.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

