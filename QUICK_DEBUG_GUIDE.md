# 🔍 Quick Debug Guide - My Students & Feedback Access

## ✅ **Issue Fixed!**

**Problem:** Không truy cập được "My Students" và "Feedback" trong role Tutor

**Root Cause:** Missing `handleNavigate` function trong App.tsx

**Solution:** Đã thêm function `handleNavigate` vào App.tsx

---

## 🧪 **Test Steps**

### **Step 1: Sign In as Tutor**

1. **Refresh page** (Ctrl+R hoặc Cmd+R)
2. **Sign Out** nếu đang logged in
3. **Sign In Screen** → Select **"Tutor"** role
4. Click **"Sign In with HCMUT SSO"**
5. ✅ Wait for authentication (2 seconds)

---

### **Step 2: Check Sidebar Menu**

After login, check sidebar menu items. You should see:

**For Tutor Role:**
- ✅ **Dashboard** (Home icon)
- ✅ **Meetings** (Calendar icon)
- ✅ **My Students** (Users icon) ← **NEW!**
- ✅ **Feedback** (FileText icon) ← **NEW!**
- ✅ **Library** (FolderOpen icon)
- ✅ **Settings** (Settings icon)

**Should NOT see:**
- ❌ Find Tutors (Student only)
- ❌ My Progress (Student only)
- ❌ Users (Manager only)
- ❌ Permissions (Manager only)

---

### **Step 3: Test My Students**

1. Click **"My Students"** in sidebar
2. ✅ Should navigate to Student Management screen
3. ✅ Should see:
   - Stats cards (Total, Active, At Risk, Avg Rating)
   - 5 student cards
   - Search & filter options
   - ⋮ (More) button on each card

4. **Test Quick Actions:**
   - Click **⋮** on any student
   - ✅ Should see dropdown with 4 options:
     - 👁️ View Profile
     - 📝 Record Progress
     - 📊 View Progress
     - 💬 View Feedback

5. **Test View Profile:**
   - Click **⋮** → **View Profile**
   - ✅ Should navigate to Student Detail screen
   - ✅ Should see 4 action buttons in header
   - ✅ Should see 4 tabs (Personal Info, Sessions, Progress, Feedback)

---

### **Step 4: Test Feedback**

1. Click **"Feedback"** in sidebar
2. ✅ Should navigate to Feedback screen
3. ✅ Should see:
   - Stats cards (Total, Pending, Avg Rating, Responded)
   - 5 feedback cards
   - Search & filter options
   - "AI Feedback Analysis" button (purple)

4. **Test Reply:**
   - Click on a **Pending** feedback card
   - ✅ Dialog should open
   - ✅ Type a response
   - ✅ Click "Send Response"
   - ✅ Toast notification appears
   - ✅ Status updates to "Responded"

---

## 🐛 **Debug Console Logs**

Open browser console (F12) and look for these logs:

### **After Sign In:**
```
App: Navigating to: dashboard
```

### **When Clicking "My Students":**
```
AppLayout: Current role: Tutor
AppLayout: Menu items for role Tutor: ["dashboard", "meetings", "students", "feedback", "library", "settings"]
App: Navigating to: students
App: Rendering screen: students
```

### **When Clicking "Feedback":**
```
App: Navigating to: feedback
App: Rendering screen: feedback
```

---

## ⚠️ **Troubleshooting**

### **Problem 1: Still don't see "My Students" and "Feedback"**

**Check:**
1. ✅ Are you signed in as **Tutor**? (Check profile menu)
2. ✅ Did you **refresh** after the fix?
3. ✅ Check browser console for role:
   ```javascript
   // In console, type:
   localStorage.getItem('hcmut_user_role')
   // Should return: "Tutor"
   ```

**Fix:**
- Sign out completely
- Clear browser cache (Ctrl+Shift+Del)
- Refresh page
- Sign in again as **Tutor**

---

### **Problem 2: Menu shows but clicking doesn't work**

**Check console for errors:**
1. Open F12 → Console tab
2. Click "My Students"
3. Look for:
   ```
   App: Navigating to: students
   ```

**If you see an error:**
- Screenshot the error
- Report the exact error message

---

### **Problem 3: Signed in as wrong role**

**Check current role:**
1. Click **Profile icon** in top right
2. Should show: **"Tutor"** badge

**If wrong role:**
1. Click **Sign Out**
2. Sign in again
3. Select **"Tutor"** before clicking SSO

---

## 📊 **Expected Menu Items by Role**

### **Student Role:**
```
✅ Dashboard
✅ Meetings
✅ Find Tutors
✅ My Progress
✅ Library
✅ Settings
```

### **Tutor Role:**
```
✅ Dashboard
✅ Meetings
✅ My Students    ← Should see this!
✅ Feedback       ← Should see this!
✅ Library
✅ Settings
```

### **Manager Role:**
```
✅ Dashboard
✅ Meetings
✅ Users
✅ Permissions
✅ Analytics
✅ Library
✅ Settings
```

---

## ✅ **Verification Checklist**

- [ ] Refreshed browser after fix
- [ ] Signed out and signed in as **Tutor**
- [ ] See **6 menu items** in sidebar
- [ ] See **"My Students"** menu item (Users icon)
- [ ] See **"Feedback"** menu item (FileText icon)
- [ ] Click "My Students" → Navigate to list
- [ ] Click "Feedback" → Navigate to feedback screen
- [ ] Click student card → Navigate to detail
- [ ] Click ⋮ → See 4 dropdown options
- [ ] Reply to feedback → Dialog opens

---

## 🎯 **Quick Test (1 minute)**

1. **Sign In** as Tutor
2. **Check sidebar** - should see "My Students" and "Feedback"
3. **Click "My Students"** - should see 5 students
4. **Click "Feedback"** - should see 5 feedbacks
5. **Done!** ✅

---

## 🔧 **Code Changes Made**

### **File: `/App.tsx`**

**Added function:**
```typescript
const handleNavigate = (page: string) => {
  console.log("App: Navigating to:", page);
  setCurrentScreen(page as Screen);
};
```

**Location:** Line ~237, after `handleViewProgressFromDetail`

**Why:** AppLayout was calling `onNavigate` prop, but this function didn't exist in App.tsx, so clicking menu items did nothing.

---

## 🚀 **Next Steps After Verification**

Once you confirm "My Students" and "Feedback" are accessible:

1. ✅ Test all features in **TUTOR_FEATURES_GUIDE.md**
2. ✅ Try quick actions (⋮ dropdown)
3. ✅ Test reply to feedback
4. ✅ Test AI Feedback Analysis
5. ✅ Test navigation flows

---

## 📝 **Summary**

**What was fixed:**
- ✅ Added `handleNavigate` function in App.tsx
- ✅ Added console.log for debugging in AppLayout.tsx
- ✅ Menu items were already correctly defined
- ✅ Role context was already working

**What to test:**
1. Sign in as **Tutor**
2. Check sidebar for **"My Students"** and **"Feedback"**
3. Click both menu items
4. Verify navigation works

**Expected result:**
- ✅ Both menu items visible for Tutor
- ✅ Clicking navigates to correct screen
- ✅ All features working as documented

---

## 📞 **If Still Not Working**

**Share these details:**
1. Browser console logs (F12 → Console)
2. Screenshot of sidebar menu
3. Current role (from profile menu)
4. Any error messages

**Browser Console Check:**
```javascript
// Type in console:
localStorage.getItem('hcmut_user_role')
// Should show: "Tutor"

// If shows "Student" or "Manager":
// Sign out and sign in again as Tutor
```

---

**Fix deployed! Please test and confirm.** ✅
