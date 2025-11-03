# 🚀 Quick Start Guide

## Fixed Issues

✅ **Navigation Flow** - Fixed routing to show welcome screen → login → appropriate dashboard
✅ **Button Visibility** - All buttons now use high-contrast colors (#007AFF with white text)
✅ **Mock Flow** - Complete end-to-end flow now works properly
✅ **Clean Navigation** - Removed old conflicting tab routes

## Running the App

### Step 1: Start the Development Server

If you already have a dev server running, kill it first:
```bash
# Kill any existing Expo processes
killall node

# Start fresh
npm start
```

Then choose your platform:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web Browser

### Step 2: First Launch

You'll see the **Welcome Screen** with:
- Clear description of the app
- Two bright blue buttons: "Sign In" and "Create Account"
- Demo credentials displayed at the bottom

## Demo Credentials (COPY THESE)

### Body Shop User
```
Email: shop@example.com
Password: test
```

### Insurance Adjuster User
```
Email: adjuster@example.com
Password: test
```

## Testing the Complete Flow

### 🔧 Body Shop Flow (5 minutes)

1. **Welcome Screen** → Click "Sign In"
2. **Login** with `shop@example.com` / `test`
3. **Dashboard** → Click "New Claim" tab
4. **New Claim** → Click bright blue "Get Started" button
5. **Vehicle Info**:
   - Year: `2020`
   - Make: `Toyota`
   - Model: `Camry`
   - Click "Continue to Photos"
6. **Photo Capture**:
   - Click any photo slot
   - Choose "Choose from Gallery" (faster than camera)
   - Select ANY 4 photos from your device
   - Click "Continue to Analysis"
7. **AI Analysis** (wait 2-4 seconds)
   - Watch the AI detect damage
   - Review detected areas and parts
   - Click "Generate Estimate"
8. **Estimate**:
   - See the total cost breakdown
   - Click "Submit to Insurance"
9. **Submit**:
   - Review auto-approval status
   - Click "Submit to Insurance"
   - Confirm in alert

### 🛡️ Insurance Adjuster Flow (2 minutes)

1. **Sign Out** from body shop account (Settings → Sign Out)
2. **Welcome Screen** → Click "Sign In"
3. **Login** with `adjuster@example.com` / `test`
4. **Pending Tab**:
   - You'll see the claim you just submitted
   - Notice the "Auto-Approve Eligible" badge if under $5K
   - Click the claim
5. **Review Screen**:
   - See fraud risk score
   - View photos
   - Review damage assessment
   - Click bright blue "Approve" button
6. **Approved Tab**:
   - Claim now appears in approved list
7. **Analytics Tab**:
   - See revenue metrics ($2 per claim)
   - View approval statistics

## All Buttons Are Now Clearly Visible!

Every button now has:
- **Bright blue background** (#007AFF)
- **White text** (#FFFFFF)
- **Bold weight** (700)
- **Clear labels**

## Common Issues & Solutions

### "Port 8081 is already in use"
```bash
killall node
npm start
```

### "Can't see photos I just took"
- Grant camera/photo permissions when prompted
- Or use "Choose from Gallery" option

### "Claim not showing in adjuster view"
- Make sure you submitted it as body shop user
- Pull down to refresh on pending screen
- Check that you're logged in as adjuster

### "Button text still not visible"
- Force quit the app completely
- Clear cache: `npx expo start -c`
- Make sure you're on latest build

## App Features Overview

| Feature | Body Shop | Adjuster |
|---------|-----------|----------|
| Create Claims | ✅ | ❌ |
| AI Analysis | ✅ | View Only |
| Generate Estimates | ✅ | ❌ |
| Review Claims | ❌ | ✅ |
| Fraud Detection | ❌ | ✅ |
| Approve/Reject | ❌ | ✅ |
| Analytics | Basic | Full |

## Screenshots to Expect

1. **Welcome** - Blue buttons on white/dark background
2. **Login** - Email/password fields, blue "Sign In" button
3. **Body Shop Dashboard** - Stats cards, recent claims
4. **Photo Capture** - 8 photo slots in grid
5. **Damage Assessment** - AI confidence score, detected areas
6. **Estimate** - Itemized costs, total amount
7. **Adjuster Pending** - List of claims with auto-approve badges
8. **Claim Review** - Fraud score, photos, approve/reject buttons

## Need Help?

- Check **ARCHITECTURE.md** for technical details
- Check **README_APP.md** for detailed flow descriptions
- All buttons should now be clearly visible with blue backgrounds
- If you see any invisible text, please share a screenshot!

---

**The app is now ready to use! All navigation flows work and all buttons are visible.** 🎉
