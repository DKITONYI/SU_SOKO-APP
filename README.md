# SU SOKO App

SU SOKO is a React Native Expo marketplace app for Strathmore students. It supports three main roles: buyers, sellers, and admins. Buyers browse and buy approved products, sellers list products after activating a subscription, and admins manage users, listings, reports, subscriptions, and marketplace activity.

The app uses Firebase Authentication for login/register, Cloud Firestore for the database, React Navigation for screen flow, and an M-Pesa STK payment flow for seller subscriptions and product purchases. The frontend lives in `SU_SOKO_APP`, while payment backend examples live in `functions` and `proxy`.

## Main Technology Stack

- React Native with Expo: mobile app runtime and development server.
- TypeScript: app code and typed marketplace models.
- Firebase Authentication: email/password authentication.
- Cloud Firestore: main database.
- Firebase SDK: `firebase/auth` and `firebase/firestore` are used for login, registration, reads, writes, updates, realtime listeners, and transactions.
- React Navigation: stack navigators for auth, buyer, seller, and admin flows.
- React Native Paper and custom components: reusable UI elements.
- Expo Image Picker and Expo File System: product image selection and local image storage.
- M-Pesa Daraja integration: STK push payment flow through either Firebase Functions or Flask proxy.

Important app dependencies are listed in `SU_SOKO_APP/package.json`.

## Project Structure

```text
SU_SOKO-APP/
  firestore.rules                  Firestore authorization rules
  firebase.json                    Firebase project config
  functions/index.js               Firebase Functions Express M-Pesa API
  proxy/app.py                     Flask M-Pesa proxy alternative
  SU_SOKO_APP/
    App.tsx                        App entry wrapper
    src/
      navigation/                  Auth, buyer, seller, admin navigation
      screens/                     Role-based app screens
      services/                    Firebase and payment business logic
      context/AuthContext.tsx      Auth state and role routing
      types/marketplace.ts         Main database/domain types
      firebase/firebaseConfig.ts   Firebase app, auth, and Firestore setup
      components/                  Reusable UI components
      hooks/                       Shared hooks such as payment status
```

## App Workflow

The application starts from `AppNavigator`. It reads the current Firebase user and Firestore profile through `AuthContext`, then routes the user based on role:

- No logged in user: `AuthNavigator`
- Buyer role: `BuyerNavigator`
- Seller role: `SellerNavigator`
- Admin role: `AdminNavigator`

Authentication screens call `authService.ts`. Registration creates the Firebase Auth user and then creates a matching document in the `users` collection. Login reads the user profile from Firestore and normalizes the role/subscription status when needed. Admin login is handled through the configured admin email in `authService.ts`.

Buyer screens allow users to browse active products, search/filter products, view product details, message sellers, buy products with M-Pesa, and review products after purchase.

Seller screens allow sellers to activate subscription, add products, view their listings, see messages, and view sales reports. A seller must have `subscription_status: "active"` before listing products.

Admin screens allow admins to view users, approve/reject pending listings, review reports, monitor subscriptions, and view marketplace summaries.

## Feature Overview

### Authentication and Roles

Authentication is implemented in `src/services/authService.ts` using Firebase Auth methods:

- `createUserWithEmailAndPassword` for registration.
- `signInWithEmailAndPassword` for login.
- `sendPasswordResetEmail` for password reset.
- `signOut` for logout.

After authentication, the app stores profile data in the Firestore `users` collection. The role field controls navigation and permissions. Supported roles are `buyer`, `seller`, and `admin`.

### Buyer Product Browsing

The buyer home screen calls `getActiveProducts()` from `productService.ts`. This reads the `products` collection where `status == "active"` and limits results to 30 products. Buyers only see listings that admins have approved.

### Search and Filtering

Search is implemented in `src/screens/Buyer/SearchScreen.tsx` and `src/services/productService.ts`.

The screen uses React state for:

- `keyword`: text typed in the search bar.
- `category`: selected category filter.
- `products`: search results.

The UI uses React Native `TextInput` for the search bar and `TouchableOpacity` controls for the category dropdown. The search icon comes from `@expo/vector-icons`.

The service function `searchActiveProducts(keyword, category)` first builds a Firestore query:

- Always filters `products` by `status == "active"`.
- Adds `category == selectedCategory` when the user chooses a category.
- Limits results to 50 documents.

After Firestore returns the matching active/category products, the app performs local keyword matching in JavaScript by checking whether the lowercased keyword appears in the product title, description, or category. This approach keeps Firestore queries simple while still supporting a useful search bar.

### Seller Product Listings

