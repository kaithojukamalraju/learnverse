# LearnVerse API Design

## Base URL
`http://localhost:4000/api`

## Auth

### POST /auth/register
```json
// Request
{ "name": "string", "email": "string", "password": "string" }
// Response
{ "success": true, "data": { "user": { ... }, "token": "jwt..." } }
```

### POST /auth/login
```json
// Request
{ "email": "string", "password": "string" }
// Response
{ "success": true, "data": { "user": { ... }, "token": "jwt..." } }
```

### GET /auth/me
Headers: `Authorization: Bearer <token>`
Response: `{ "success": true, "data": { ...user } }`

## Modules

### GET /modules
Response: `{ "success": true, "data": [ ...Module ] }`

### GET /modules/:slug
Response: `{ "success": true, "data": Module }`

### GET /modules/:slug/lessons
Response: `{ "success": true, "data": [ ...Lesson ] }`

## AI Tutor

### POST /ai/chat
Headers: `Authorization: Bearer <token>`
```json
{ "message": "string", "session_id": "uuid (optional)" }
```
Response: `{ "success": true, "data": { "response": "string", "session_id": "uuid" } }`

### GET /ai/chat/:session_id
Response: `{ "success": true, "data": [ ...Message ] }`

## Quizzes

### POST /quizzes/start
```json
{ "quiz_id": "uuid" }
```
Response: `{ "success": true, "data": { attempt_id, quiz, questions } }`

### POST /quizzes/submit
```json
{ "attempt_id": "uuid", "answers": [{ "question_id": "uuid", "answer": "string" }], "time_taken_seconds": 120 }
```
Response: `{ "success": true, "data": { score, max_score, passed, answers } }`

### GET /quizzes/:id/result
Response: `{ "success": true, "data": { score, max_score, passed, answers, questions } }`

## Progress

### GET /progress/:userId
Response: `{ "success": true, "data": { progress: [...], stats: {...} } }`

### POST /progress/update
```json
{ "lesson_id": "uuid (optional)", "module_id": "uuid (optional)", "status": "completed|in_progress", "score": 85 }
```
Response: `{ "success": true, "data": Progress }`
