# Vercel Deployment Instructions

## GEMMA-COMPATIBLE Setup for Vercel

### 1. Environment Variables
In your Vercel dashboard, add these environment variables:
- **OPENROUTER_API_KEY**: Your OpenRouter API key (get from https://openrouter.ai/)
- **MODEL_NAME**: (Optional) Set to "gemma" if using Gemma models

### 2. Deploy to Vercel
```bash
vercel --prod
```

### 3. What's Configured (GEMMA-COMPATIBLE)
- `api/decode.js` - Robust API handler with Gemma compatibility
- `vercel.json` - Clean config: only needed build and route
- Removed `api/index.js` - Eliminated routing conflicts
- Environment variable handling for API key
- CORS headers for frontend communication
- JSON-only responses (no HTML/text errors)
- Request body parsing with error handling
- Timeout protection (30 seconds)
- Guaranteed JSON responses
- Proper logging for debugging
- **Gemma compatibility** - No system role, only user messages
- **Error handling** for Gemma-specific errors

### 4. How It Works (GEMMA-COMPATIBLE)
1. Frontend on Vercel calls `/api/decode`
2. Vercel routes directly to `api/decode.js` (no conflicts)
3. `api/decode.js` detects Gemma models automatically
4. For Gemma: Sends system prompt as user message (no system role)
5. For other models: Sends system prompt as system message (normal behavior)
6. OpenRouter API processes psychological analysis with timeout
7. Response returns with living organism UI activation
8. No more hanging/infinite loading
9. Proper error responses for all failure cases

### 5. Testing
After deployment:
1. Visit your Vercel URL
2. Enter a reflection
3. Click "Decode this feeling"
4. Should work with Venom-style living organism UI!

### 6. Troubleshooting
- If API calls fail: Check OPENROUTER_API_KEY in Vercel env vars
- If build fails: Run `npm run build` locally first
- If deployment fails: Check `vercel.json` syntax
- If 500 errors: Check Vercel logs for API key or timeout issues
- If still loading: Check Vercel function logs for hanging requests
- **Gemma errors**: Look for "Developer instruction is not enabled" or "INVALID_ARGUMENT"
- If empty response: Check Vercel logs for response shape and error messages

### Files Changed (TIMEOUT HANDLING FIX):
✅ **`vercel.json`** - Clean routing configuration
✅ **`api/decode.js`** - Fixed with explicit timeout handling and comprehensive error catching
✅ **`api/index.js`** - Deleted (was causing conflicts)
✅ **`InputCard.jsx`** - Enhanced error parsing with content-type checking
✅ **`package.json`** - Added styled-jsx dependency
✅ **`DEPLOY_VERCEL.md`** - Updated with timeout handling details

### Key Timeout Fixes Applied:
⏱️ **Explicit Timeout**: 15-second AbortController timeout for all model requests
⏱️ **Comprehensive Error Handling**: Catches AbortError, HeadersTimeoutError, and all timeout variants
⏱️ **504 Status Code**: Returns proper gateway timeout status for timed out requests
⏱️ **Enhanced Logging**: Logs request start, completion, and timeout events
⏱️ **Frontend Error Parsing**: Checks content-type before parsing JSON
⏱️ **Styled-JSX Support**: Fixed jsx attribute warnings by installing dependency

### Technical Details:
- **Gemma Detection**: `process.env.MODEL_NAME?.toLowerCase().includes('gemma')`
- **Message Structure**: 
  ```javascript
  // Gemma: [{ role: "user", content: systemPrompt + "\\n\\n" + userMessage }]
  // Other: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }]
  ```
- **Error Handling**: Catches "Developer instruction is not enabled" and "INVALID_ARGUMENT"
- **Backward Compatibility**: Preserves existing behavior for all other models

### Expected Request Flow:
1. **POST /api/decode** → Vercel routes to `api/decode.js`
2. **Model Detection**: Checks if MODEL_NAME includes "gemma"
3. **Request Formatting**: Adapts message structure based on model
4. **API Call**: OpenRouter processes with proper format
5. **Response Handling**: Returns JSON with proper error handling
6. **Logging**: Enhanced debugging for all model types