Product creation is handled by `AddProduct.tsx` and `productService.ts`.

The seller enters title, price, category, description, and optionally selects an image. Images are selected with `expo-image-picker`. On native devices, the selected image is copied to local app storage using `expo-file-system/legacy`. On web, the browser session image URI is used.

`createProductListing()` validates that:

- The user is logged in.
- The category is one of the supported product categories.
- The user role is `seller`.
- The seller subscription is active.

New products are saved to the `products` collection with `status: "pending"`. This means buyers cannot see them immediately. An admin must approve the product first.

### Admin Listing Approval

Admins manage pending products in `src/screens/Admin/Listings.tsx`.

The screen calls:

- `getPendingProducts()` to read products where `status == "pending"`.
- `approveProduct()` / `adminApproveProduct()` to update the product status to `active`.
- `rejectProduct()` to update the product status to `deleted` and store a rejection reason.

This creates a moderation workflow: seller creates listing, admin approves listing, buyer sees active listing.

### Messaging

Messaging is implemented in `messageService.ts`.

When a buyer messages a seller from the product details screen, `sendMessage(productId, receiverId, body)` creates a document in the `messages` collection. Each message stores:

- `product_id`
- `sender_id`
- `receiver_id`
- `body`
- `read`
- `created_at`

Conversation reads use Firestore queries by product and participant fields, then the app filters/sorts messages in memory so only the current user's conversation is shown.

### M-Pesa Payments

Payments are implemented in `paymentService.ts`, `usePaymentStatus.ts`, `functions/index.js`, and `proxy/app.py`.

The app supports two payment purposes:

- `seller_subscription`: activates a seller account after payment.
- `product_purchase`: marks a product as sold after payment.

The frontend creates a Firestore document in the `payments` collection before sending an STK push. In mock mode, the app automatically marks the payment as paid after a delay and updates the related user or product. In live mode, the app sends a POST request to the backend M-Pesa endpoint.

`usePaymentStatus(paymentId)` listens to the payment document with Firestore `onSnapshot`. This lets the UI update when the payment moves from `pending` to `stk_sent`, `paid`, or `failed`.

### Product Reviews

Reviews are implemented in `reviewService.ts` and the buyer feedback screen.

Only buyers who purchased a product can review it. The service checks products where `sold_to == currentUser.uid`, then allows ratings of `1`, `2`, or `3`. Reviews are saved in the `reviews` collection using a deterministic document id: `productId_buyerId`. This prevents duplicate review documents for the same buyer/product pair while still allowing updates.

### Reports

Product reports are implemented in `reportService.ts`.

When a user reports a product, the app creates a document in the `reports` collection with product, reporter, seller, reason, status, and timestamp fields. Admins read pending reports, review them, and mark them as reviewed.

### Reports and Analytics

Sales and subscription reports are implemented in `reportingService.ts`.

Seller sales reports read paid `product_purchase` documents from the `payments` collection where `seller_id` is the current seller. The app joins those payment records with product and buyer profiles to display useful report rows.

Subscription revenue reports read paid `seller_subscription` payments and calculate total revenue plus the number of unique subscribed sellers.

## Database Schema

The main typed schema is documented in `src/types/marketplace.ts`. Firestore is schemaless, but the app consistently uses these collections and fields.

### users

Represents every account in the app.

```text
users/{uid}
  uid: string
  user_number?: string
  fullName?: string
  email?: string
  phone?: string
  role: "buyer" | "seller" | "admin"
  subscription_status: "active" | "inactive"
  is_active?: boolean
  created_at?: timestamp
  updated_at?: timestamp
  subscription_updated_at?: timestamp
```

Important relationships:

- `users.uid` is the primary user identifier from Firebase Auth.
- `products.seller_id` points to `users.uid`.
- `messages.sender_id` and `messages.receiver_id` point to `users.uid`.
- `payments.user_id` points to the buyer/seller who made the payment.
- `payments.seller_id` points to the seller for product purchase payments.
- `reviews.buyer_id` and `reviews.seller_id` point to `users.uid`.
- `reports.reporter_id` and `reports.seller_id` point to `users.uid`.

### products

Represents marketplace listings.

```text
products/{productId}
  id: string
  seller_id: string
  product_number?: number
  title: string
  category: "household_items" | "books" | "electronics" | "clothes" | "shoes" | "jewellery"
  description?: string
  imageUrl?: string
  price?: number
  status: "pending" | "active" | "sold" | "deleted"
  sold_to?: string
  sold_at?: timestamp
  created_at: timestamp
  updated_at?: timestamp
  rejection_reason?: string
```

