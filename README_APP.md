# Collision Repair AI - Getting Started

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the app**:
   ```bash
   npm start
   ```

3. **Choose your platform**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web Browser

## Demo Login Credentials

### Body Shop Account
- **Email**: `shop@example.com` (or any email WITHOUT "adjuster")
- **Password**: `test123` (or anything)

### Insurance Adjuster Account
- **Email**: `adjuster@example.com` (must contain "adjuster")
- **Password**: `test123` (or anything)

## Testing the Full Flow

### As a Body Shop:

1. **Login** with `shop@example.com`
2. Click **"New Claim"** tab
3. Click **"Get Started"** button
4. **Enter vehicle details**:
   - Year: 2020
   - Make: Toyota
   - Model: Camry
5. Click **"Continue to Photos"**
6. **Take/select at least 4 photos** (use "Choose from Gallery" for quick testing)
7. Click **"Continue to Analysis"**
8. Wait for **AI analysis** (2-4 seconds)
9. Review **damage assessment**
10. Click **"Generate Estimate"**
11. Review the **estimate details**
12. Click **"Submit to Insurance"**
13. Confirm submission

### As an Insurance Adjuster:

1. **Login** with `adjuster@example.com`
2. Go to **"Pending"** tab
3. You'll see claims submitted by body shops
4. **Click on a claim** to review
5. Review:
   - Fraud score
   - Photos
   - Damage assessment
   - Estimate amount
6. Click **"Approve"** or **"Reject"**
7. Check **"Approved"** tab to see processed claims
8. Check **"Analytics"** tab for revenue metrics

## Key Features to Test

✅ **Photo Capture**: Multi-angle damage documentation
✅ **AI Analysis**: Automatic damage detection
✅ **Estimate Generation**: Instant repair cost calculation
✅ **Fraud Detection**: Risk scoring on claim review
✅ **Auto-Approval**: Claims under $5,000 eligible for instant approval
✅ **Dark Mode**: Toggle in device settings

## Troubleshooting

**Can't see button text?**
- Make sure you're on the latest build
- Try toggling dark/light mode in your device settings

**Photos not loading?**
- Grant camera permissions when prompted
- Use "Choose from Gallery" option for testing

**Claims not appearing for adjuster?**
- Make sure you submitted the claim as a body shop first
- Refresh by pulling down on the pending claims screen

## App Structure

```
Body Shop Flow:
Login → Dashboard → New Claim → Vehicle Info → Photos → AI Analysis → Estimate → Submit

Adjuster Flow:
Login → Pending Claims → Review Claim → Fraud Check → Approve/Reject → Analytics
```

## Need Help?

Check the **ARCHITECTURE.md** file for detailed technical documentation.
