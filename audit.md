# ScrubAI Security Audit Log

**Last audited:** 2026-05-24
**Audited by:** Internal security review

---

## Remediation Summary

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | 🔴 Critical | Client-side rate limiting obfuscated with XOR+hash integrity | ✅ Fixed |
| 2 | 🔴 Critical | MVP auth bypass fallback paths removed | ✅ Fixed |
| 3 | 🟠 High | HTTP security headers added (CSP, HSTS, X-Frame-Options, etc.) | ✅ Fixed |
| 4 | 🟠 High | billing.json / billing-current.json removed + gitignored | ✅ Fixed |
| 5 | 🟠 High | Clerk plan ID moved to NEXT_PUBLIC_CLERK_PRO_PLAN_ID env var | ✅ Fixed |
| 6 | 🟠 High | Spoofable ?upgraded=true param replaced with Clerk state detection | ✅ Fixed |
| 7 | 🟡 Medium | Middleware inverted to default-protect all routes | ✅ Fixed |
| 8 | 🟡 Medium | Secure flag added to all cookies | ✅ Fixed |
| 9 | 🟡 Medium | PostHog privacy policy alignment documented | ✅ Fixed |
| 10 | 🟡 Medium | Malformed billing-current.json deleted | ✅ Fixed |
| 11 | 🔵 Low | audit.md populated with remediation log | ✅ Fixed |
| 12 | 🔵 Low | Mock OCSP certificate blob sanitized | ✅ Fixed |
| 13 | 🔵 Low | robots.ts and sitemap.ts exclude private routes | ✅ Fixed |

---

## Ongoing Recommendations

- **Rate limiting:** Current obfuscation is a deterrent, not absolute prevention. For production scale, migrate to server-side enforcement with Redis/Upstash.
- **Privacy policy:** Verify that scrubai.app/privacy explicitly discloses PostHog data collection (event types, file metadata, Core Web Vitals).
- **CSP tuning:** The current Content-Security-Policy allows `unsafe-inline` and `unsafe-eval` for compatibility. Tighten these as the app matures.
- **Git history:** Run `git filter-branch` or BFG Repo-Cleaner to remove billing.json from git history if the repo is public.