Important relationships:

- One seller can have many products. This is a one-to-many relationship from `users.uid` to `products.seller_id`.
- One buyer can buy many products. This is represented by `products.sold_to`.
- One product can have many messages and reports.
- One product can have one review per buyer because review ids are stored as `productId_buyerId`.

### messages

Represents buyer-seller communication about products.

```text
messages/{messageId}
  product_id: string
  sender_id: string
  receiver_id: string
  body: string
  read: boolean
  created_at: timestamp
```

Important relationships:

- `product_id` connects the message to a product.
- `sender_id` and `receiver_id` connect the message to users.
- A product can have many messages.
- A user can send many messages and receive many messages.

### payments

Represents seller subscription payments and buyer product payments.

```text
payments/{paymentId}
  user_id: string
  phone_number: string
  amount: number
  purpose: "seller_subscription" | "product_purchase"
  product_id?: string
  seller_id?: string
  payment_mode?: string
  status: "pending" | "stk_sent" | "paid" | "failed"
  checkout_request_id?: string
  merchant_request_id?: string
  mpesa_receipt_number?: string
  result_code?: number
  result_description?: string
  failure_reason?: string
  paid_at?: timestamp
  created_at: timestamp
  updated_at: timestamp
```

Important relationships:

- `user_id` connects the payment to the user who paid.
- `seller_id` connects product purchase payments to the seller.
- `product_id` connects product purchase payments to the product being bought.
- Seller subscription payments update `users.subscription_status`.
- Product purchase payments update `products.status`, `products.sold_to`, and `products.sold_at`.

### reviews

Represents buyer feedback after a product is bought.

```text
reviews/{productId_buyerId}
  product_id: string
  product_title: string
  seller_id: string
  buyer_id: string
  buyer_name?: string
  rating: 1 | 2 | 3
  created_at: timestamp
  updated_at: timestamp
```

Important relationships:

- `product_id` connects the review to a product.
- `seller_id` connects the review to the seller being reviewed.
- `buyer_id` connects the review to the buyer who purchased the product.
- A seller can have many reviews.
- A buyer can review many purchased products.

### reports

Represents product reports submitted by users.

```text
reports/{reportId}
  product_id: string
  product_title?: string
  reporter_id: string
  reporter_name?: string
  seller_id?: string
  seller_name?: string
  reason: string
  status: "pending" | "reviewed" | "dismissed"
  created_at: timestamp
  reviewed_at?: timestamp
```

Important relationships:

- `product_id` connects the report to a product.
- `reporter_id` connects the report to the user who reported.
- `seller_id` connects the report to the seller who owns the product.
- One product can have many reports.

### counters

Used by `idService.ts` to allocate readable numbers.

```text
counters/users
  current: number
  updated_at: timestamp

counters/products
  current: number
  updated_at: timestamp
```

`runTransaction` is used so two users/products do not get the same number at the same time.

## Relationship Summary

The app uses Firestore document IDs and reference fields instead of SQL foreign keys. Conceptually, these fields work like foreign keys:

- `products.seller_id -> users.uid`
- `products.sold_to -> users.uid`
- `messages.product_id -> products.id`
- `messages.sender_id -> users.uid`
- `messages.receiver_id -> users.uid`
- `payments.user_id -> users.uid`
- `payments.product_id -> products.id`
- `payments.seller_id -> users.uid`
- `reviews.product_id -> products.id`
- `reviews.buyer_id -> users.uid`
- `reviews.seller_id -> users.uid`
- `reports.product_id -> products.id`
- `reports.reporter_id -> users.uid`
- `reports.seller_id -> users.uid`

Main relationship types:

- User to products: one seller to many products.
- User to messages: one user to many sent messages and many received messages.
- Product to messages: one product to many messages.
- User to payments: one user to many payments.
- Product to payments: one product purchase payment for a sold product.
- User to reviews: one seller to many reviews, one buyer to many reviews.
- Product to reports: one product to many reports.

## Firestore and HTTP Operations

Most app data access uses Firebase SDK methods rather than manually written REST endpoints.

### Firebase Auth Operations

Implemented in `authService.ts`:

- Register: `createUserWithEmailAndPassword`
- Login: `signInWithEmailAndPassword`
- Logout: `signOut`
- Password reset: `sendPasswordResetEmail`

### Firestore Create Operations

These are similar to POST/create operations:

- `addDoc(collection(db, "products"), ...)` creates product listings.
- `addDoc(collection(db, "messages"), ...)` creates messages.
- `addDoc(collection(db, "reports"), ...)` creates reports.
- `addDoc(collection(db, "payments"), ...)` creates payment records.
- `setDoc(doc(db, "users", uid), ...)` creates or merges user profiles.
- `setDoc(doc(db, "reviews", productId_buyerId), ...)` creates or updates a review.

