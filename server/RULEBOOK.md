CODEGEN RULEBOOK FOR HACKATHON BACKEND

=== CORE PRINCIPLES ===

1. NO HALLUCINATION RULE

   - NEVER create new files that weren't explicitly requested
   - NEVER create new code patterns unless specifically asked
   - NEVER assume additional features or functionality
   - ONLY modify existing files that were previously created
   - ALWAYS check if a file exists before proposing new code

2. CODE GENERATION RULES

   - NO automatic comment generation of any kind
   - NO JSDoc comments
   - NO inline comments
   - NO comment blocks
   - ONLY code, zero documentation within code files
   - Keep code self-explanatory through clear naming

3. NAMING CONVENTIONS

   - Use camelCase for variables and functions
   - Use PascalCase for classes and components
   - Use UPPER_SNAKE_CASE for constants
   - Use descriptive names that indicate purpose

4. EXISTING CODE PRESERVATION

   - NEVER modify code that wasn't broken
   - NEVER refactor without explicit request
   - NEVER add "improvements" without asking
   - ONLY fix bugs when reported
   - Keep implementation minimal and focused

5. PACKAGE AND DEPENDENCY RULES

   - NO random package installations
   - NO "nice to have" packages
   - ONLY keep what's actually used in the code
   - NEVER add packages just for potential future use
   - Update packages ONLY when explicitly requested

6. ARCHITECTURE RULES

   - STRICT two-layer architecture: server.js + app.js
   - STRICT folder structure:
     - config/ - Configuration files only
     - constants/ - Constants and enumerations
     - controllers/ - Business logic
     - middleware/ - Express middleware
     - models/ - Database models
     - routes/ - API routes
     - utils/ - Utility functions and services
   - NEVER add new folders without explicit request
   - NEVER create admin.js or additional layer files

7. ERROR HANDLING RULES

   - USE ApiError class from utils/ApiError.js
   - USE ApiResponse class from utils/ApiResponse.js
   - ALWAYS use asyncHandler wrapper for async routes
   - ALWAYS use proper HTTP status codes from constants
   - ALWAYS use messages from USER_MESSAGES constant

8. LOGGING RULES

   - USE Winston logger from config/logger.js
   - NO console.log statements
   - NO console.error statements
   - All logging goes through logger instance

9. VALIDATION RULES

   - USE express-validator for request validation
   - ALWAYS validate input data
   - ALWAYS return proper error messages
   - Use constants for validation messages

10. DATABASE RULES

    - USE Mongoose for all database operations
    - USE connection from config/database.js
    - DB_NAME must be 'hackathon_db' (from constants)
    - ALWAYS use proper error handling for DB operations

11. FILE STRUCTURE RULES

    - .env.example - Environment template only
    - .gitignore - Git configuration
    - app.js - Express app configuration and routes
    - server.js - Server initialization only
    - README.md - Documentation only
    - package.json - Dependencies only

12. RESPONSE FORMAT RULES

    - ALL responses use ApiResponse class
    - Format: { success: boolean, message: string, data: any }
    - Use proper HTTP status codes
    - NEVER use custom response formats

13. EMOJI RULES

    - NO emojis in any file whatsoever
    - NO emojis in comments (don't exist anyway)
    - NO emojis in console logs
    - NO emojis in documentation
    - ONLY plain text everywhere

14. TESTING RULES

    - DO NOT create test files unless explicitly requested
    - DO NOT create mock data unless explicitly requested
    - DO NOT add testing libraries unless requested

15. ENVIRONMENT VARIABLES

    - ONLY add to .env.example when necessary
    - NEVER hardcode values
    - ALWAYS use process.env for configuration
    - Document all environment variables

16. ROUTES RULES

    - Routes in routes/ folder only
    - Controllers in controllers/ folder
    - Middleware applied at route level
    - NO route logic in server.js or app.js

17. CONSTANTS RULES

    - ALL HTTP status codes in HTTP_STATUS
    - ALL user messages in USER_MESSAGES
    - ALL configuration values as constants
    - ALL magic numbers as named constants

18. EXCEPTION CASES

    - ONLY break rules if explicitly instructed
    - ALWAYS confirm breaking rules before proceeding
    - Document any rule exceptions in RULEBOOK.md

19. SECURITY RULES

    - ALL passwords hashed with bcrypt
    - ALL sensitive data in environment variables
    - ALL inputs sanitized and validated
    - ALL SQL-like operations protected

20. PERFORMANCE RULES
    - SELECT only needed fields from database
    - Use pagination for list endpoints
    - Compress responses
    - Use rate limiting

=== IMPLEMENTATION CHECKLIST ===

Before writing any code:
[ ] Check if file already exists
[ ] Verify it's in correct folder
[ ] Check current implementation
[ ] Use existing patterns
[ ] No new features added
[ ] No comments in code
[ ] No emojis anywhere
[ ] Proper error handling
[ ] Proper logging
[ ] Proper response format

=== WHEN TO SAY NO ===

Decline requests that:

- Violate core principles 1-5
- Add new packages unnecessarily
- Create new file structures
- Add unnecessary comments
- Add automatic features
- Break existing functionality

=== LAST RULE ===

If unsure: ASK before implementing. Do not assume.

---

This rulebook must be followed for ALL code modifications and generation.
