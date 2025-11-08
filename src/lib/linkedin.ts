import { supabase } from './supabase'

/**
 * Fetches the LinkedIn profile URL (vanityName) from LinkedIn API
 * using the access token from the OAuth session
 */
export async function fetchLinkedInProfileUrl(): Promise<string | null> {
  try {
    // Get the current session with provider token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.warn('No session available to fetch LinkedIn profile URL')
      return null
    }

    // Supabase stores provider tokens in session.provider_token
    // For LinkedIn OIDC, the token might be in provider_token or provider_refresh_token
    const accessToken = (session as any).provider_token || 
                       (session as any).provider_refresh_token ||
                       null

    if (!accessToken) {
      console.warn('No LinkedIn access token found in session')
      console.log('Session object:', { 
        hasProviderToken: !!(session as any).provider_token,
        hasProviderRefreshToken: !!(session as any).provider_refresh_token,
        sessionKeys: Object.keys(session)
      })
      return null
    }

    // Query LinkedIn API v2 to get the vanityName
    // Using projection to request only the fields we need
    const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,vanityName)', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.warn('LinkedIn API error:', response.status, response.statusText, errorText)
      
      // Try alternative endpoint (userinfo endpoint)
      const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (userinfoResponse.ok) {
        const userinfo = await userinfoResponse.json()
        console.log('LinkedIn userinfo response:', userinfo)
        
        // Check for vanityName in userinfo response
        const vanityName = userinfo.vanityName || userinfo['vanity-name'] || userinfo.sub?.replace(/^urn:li:person:/i, '')
        if (vanityName) {
          return `https://www.linkedin.com/in/${vanityName}/`
        }
      }
      
      return null
    }

    const profile = await response.json()
    console.log('LinkedIn API profile response:', profile)

    // Extract vanityName from the response
    // It might be in different formats depending on the API version
    const vanityName = profile.vanityName || 
                      profile.vanity_name ||
                      profile['vanity-name'] ||
                      null

    if (vanityName) {
      const profileUrl = `https://www.linkedin.com/in/${vanityName}/`
      console.log('Successfully fetched LinkedIn profile URL:', profileUrl)
      return profileUrl
    } else {
      console.warn('LinkedIn API response does not contain vanityName:', profile)
      return null
    }
  } catch (error) {
    console.error('Error fetching LinkedIn profile URL:', error)
    return null
  }
}