### Firestore Read Operations

These are similar to GET/read operations:

- `getDoc(doc(db, "users", uid))` reads one user profile.
- `getDoc(doc(db, "products", productId))` reads one product.
- `getDocs(query(collection(db, "products"), ...))` reads product lists.
- `getDocs(query(collection(db, "messages"), ...))` reads conversations.
- `getDocs(collection(db, "users"))` reads users for admin views.
- `onSnapshot(doc(db, "payments", paymentId), ...)` listens to payment status in realtime.
- `onSnapshot(query(collection(db, "users"), where("role", "==", "seller")), ...)` listens to seller subscriptions.

### Firestore Update Operations

These are similar to PUT/PATCH/update operations:

- `updateDoc(doc(db, "products", productId), { status: "active" })` approves a product.
- `updateDoc(doc(db, "products", productId), { status: "deleted" })` rejects a product.
- `updateDoc(doc(db, "products", productId), { status: "sold" })` marks a product as sold.
- `updateDoc(doc(db, "users", sellerId), { subscription_status })` updates seller subscriptions.
- `updateDoc(doc(db, "reports", reportId), { status: "reviewed" })` marks reports as reviewed.
- `writeBatch(db)` updates multiple message documents as read.
- `runTransaction(db, ...)` updates counters safely.

### Firestore Delete Operations

The current app mostly uses status updates instead of deleting important records. For example, rejecting a listing sets `status: "deleted"` rather than removing the product document. Firestore rules allow admins to delete some resources, but normal app workflows focus on soft deletion/status changes.

### Backend HTTP Methods

The frontend uses `fetch` in `paymentService.ts` for live M-Pesa payments:

```text
POST {MPESA_API_URL}/mpesa/stk-push
```

The Firebase Functions backend in `functions/index.js` exposes:

```text
POST /mpesa/stk-push
POST /mpesa/callback
```

The Flask proxy in `proxy/app.py` exposes:

```text
GET  /health
POST /mpesa/stk-push
POST /api/stkpush
POST /mpesa/callback
POST /api/mpesa-callback
```

The STK push endpoint sends a request to Safaricom Daraja. The callback endpoint receives the payment result, updates the `payments` document, and then updates either the seller subscription or product sale status.

## Security Rules Overview

Firestore rules are stored in `firestore.rules`.

The rules enforce:

- Only signed-in users can access app data.
- Users can create their own buyer/seller profile.
- Admin users can manage users, listings, reports, and payments.
- Sellers need an active subscription to create or update their own products.
- New seller products must start as `pending`.
- Buyers can only review products they bought.
- Payment records can be read by admins, the paying user, or the related seller.
- Product reports can be read by admins, the reporter, or the related seller.

These rules support the same workflow used in the screens: register/login, seller subscription, pending listing, admin approval, buyer purchase, feedback, reports, and admin review.

## How To Run

From the app folder:

```powershell
cd SU_SOKO_APP
npm.cmd start
```

Useful scripts:

```powershell
npm.cmd run android
npm.cmd run ios
npm.cmd run web
```

On Windows PowerShell, `npm.cmd` avoids the common `npm.ps1 cannot be loaded because running scripts is disabled` issue.

## Environment Variables

The app reads:

```text
EXPO_PUBLIC_MPESA_API_URL
EXPO_PUBLIC_PAYMENT_MODE
```

The Firebase Functions backend expects M-Pesa values such as:

```text
MPESA_ENV
MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET
MPESA_SHORTCODE
MPESA_PASSKEY
MPESA_CALLBACK_URL
```

The Flask proxy expects Daraja/Firebase values such as:

```text
FIREBASE_SERVICE_ACCOUNT_PATH
DARAJA_CONSUMER_KEY
DARAJA_CONSUMER_SECRET
DARAJA_PASSKEY
DARAJA_SHORTCODE
DARAJA_ENV
DARAJA_CALLBACK_URL
```

Example files are included as `.env.example` files.

## Summary

SU SOKO is built around a clear role-based marketplace flow. Firebase Authentication identifies the user, Firestore stores the marketplace data, React Navigation sends the user to the correct screen set, and service files keep the main business logic separate from UI screens. The database relationships are handled through ID fields that connect users, products, messages, payments, reviews, and reports. Admin approval and Firestore security rules protect the marketplace workflow so sellers list products, admins approve them, and buyers only purchase active listings.
