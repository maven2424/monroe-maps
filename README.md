# Monroe Maps - Form Data Visualization Dashboard

A real-time web application that automatically receives form submissions from WordPress and displays them on an interactive Google Map with advanced search and filtering capabilities.

## Features

- 🗺️ **Interactive Google Maps** - Visualize all form submissions on a map
- 🔄 **Real-time Updates** - Automatic synchronization with Supabase database
- 🔍 **Advanced Search & Filtering** - Search by name, email, address, or phone
- 📊 **Data Management** - Sortable tables with status tracking
- 🌐 **Webhook Integration** - Automatic form submission processing
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Modern Tech Stack** - Built with Next.js, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Google Maps JavaScript API
- **Deployment**: Vercel
- **Real-time**: Supabase Realtime

## Prerequisites

Before you begin, ensure you have:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase](https://supabase.com/) account
- [Google Cloud Platform](https://cloud.google.com/) account with Maps API enabled
- [Vercel](https://vercel.com/) account
- [GitHub](https://github.com/) account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd monroe-maps
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Webhook Security (Optional)
WEBHOOK_SECRET=your_webhook_secret_key
```

### 3. Supabase Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the following SQL to create the required table:

```sql
-- Create the form_submissions table
CREATE TABLE form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at);
CREATE INDEX idx_form_submissions_email ON form_submissions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can restrict this based on your needs)
CREATE POLICY "Allow all operations" ON form_submissions FOR ALL USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_form_submissions_updated_at 
    BEFORE UPDATE ON form_submissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 5. Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## WordPress Integration

### Fluent Forms Webhook Setup

1. In your WordPress admin, go to **Fluent Forms** → **Integrations**
2. Click **Add New Integration**
3. Select **Webhook** as the integration type
4. Configure the webhook:

```
Webhook URL: https://your-domain.com/api/webhook
Method: POST
Headers: 
  Content-Type: application/json
  Authorization: Bearer your_webhook_secret_key
```

5. Map your form fields to the webhook payload:

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

6. Test the integration and save

### Alternative: Custom PHP Hook

If you prefer to use a custom PHP hook, add this to your theme's `functions.php`:

```php
add_action('fluentform_submission_completed', 'send_to_monroe_maps', 10, 3);

function send_to_monroe_maps($entry_id, $form_data, $form) {
    // Only process specific forms if needed
    if ($form->id != YOUR_FORM_ID) {
        return;
    }
    
    $webhook_url = 'https://your-domain.com/api/webhook';
    $webhook_secret = 'your_webhook_secret_key';
    
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

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Vercel

Make sure to add all the environment variables from your `.env.local` file to your Vercel project settings.

## Usage

### Dashboard Features

1. **Map View**: See all form submissions plotted on Google Maps
2. **Search**: Search submissions by name, email, address, or phone
3. **Filtering**: Filter by submission status
4. **Data Table**: View all submissions in a sortable table
5. **Real-time Updates**: New submissions appear automatically

### Status Management

- **Pending**: New submissions awaiting review
- **Approved**: Submissions that have been approved
- **Rejected**: Submissions that have been rejected
- **Completed**: Submissions that have been processed

## Security Considerations

1. **Webhook Authentication**: Use the `WEBHOOK_SECRET` environment variable
2. **API Key Restrictions**: Restrict Google Maps API key to your domain
3. **Row Level Security**: Configure Supabase RLS policies as needed
4. **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Common Issues

1. **Map not loading**: Check Google Maps API key and billing
2. **Webhook not working**: Verify webhook URL and authentication
3. **Database connection errors**: Check Supabase credentials
4. **Geocoding failures**: Verify Google Geocoding API is enabled

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

## Support

For issues and questions:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Google Maps API documentation](https://developers.google.com/maps)
3. Check [Next.js documentation](https://nextjs.org/docs)

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Note**: This application automatically processes form submissions and displays them on a map. Ensure you have proper consent and privacy policies in place for collecting and displaying user data.

# Test automatic deployment
