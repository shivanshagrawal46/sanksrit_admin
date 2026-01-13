# Authentication API - Flutter Integration Guide

This document provides comprehensive documentation for integrating the Authentication API with your Flutter application.

## Base URL

```
http://your-server-url.com/api/auth
```

Replace `your-server-url.com` with your actual server domain or IP address.

---

## API Endpoints

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "isAdmin": false,
    "picture": ""
  }
}
```

**Error Response (400):**
```json
{
  "error": "Email already registered."
}
```

---

### 2. Login
**Endpoint:** `POST /api/auth/login`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "isAdmin": false,
    "picture": ""
  }
}
```

**Error Response (400):**
```json
{
  "error": "Invalid email or password."
}
```

---

### 3. Google Sign-In
**Endpoint:** `POST /api/auth/google`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzM..."
}
```

**Note:** The `idToken` should be obtained from Google Sign-In in your Flutter app using the `google_sign_in` package.

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "9999999999",
    "picture": "https://lh3.googleusercontent.com/a/...",
    "isAdmin": false
  },
  "requestId": "req_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response (400/401/503):**
```json
{
  "error": "Failed to verify Google token",
  "details": "Token audience mismatch...",
  "requestId": "req_1234567890_abc123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 4. Get Current User
**Endpoint:** `GET /api/auth/me`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "picture": "",
    "isAdmin": false,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": "No token provided. Please authenticate."
}
```

---

### 5. Refresh Token
**Endpoint:** `POST /api/auth/refresh-token`

**Request Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (empty)

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "picture": "",
    "isAdmin": false
  }
}
```

---

### 6. Get All Users (Admin Only)
**Endpoint:** `GET /api/auth/users`

**Request Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Success Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "1234567890",
      "picture": "",
      "isAdmin": false,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Response (403):**
```json
{
  "error": "Access denied. Admin only."
}
```

---

## Flutter Implementation

### 1. Required Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.1.0
  google_sign_in: ^6.1.5
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0  # Optional, for secure token storage
```

### 2. API Service Class

Create a file `lib/services/auth_service.dart`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  // Replace with your server URL
  static const String baseUrl = 'http://your-server-url.com/api/auth';
  
  // Store token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }
  
  // Get stored token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
  
  // Remove token (logout)
  Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
  
  // Register
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String phone,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phone': phone,
          'password': password,
          'confirmPassword': confirmPassword,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 201 && data['success'] == true) {
        await saveToken(data['token']);
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Registration failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }
  
  // Login
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        await saveToken(data['token']);
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }
  
  // Google Sign-In
  Future<Map<String, dynamic>> googleSignIn() async {
    try {
      // Initialize Google Sign-In
      final GoogleSignIn googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
      );
      
      // Sign in with Google
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      
      if (googleUser == null) {
        return {'success': false, 'error': 'Google sign-in cancelled'};
      }
      
      // Get authentication details
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      // Send ID token to backend
      final response = await http.post(
        Uri.parse('$baseUrl/google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'idToken': googleAuth.idToken,
        }),
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        await saveToken(data['token']);
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Google sign-in failed'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }
  
  // Get current user
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'error': 'No token found'};
      }
      
      final response = await http.get(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to get user'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }
  
  // Refresh token
  Future<Map<String, dynamic>> refreshToken() async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'error': 'No token found'};
      }
      
      final response = await http.post(
        Uri.parse('$baseUrl/refresh-token'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        await saveToken(data['token']);
        return {'success': true, 'user': data['user']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Failed to refresh token'};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network error: ${e.toString()}'};
    }
  }
  
  // Logout
  Future<void> logout() async {
    await removeToken();
    final GoogleSignIn googleSignIn = GoogleSignIn();
    await googleSignIn.signOut();
  }
}
```

### 3. Usage Example

```dart
import 'package:flutter/material.dart';
import 'services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _login() async {
    setState(() => _isLoading = true);
    
    final result = await _authService.login(
      email: _emailController.text,
      password: _passwordController.text,
    );
    
    setState(() => _isLoading = false);
    
    if (result['success']) {
      // Navigate to home screen
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      // Show error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['error'])),
      );
    }
  }

  Future<void> _googleSignIn() async {
    setState(() => _isLoading = true);
    
    final result = await _authService.googleSignIn();
    
    setState(() => _isLoading = false);
    
    if (result['success']) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['error'])),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _login,
              child: _isLoading ? CircularProgressIndicator() : Text('Login'),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _googleSignIn,
              child: Text('Sign in with Google'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Google Sign-In Setup for Flutter

### Android Setup

1. **Get SHA-1 Certificate Fingerprint:**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

2. **Add SHA-1 to Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to APIs & Services > Credentials
   - Create or edit OAuth 2.0 Client ID for Android
   - Add your SHA-1 fingerprint and package name

3. **Update `android/app/build.gradle`:**
   ```gradle
   defaultConfig {
       applicationId "com.yourcompany.yourapp"
       // ... other config
   }
   ```

### iOS Setup

1. **Add Bundle ID in Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or edit OAuth 2.0 Client ID for iOS
   - Add your iOS Bundle ID

2. **Update `ios/Runner/Info.plist` (optional, handled automatically):**
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleTypeRole</key>
       <string>Editor</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>YOUR_REVERSED_CLIENT_ID</string>
       </array>
     </dict>
   </array>
   ```

---

## Error Handling

All endpoints may return these common error codes:

- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Invalid or expired token, authentication required
- **403 Forbidden:** Access denied (e.g., admin-only endpoint)
- **500 Internal Server Error:** Server error

Always check the `success` field in the response and handle errors appropriately in your Flutter app.

---

## Security Notes

1. **Token Storage:** Use `flutter_secure_storage` for production apps to store tokens securely
2. **HTTPS:** Always use HTTPS in production to encrypt token transmission
3. **Token Expiry:** Tokens expire after 7 days. Use refresh token endpoint to get a new token
4. **Password Requirements:** Minimum 6 characters (enforced on backend)

---

## Testing

Use tools like Postman or curl to test the API:

```bash
# Login example
curl -X POST http://your-server-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user
curl -X GET http://your-server-url.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
