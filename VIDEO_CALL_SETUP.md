# Video Call Setup Guide

## Overview
The "Join Video Call" button uses ZEGO Cloud as the video conferencing service. To fix the issue where the page cannot load when clicking "Join Video Call", you need to configure ZEGO credentials.

## Issues Fixed
1. ✅ **Authentication**: Changed from NextAuth to custom JWT authentication (matching your app's auth system)
2. ✅ **Error Handling**: Added user-friendly error messages instead of silent failures
3. ✅ **Loading State**: Added loading indicator while initializing video call
4. ✅ **Configuration Validation**: Checks for environment variables and shows clear error if missing

## Setup Instructions

### Step 1: Create a ZEGO Account
1. Go to [ZEGO Console](https://console.zegocloud.com/)
2. Sign up for a free account
3. Create a new project

### Step 2: Get Your Credentials
1. In the ZEGO Console, navigate to "Project Management"
2. Copy your **App ID** and **Server Secret**
3. Keep these credentials safe (they are sensitive)

### Step 3: Add Environment Variables
Create or update `.env.local` file in the project root:

```
NEXT_PUBLIC_ZEGO_APP_ID=your_app_id_from_zego
NEXT_PUBLIC_ZEGO_SERVER_SECRET=your_server_secret_from_zego
```

**Important**: 
- `NEXT_PUBLIC_ZEGO_APP_ID` needs the `NEXT_PUBLIC_` prefix (it's used in browser code)
- `NEXT_PUBLIC_ZEGO_SERVER_SECRET` should ideally be backend-only, but for testing with the current setup, we're using it in the browser. **In production, move token generation to your backend API**

### Step 4: Restart Development Server
```bash
npm run dev
```

### Step 5: Test the Feature
1. Login as an entrepreneur or investor
2. Go to the dashboard
3. Accept a meeting request
4. Click "📹 Join Video Call"
5. You should now see the video call interface

## Security Notes
- The `generateKitTokenForTest()` function is **for development/testing only**
- **For production**, generate tokens on your backend and pass them to the frontend
- Never commit `.env.local` to version control (it contains secrets)

## Troubleshooting

### "Video call service is not properly configured"
- Make sure `.env.local` file exists in project root
- Verify `NEXT_PUBLIC_ZEGO_APP_ID` and `NEXT_PUBLIC_ZEGO_SERVER_SECRET` are set
- Restart the dev server after adding env variables
- Check browser console for detailed errors

### Page shows blank/white screen
- Check browser console (F12) for JavaScript errors
- Verify ZEGO credentials are correct
- Make sure you're logged in (check localStorage for 'token')

### "User not authenticated" error
- Log out and log back in
- Make sure localStorage has 'user' and 'token' keys

## Files Modified
- `app/meeting/[meetingId]/page.tsx` - Fixed authentication and error handling
- `.env.example` - Added environment variable template

## Next Steps (Production)
When moving to production:
1. Move token generation to a backend endpoint
2. Store `NEXT_PUBLIC_ZEGO_SERVER_SECRET` only on the server
3. Validate meeting participants on the backend
4. Add meeting session logging/recording if needed
5. Implement meeting timeout and cleanup
