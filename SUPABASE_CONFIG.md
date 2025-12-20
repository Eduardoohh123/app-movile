# Supabase Configuration for Ionic App
# Add these to your environment files

export const environment = {
  production: false,
  supabase: {
    url: 'https://htdvrcajzddfjzpbfjhb.supabase.co',
    key: 'sb_publishable_cVnJBQyNeNyuIJIqJx6fsA_330rGqLn'
  },
  api: {
    // Spring Boot API URL (local o deployment)
    baseUrl: 'http://localhost:8080/api'
  }
};
