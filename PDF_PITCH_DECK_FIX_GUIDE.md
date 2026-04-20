# PDF Pitch Deck Fix - Complete Setup Guide

## Problem & Solution

**Issue**: "Site can't be reached" error when clicking PDF pitch deck links from the Explore page.

**Root Cause**: 
1. Old PDFs were stored with mock URLs (`https://nexus-uploads-dev.local/...`) that don't actually work
2. UploadThing integration wasn't properly configured
3. URLs weren't validated before rendering links

**Solution Implemented**:
- ✅ Proper UploadThing SDK integration
- ✅ URL validation and conversion logic
- ✅ Better error handling and UI feedback
- ✅ Detailed console logging for debugging

---

## What Changed

### 1. **Startup Details Page** (`app/explore/startups/[id]/page.tsx`)
- Added `isValidUrl()` helper function
- Added `ensureAbsoluteUrl()` with smart conversion:
  - Detects old mock URLs and marks them as invalid
  - Converts file keys to UploadThing CDN format
  - Validates real URLs
- Shows helpful message for legacy/invalid PDFs
- Logs PDF URLs to browser console for debugging

### 2. **Update Document API** (`app/api/startup/update-doc/route.ts`)
- Normalizes URLs before saving to database
- Converts relative paths to `https://utfs.io/f/...` format
- Logs all URL transformations

### 3. **UploadThing Configuration** (`app/api/uploadthing/core.ts`)
- Replaced mock implementation with real UploadThing SDK
- Proper file router for PDFs (max 4MB)
- Authentication middleware
- Returns full URLs from UploadThing

### 4. **UploadThing Route Handler** (`app/api/uploadthing/route.ts`)
- Uses `createRouteHandler` from UploadThing SDK
- Proper routing and error handling

---

## Testing the Fix

### Step 1: Verify Environment
Check your `.env` file has UploadThing configured:
```env
UPLOADTHING_TOKEN="sk_live_YOUR_TOKEN_HERE"
NEXT_PUBLIC_UPLOADTHING_APP_ID="lauxfmidp6"
```

⚠️ **Important**: The `UPLOADTHING_TOKEN` must be valid. Get it from:
- https://uploadthing.com/dashboard
- Log in with your account
- Copy the secret key under "API Keys"

### Step 2: Test with New Upload
1. Log in as an entrepreneur
2. Go to Onboarding → Upload Pitch Deck
3. Upload a new PDF file
4. The file should be saved to UploadThing (not local mock storage)

### Step 3: View PDF from Explore Page
1. Go to Explore → Startups
2. Click on "View Full Details" for your startup
3. Scroll down to "Pitch Deck" section
4. **Option A - New PDF**: Click "Download Pitch Deck" button
   - PDF should open in new tab ✅
5. **Option B - Old PDF**: Message says "No pitch deck available"
   - This is because old mock URLs aren't accessible
   - Solution: Re-upload a new PDF

### Step 4: Debugging with Console
Open browser DevTools (F12):
```
Console tab will show:
[Startup Detail] PDF URL: https://utfs.io/f/abc123...
[Startup Detail] Opening PDF: https://utfs.io/f/abc123...
```

If you see:
- ✅ `https://utfs.io/f/` = Correct format (should work)
- ❌ `https://nexus-uploads-dev.local/` = Old mock URL (won't work)
- ❌ `undefined` = No PDF uploaded yet

---

## Troubleshooting

### "No pitch deck available" message appears
**Causes**:
1. No PDF has been uploaded yet
2. PDF uses old mock URL format
3. URL in database is invalid

**Solution**:
- Re-upload a new PDF through the onboarding page
- The new upload will use UploadThing and work properly

### PDF link opens but shows "Site can't be reached"
**Causes**:
1. UploadThing token is invalid or expired
2. PDF file was deleted from UploadThing storage
3. Network connectivity issue

**Solution**:
1. Check UPLOADTHING_TOKEN in `.env` is valid
2. Try uploading again
3. Check browser console for errors
4. Contact UploadThing support if token is invalid

### "Upload failed" in onboarding
**Causes**:
1. Not authenticated (no valid token)
2. File is not PDF or exceeds 4MB
3. Server is down

**Solution**:
1. Make sure you're logged in
2. Check file is PDF and under 4MB
3. Check dev server is running: `npm run dev`

---

## URL Format Reference

### UploadThing CDN Format (✅ Correct)
```
https://utfs.io/f/{file-key}
Example: https://utfs.io/f/abc123def456789...
```

### Old Mock Format (❌ Won't Work)
```
https://nexus-uploads-dev.local/{timestamp}-{random}.pdf
Example: https://nexus-uploads-dev.local/1776275151788-qe63hst.pdf
```

---

## Database Migration (Optional)

If you want to fix existing PDFs in the database:

1. Upload new PDFs through the onboarding page (automatic)
2. Old PDFs will show "No pitch deck available" message
3. No manual database editing needed - it's better to let users re-upload

**Or**, if you have database access:
- Update `startup` table
- Set `pitchDeckUrl = NULL` and `pitchDeckName = NULL` for old mock URLs
- Users will be prompted to re-upload

---

## Files Modified

1. `app/explore/startups/[id]/page.tsx` - UI and URL validation
2. `app/api/startup/update-doc/route.ts` - URL normalization on save
3. `app/api/uploadthing/core.ts` - Real UploadThing configuration
4. `app/api/uploadthing/route.ts` - UploadThing route handler

---

## Next Steps

1. ✅ Verify UploadThing token in `.env`
2. ✅ Restart dev server: `npm run dev`
3. ✅ Upload a new pitch deck
4. ✅ Test viewing it from explore page
5. ✅ Check browser console for PDF URL logs
