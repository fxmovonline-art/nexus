# UploadThing Debugging & Configuration Guide

## ✅ Changes Made

### 1. **Enhanced Form Component** (`app/onboarding/startup-details/page.tsx`)
- ✅ Added explicit `isUploaded` boolean state - tracks successful upload completion
- ✅ Added comprehensive logging with prefixes: `[StartupForm]`, `[UploadDropzone]`, `[Replace Button]`
- ✅ Added alerts on success and error for immediate user feedback
- ✅ Added `onUploadBegin` callback to show uploading state
- ✅ Updated button logic to check `isUploaded` instead of just `pitchDeckUrl`
- ✅ All callbacks now include detailed console logging

### 2. **API Route Verification** (`app/api/uploadthing/route.ts`)
```typescript
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
```
✅ Properly exports GET and POST handlers
✅ No configuration needed for token (handled server-side)

### 3. **Environment Configuration** (`.env`)
Added UploadThing configuration placeholders:
```
UPLOADTHING_TOKEN="sk_live_YOUR_TOKEN_HERE"
NEXT_PUBLIC_UPLOADTHING_APP_ID="lauxfmidp6"
JWT_SECRET="your-jwt-secret-key"
```

---

## 🔍 How to Debug Upload Issues

### Step 1: Open Browser DevTools (F12)
Click the **Console** tab and watch for these log messages when uploading:

**Expected Log Sequence:**
```
1. [StartupForm] Component mounted. Token exists: true
2. [UploadDropzone] Upload began
3. [UploadDropzone] Upload Progress: 25%
4. [UploadDropzone] Upload Progress: 50%
5. [UploadDropzone] Upload Progress: 100%
6. [UploadDropzone] Upload Complete. Full Response: [...]
7. [UploadDropzone] File object: { url: "...", name: "..." }
8. [UploadDropzone] State updated. URL: "..." Name: "..."
```

If you don't see these logs, the callbacks are not firing.

### Step 2: Check Network Tab
1. Open **Network** tab in DevTools
2. Select the **XHR/Fetch** filter
3. Try uploading a file
4. Look for requests to `/api/uploadthing`

**Expected requests:**
- `POST /api/uploadthing` (the file upload)
- Should return status `200` with file URL

**If you see 401 Unauthorized:**
- JWT token is missing or invalid
- Check localStorage has `'token'` key

**If you see 413 Payload Too Large:**
- File exceeds 4MB limit

### Step 3: Check Authentication
Open DevTools Console and run:
```javascript
localStorage.getItem('token')
```

**Expected:** Returns a JWT token string  
**If empty/null:** Login is not working - user needs to sign in first

### Step 4: Verify UploadThing Connection
Add this to verify the endpoint exists:
```javascript
fetch('/api/uploadthing').then(r => r.text()).then(console.log)
```

**Expected:** No error (404 or anything is a problem)

---

## 🔧 Required Configuration

### CRITICAL: UPLOADTHING_TOKEN

This is the most likely issue. You need to:

1. Go to https://uploadthing.com/dashboard
2. Copy your **API Token** (starts with `sk_live_` or `sk_test_`)
3. Update `.env` file:
   ```
   UPLOADTHING_TOKEN="sk_live_PASTE_YOUR_TOKEN_HERE"
   ```
4. **Restart the dev server** (`npm run dev`)

The token looks like:
```
sk_live_8167abc1234567890xyz...
```

### Once Token is Set: Full Configuration

```env
# .env file (required for UploadThing backend)
UPLOADTHING_TOKEN="sk_live_XXXXXXXXXXXXXX"

# Optional: For future scalability
NEXT_PUBLIC_UPLOADTHING_APP_ID="lauxfmidp6"
NEXT_PUBLIC_UPLOADTHING_ENV="production"

# JWT Secret for auth
JWT_SECRET="your-jwt-secret-key"
```

---

## 📋 Testing Checklist

### Local Testing Flow:
1. ✅ Login/Register → token stored in localStorage
2. ✅ Navigate to `/onboarding/startup-details`
3. ✅ Fill in form fields
4. ✅ Click on drop zone OR select file
5. ✅ Watch console for log messages
6. ✅ See `✅ File uploaded successfully!` alert
7. ✅ File card shows with PDF icon and name
8. ✅ "Register Startup" button becomes **blue and clickable**
9. ✅ Submit form

