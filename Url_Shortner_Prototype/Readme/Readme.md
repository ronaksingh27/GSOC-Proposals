# URL Shortener Service (Backend)

A Cloudflare Worker-based URL shortener service with email-based authentication and magic links.

## Features

- 🔗 Shorten long URLs to easy-to-share short links
- 🔒 Secure email-based authentication using magic links
- ⏳ Optional link expiration
- 🚀 Fast redirects using Cloudflare's global network
- 📧 Email notifications with Resend

## API Endpoints

### Authentication

- `POST /auth/request` - Request a magic link  
  **Request Body:**  
  ```json
  {
    "email": "user@example.com"
  }
  ```

- `GET /auth/{token}` - Verify magic link token  
  **Response:**  
  ```json
  {
    "token": "auth_token"
  }
  ```

### URL Shortening

- `POST /shorten` - Create a short URL  
  **Headers:**  
  ```
  Authorization: Bearer {auth_token}
  Content-Type: application/json
  ```  
  **Request Body:**  
  ```json
  {
    "url": "https://example.com",
    "expiresIn": 3600  // in seconds (optional)
  }
  ```  
  **Response:**  
  ```json
  {
    "shortUrl": "https://short-it.example.com/abc123",
    "expiresAt": 1234567890  // timestamp (if expiration set)
  }
  ```

### Redirection

- `GET /{shortCode}` - Redirects to the original URL  
  **Response:**  
  - 301 Redirect to original URL (if valid)
  - 404 if not found
  - 410 if expired

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `URL_STORE` | KV namespace for URL mappings | Yes |
| `AUTH_TOKENS` | KV namespace for auth tokens | Yes |
| `RESEND_API_KEY` | API key for Resend email service | Yes |

## Setup Instructions

1. Create Cloudflare Worker with two KV namespaces:
   - `URL_STORE` for URL mappings
   - `AUTH_TOKENS` for authentication tokens

2. Set environment variables in your Worker:
   ```sh
   RESEND_API_KEY=your_resend_api_key
   ```

3. Deploy the worker to Cloudflare

## Security Notes

- Magic links expire after 15 minutes
- All API endpoints require HTTPS
- Authentication tokens are stored with TTL (Time-To-Live)
- Short URLs can be set to expire automatically

## Dependencies

- [Resend](https://resend.com) - For sending magic link emails
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv/) - For data persistence

## Error Responses

All error responses follow this format:
```json
{
  "error": "description_of_error"
}
```

Common error status codes:
- 400 - Bad request (invalid input)
- 401 - Unauthorized (invalid/missing auth)
- 404 - Not found
- 410 - Gone (expired resource)