# Firestore Security Rules Setup

## Issue
You're getting "Missing or insufficient permissions" errors because Firestore security rules haven't been configured.

## Solution

### Step 1: Deploy Firestore Rules

1. **Using Firebase CLI** (Recommended):
   ```bash
   # Install Firebase CLI if you haven't
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase in your project (if not already done)
   firebase init firestore
   
   # Deploy the rules
   firebase deploy --only firestore:rules
   ```

2. **Using Firebase Console** (Alternative):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `legalbuddy-1215d`
   - Go to **Firestore Database** → **Rules** tab
   - Copy and paste the contents of `firestore.rules` file
   - Click **Publish**

### Step 2: Verify Rules

After deploying, the rules should allow:
- ✅ Authenticated users to read their own chats
- ✅ Authenticated users to create chats with their userId
- ✅ Authenticated users to update/delete their own chats

### Step 3: Create Index (if needed)

If you get an index error, Firestore will provide a link to create the required index. Click it to auto-create, or:

1. Go to Firestore Database → **Indexes** tab
2. Create a composite index:
   - Collection: `chats`
   - Fields: `userId` (Ascending), `timestamp` (Ascending)

## Current Rules

The `firestore.rules` file contains:
- Users can only read/write chats where `userId` matches their authenticated `uid`
- Same security for documents collection

## Testing

After deploying rules, test by:
1. Logging in to your app
2. Sending a chat message
3. Viewing chat history

If you still see permission errors, check:
- User is authenticated (check Firebase Auth)
- Rules were deployed successfully
- Browser cache is cleared

