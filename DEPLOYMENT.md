# Deployment Guide - Monroe Maps

This guide will walk you through deploying your Monroe Maps application to Vercel and setting up the WordPress integration.

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Monroe Maps application"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set Up Supabase

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "monroe-maps")
   - Set a database password
   - Choose a region close to your users
   - Click "Create new project"

2. **Get Project Credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon/public key
   - Go to Settings → API → Project API keys
   - Copy your service_role key (keep this secret!)

3. **Set Up Database**:
   - Go to SQL Editor
   - Run the SQL from the README.md file to create the `form_submissions` table

## Step 3: Set Up Google Maps API

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable billing (required for Maps API)

2. **Enable APIs**:
   - Go to APIs & Services → Library
   - Search for and enable:
     - Maps JavaScript API
     - Geocoding API

3. **Create API Key**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key
   - Click "Restrict Key" and limit to:
     - Maps JavaScript API
     - Geocoding API
     - Your domain (for production)

## Step 4: Deploy to Vercel

1. **Connect GitHub to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add each variable from your `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     WEBHOOK_SECRET=your_webhook_secret
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Note your deployment URL (e.g., `https://monroe-maps.vercel.app`)

## Step 5: WordPress Integration

### Option A: Fluent Forms Webhook (Recommended)

1. **In WordPress Admin**:
   - Go to Fluent Forms → Integrations
   - Click "Add New Integration"
   - Select "Webhook"

2. **Configure Webhook**:
   ```
   Integration Name: Monroe Maps
   Webhook URL: https://your-vercel-domain.vercel.app/api/webhook
   Method: POST
   Headers:
     Content-Type: application/json
     Authorization: Bearer your_webhook_secret
   ```

3. **Map Form Fields**:
   ```json
   {
     "name": "{inputs.name}",
     "email": "{inputs.email}",
     "phone": "{inputs.phone}",
     "address": "{inputs.address}",
     "city": "{inputs.city}",
     "state": "{inputs.state}",
     "zip_code": "{inputs.zip_code}",
     "notes": "{inputs.notes}"
   }
   ```

4. **Test Integration**:
   - Submit a test form
   - Check Vercel logs for webhook receipt
   - Verify data appears in Supabase
   - Check your map application

### Option B: Custom PHP Hook

1. **Add to functions.php**:
   ```php
   add_action('fluentform_submission_completed', 'send_to_monroe_maps', 10, 3);
   
   function send_to_monroe_maps($entry_id, $form_data, $form) {
       $webhook_url = 'https://your-vercel-domain.vercel.app/api/webhook';
       $webhook_secret = 'your_webhook_secret';
       
       $payload = array(
           'name' => $form_data['name'],
           'email' => $form_data['email'],
           'phone' => $form_data['phone'] ?? '',
           'address' => $form_data['address'],
           'city' => $form_data['city'] ?? '',
           'state' => $form_data['state'] ?? '',
           'zip_code' => $form_data['zip_code'] ?? '',
           'notes' => $form_data['notes'] ?? ''
       );
       
       wp_remote_post($webhook_url, array(
           'headers' => array(
               'Content-Type' => 'application/json',
               'Authorization' => 'Bearer ' . $webhook_secret
           ),
           'body' => json_encode($payload),
           'timeout' => 30
       ));
   }
   ```

## Step 6: Testing

1. **Test Webhook**:
   - Submit a form on your WordPress site
   - Check Vercel function logs
   - Verify data in Supabase dashboard
   - Check your map application

2. **Test Real-time Updates**:
   - Open your map application in multiple browser tabs
   - Submit a new form
   - Verify it appears automatically in all tabs

3. **Test Search & Filtering**:
   - Use the search functionality
   - Test status filtering
   - Verify map markers update accordingly

## Step 7: Production Considerations

1. **Custom Domain** (Optional):
   - In Vercel, go to Settings → Domains
   - Add your custom domain
   - Update WordPress webhook URL accordingly

2. **SSL Certificate**:
   - Vercel provides automatic SSL
   - Ensure your WordPress site also uses HTTPS

3. **Monitoring**:
   - Set up Vercel analytics
   - Monitor Supabase usage
   - Set up Google Maps API quotas

## Troubleshooting

### Common Issues

1. **Webhook Not Working**:
   - Check Vercel function logs
   - Verify webhook URL is correct
   - Check authentication headers
   - Ensure WordPress can make external requests

2. **Map Not Loading**:
   - Verify Google Maps API key
   - Check browser console for errors
   - Ensure billing is enabled on Google Cloud
   - Check API quotas

3. **Database Connection Issues**:
   - Verify Supabase credentials
   - Check Row Level Security policies
   - Ensure table structure is correct

4. **Geocoding Failures**:
   - Check Google Geocoding API is enabled
   - Verify API key restrictions
   - Check address format

### Debug Steps

1. **Check Vercel Logs**:
   - Go to your project in Vercel
   - Click on Functions tab
   - Check webhook function logs

2. **Check Supabase Logs**:
   - Go to Supabase dashboard
   - Check Database → Logs
   - Look for any errors

3. **Browser Developer Tools**:
   - Open browser console
   - Check for JavaScript errors
   - Monitor network requests

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Maps API Documentation](https://developers.google.com/maps)
- [Next.js Documentation](https://nextjs.org/docs)

## Next Steps

After successful deployment:

1. **Customize the UI** to match your brand
2. **Add more form fields** as needed
3. **Implement user authentication** if required
4. **Add data export functionality**
5. **Set up automated backups**
6. **Monitor performance and usage**

---

**Need Help?** Check the troubleshooting section above or refer to the main README.md file for detailed setup instructions.

