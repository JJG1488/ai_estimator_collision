# Navigation and Interaction Fixes

## Issues Fixed

### 1. Login Not Redirecting to Dashboard

**Problem**: After clicking "Sign In", users stayed on the login screen instead of being redirected to their dashboard.

**Root Cause**: The original implementation relied on `app/index.tsx` to detect authentication changes and navigate. However, expo-router's navigation doesn't always trigger the useEffect when the pathname doesn't change to `/`.

**Solution**: Added direct navigation in the login screen after successful authentication:

```typescript
// app/(auth)/login.tsx
const handleLogin = async () => {
  try {
    await signIn(email, password);

    // Navigate directly based on user role
    if (email.includes('adjuster')) {
      router.replace('/(adjuster)/(tabs)/pending');
    } else {
      router.replace('/(body-shop)/(tabs)/dashboard');
    }
  } catch (error) {
    alert('Login failed. Please try again.');
  }
};
```

### 2. Sign Out Not Working

**Problem**: Sign out button didn't navigate back to welcome screen.

**Solution**: Already fixed in previous session - uses `router.replace('/')` which app/index.tsx catches and redirects to welcome screen.

### 3. Photo Capture Dialog Not Appearing (Web Platform Issue)

**Problem**: When clicking photo boxes, nothing happens on web platform.

**Root Cause**: React Native's `Alert.alert()` doesn't work properly on web. It either:
- Doesn't show at all
- Shows as a basic browser alert (without action buttons)
- Gets blocked by browsers

**Platform-Specific Behavior**:
- **iOS/Android**: Alert.alert() works perfectly with multiple buttons
- **Web**: Alert.alert() is unreliable and often doesn't work

**Current Code** (works on mobile only):
```typescript
Alert.alert(
  `${angleName} Photo`,
  'How would you like to add this photo?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: '📷 Take Photo', onPress: () => capturePhoto(angle) },
    { text: '🖼️ Choose from Photos', onPress: () => selectFromGallery(angle) },
  ]
);
```

**Solutions**:

#### Option A: Direct Photo Library on Web (Recommended for MVP)
Simply open the photo library when user clicks on web:

```typescript
const handlePhotoAction = (angle: PhotoAngle) => {
  if (Platform.OS === 'web') {
    // On web, go straight to photo library
    selectFromGallery(angle);
  } else {
    // On mobile, show dialog with both options
    Alert.alert(...);
  }
};
```

#### Option B: Custom Modal Dialog (Better UX)
Create a custom React Native modal that works on all platforms

#### Option C: Install Web-Compatible Alert Library
Use a library like `react-native-web-modal` or create a custom implementation

### 4. Warnings Cleanup

**Problem**: Console spam with "Too many screens defined. Route 'modal' is extraneous"

**Solution**: Removed unused modal route from `app/_layout.tsx`

## Testing Instructions

### After Reloading the App:

1. **Test Login**:
   - Open app → Should show Welcome screen
   - Tap "Sign In"
   - Enter: `shop@example.com` / any password
   - Tap "Sign In" button
   - **Expected**: Should navigate to Body Shop Dashboard
   - **If it doesn't work**: Check browser console for errors

2. **Test Adjuster Login**:
   - Sign out if logged in
   - Sign in with `adjuster@example.com` / any password
   - **Expected**: Should navigate to Insurance Adjuster Pending Claims

3. **Test Photo Capture** (Mobile only for now):
   - Login as body shop → New Claim → Get Started
   - Fill vehicle info → Continue to Photos
   - Tap any photo slot
   - **Expected on iOS/Android**: Dialog with 3 options
   - **Expected on Web**: May not work - needs platform-specific fix

4. **Test Sign Out**:
   - Go to Settings tab
   - Tap "Sign Out"
   - Confirm
   - **Expected**: Navigate back to Welcome screen

## Platform Support

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Login/Sign Out | ✅ | ✅ | ✅ |
| Navigation | ✅ | ✅ | ✅ |
| Photo Capture Dialog | ✅ | ✅ | ⚠️ Needs fix |
| Photo Library Access | ✅ | ✅ | ✅ |
| Camera Access | ✅ | ✅ | ⚠️ Limited |

## Next Steps

To fix photo capture on web, choose one of these approaches:

1. **Quick Fix** (5 min): Use Option A - direct photo library on web
2. **Better UX** (30 min): Create custom modal component for all platforms
3. **Third-party** (10 min): Install and configure a web-compatible dialog library

## Files Modified

1. ✅ `app/(auth)/login.tsx` - Added direct navigation after login
2. ✅ `app/_layout.tsx` - Removed unused modal route
3. ✅ `app/index.tsx` - Enhanced logging (from previous session)
4. ✅ `contexts/auth-context.tsx` - Enhanced logging (from previous session)

## Known Issues

1. **Photo capture on web**: Alert doesn't work - recommend using Option A above
2. **Camera on web**: Limited browser support - most browsers only allow photo upload

## Debug Console Output

When you login, you should see:
```
Login button pressed
Email: shop@example.com
Calling signIn...
Signing in user: {id: "...", email: "shop@example.com", role: "body_shop", ...}
User signed in successfully
signIn completed successfully
Navigating to body shop dashboard
```

If you don't see this output:
- **On mobile**: Check device logs
- **On web**: Open browser DevTools → Console tab
- **On Expo Go**: Shake device → Show Developer Menu → Debug Remote JS

---

**Important**: Make sure to reload your app completely after these changes. On web, do a hard refresh (Cmd+Shift+R / Ctrl+Shift+R).