### Expected Console Output:
```
[StartupForm] Component mounted. Token exists: true
[UploadDropzone] Upload began
[UploadDropzone] Upload Progress: 0%
[UploadDropzone] Upload Progress: 100%
[UploadDropzone] Upload Complete. Full Response: [{...}]
[UploadDropzone] File object: {url: "https://...", name: "test.pdf"}
[UploadDropzone] URL: "https://..."
[UploadDropzone] Name: "test.pdf"
[UploadDropzone] State updated. URL: "https://..." Name: "test.pdf"
```

### Expected Alerts:
- ✅ Success: `✅ File uploaded successfully!\n\nFilename: test.pdf`
- ❌ Error: `❌ Upload failed:\n\nError message here`

---

## 🚨 Common Issues & Fixes

### Issue 1: "Upload failed: Unauthorized"
**Problem:** JWT token is missing or invalid  
**Fix:** 
- Login again
- Check `localStorage.getItem('token')` in console
- Ensure same tab (localStorage is per-origin)

### Issue 2: "413 Payload Too Large"
**Problem:** File exceeds 4MB limit  
**Fix:**
- Use smaller PDF (< 4MB)
- Check file size before upload

### Issue 3: No Console Logs Appearing
**Problem:** Callbacks not firing at all  
**Fix:**
1. Check browser console for JavaScript errors
2. Check Network tab for `/api/uploadthing` requests
3. Verify UPLOADTHING_TOKEN is set in .env
4. Restart dev server with `npm run dev`
5. Hard refresh page (Ctrl+Shift+R)

### Issue 4: "File uploaded but button still disabled"
**Problem:** `isUploaded` state not updating  
**Fix:**
- Check console for the "State updated" log
- If no log, there's an issue with the callback
- Check browser DevTools → Application → Errors

### Issue 5: Button Grayed Out After "Replace"
**Problem:** Works as designed - user must upload again  
**Fix:** This is correct behavior - click "Replace" to re-upload

---

## 📊 State Management Flow

```
Flow: User selects file → Upload → Callback fires

1. User clicks dropzone
   ↓
2. onUploadBegin() fires
   - setIsUploading(true) 🔴
   - setUploadProgress(0)
   ↓
3. File uploads
   - onUploadProgress() updates percentage
   ↓
4. Upload completes
   - onUploadComplete() fires ✅ KEY CALLBACK
   - setPitchDeckUrl(url)
   - setPitchDeckName(name)
   - setIsUploaded(true) 🟢 BUTTON ENABLED
   - Alert shows
   ↓
5. UI Updates
   - Success card displays
   - "Register Startup" button becomes blue
   - Ready to submit form
```

---

## 🔬 Manual Testing Commands

### Test 1: Check API Route
```bash
curl http://localhost:3000/api/uploadthing
```
Should return something (not 404)

### Test 2: Build Without Running
```bash
npm run build
```
Should succeed with "✓ Compiled successfully"

### Test 3: Start Dev Server & Watch Console
```bash
npm run dev
```
Navigate to form and watch browser console

---

## 📄 File Checklist

- ✅ `app/onboarding/startup-details/page.tsx` - Enhanced with logging
- ✅ `app/api/uploadthing/core.ts` - File router configured
- ✅ `app/api/uploadthing/route.ts` - Routes exported
- ✅ `.env` - UploadThing token placeholder added
- ✅ `app/api/startup/route.ts` - Accepts pitchDeckUrl/Name

---

## 🎯 Quick Fix Checklist

- [ ] Set UPLOADTHING_TOKEN in `.env` (GET FROM https://uploadthing.com/dashboard)
- [ ] Restart dev server (`npm run dev`)
- [ ] Hard refresh browser (Ctrl+Shift+F5)
- [ ] Login/Register to get fresh JWT token
- [ ] Open DevTools (F12)
- [ ] Try uploading a PDF
- [ ] Check console.log output matches expected sequence
- [ ] Verify file card appears with PDF name
- [ ] Check "Register Startup" button is blue and clickable
- [ ] Submit form to test full flow

---

## ✨ Success Indicators

When everything works correctly:
1. ✅ No errors in browser console
2. ✅ Console logs show the expected sequence
3. ✅ Alert pops up with filename
4. ✅ Success card displays with checkmark
5. ✅ "Register Startup" button is blue and enabled
6. ✅ Form submission includes file URL
7. ✅ Database saves pitchDeckUrl and pitchDeckName

If all these are true, the upload system is working! 🎉
