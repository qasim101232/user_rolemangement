# TODO - Professional + Advanced Upgrade

## Frontend
- [x] Inspect and clean CSS imports to avoid conflicts (index.js + CSS files).
- [x] Upgrade Header UI (dropdown menu, role display improvements, responsive behavior).

- [ ] Upgrade Dashboard UI:
  - [ ] Search (name/email/login_id)
  - [ ] Sort (name/status)
  - [ ] Pagination
  - [ ] Better loading + empty states
- [ ] Add auth persistence/restore:
  - [ ] Preload user from localStorage
  - [ ] If token exists but user missing, call `GET /api/auth/me`
  - [ ] Guard rendering with a loading state

## Backend (verification)
- [ ] Verify endpoints used by UI exist and are role-protected (users list, roles list, create user).

## Validation
- [ ] Run both servers, login, dashboard access, and confirm admin-only actions.
- [ ] Refresh browser and ensure session persists.

