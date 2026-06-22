# Legal Checklist for Flux

## Pre-Launch Requirements

### Privacy Policy (GDPR Art. 13-14)
- [ ] What data we collect (email, IP, user-agent, click data, referrer)
- [ ] Why we collect it (service operation, analytics, abuse prevention)
- [ ] Legal basis (consent, legitimate interest, contract performance)
- [ ] Data retention periods (clicks: 24mo, links: until deleted, accounts: until closed)
- [ ] Data processors (Postgres/RDS, Redis/Upstash, hosting provider)
- [ ] Third-party data sharing (Google Web Risk, MaxMind GeoIP)
- [ ] User rights (access, rectification, erasure, portability, objection)
- [ ] Cookie/tracking notice
- [ ] Contact for privacy inquiries

### Terms of Service
- [ ] Account terms (registration, security, API key responsibility)
- [ ] Acceptable use (no spam, no malware, no phishing)
- [ ] Prohibited content list
- [ ] Rate limits and fair use policy
- [ ] Abuse reporting mechanism (abuse@flux.app)
- [ ] Service availability (no SLA on free tier)
- [ ] Limitation of liability
- [ ] Termination rights (immediate for abuse)

### Data Processing Agreement (DPA)
- [ ] Required for enterprise customers
- [ ] Covers GDPR Art. 28 requirements
- [ ] Sub-processor list
- [ ] Data breach notification procedure
- [ ] Return/deletion of data on contract end

## Enterprise Compliance (Phased)

### SOC 2 Type II Readiness

Budget: $30-50k | Timeline: 6 months | Auditor: A-LIGN or similar

#### Trust Services Criteria Coverage

| Criteria | Flux Status | Gap |
|---|---|---|
| CC1: Control Environment | Security policies need formal documentation | Draft exists in LEGAL.md |
| CC2: Communication | Incident response plan documented | Needs formal policy |
| CC3: Risk Assessment | Risk register | Not started |
| CC4: Monitoring | Audit logs implemented | Needs quarterly review process |
| CC5: Control Activities | Change management via git | Needs formal approval flow |
| CC6: Logical & Physical Access | JWT + API keys + rate limiting | Needs MFA enforcement |
| CC7: System Operations | Monitoring via health endpoint | Needs formal runbook |
| CC8: Change Management | Prisma migrations + git | Needs peer review policy |
| CC9: Risk Mitigation | Abuse prevention in place | Formal vendor review needed |

#### Prerequisites
- [ ] **Incident response policy** — template exists, needs review
- [ ] **Change management process** — use git + PRs, formalize approvals
- [ ] **Access control policy** — JWT auth, API key scopes — needs MFA
- [ ] **Vendor management program** — list sub-processors (Postgres, Redis, hosting)
- [ ] **Data classification policy** — define public/internal/confidential/PII
- [ ] **Business continuity plan** — multi-region failover plan
- [ ] **Security awareness training** — annual training for team
- [ ] **Penetration testing** — annual third-party pen test
- [ ] **Encryption at rest** — Postgres RDS encryption enabled
- [ ] **Encryption in transit** — TLS 1.2+ enforced
- [ ] **Password policy** — bcrypt(12), min 8 chars
- [ ] **Session management** — JWT with expiration, refresh tokens
- [ ] **Data backup** — automated daily Postgres backups
- [ ] **Logging & monitoring** — audit logs, health endpoint, uptime monitoring

### HIPAA (if targeting healthcare)
- [ ] BAA templates ready
- [ ] Audit logging (implemented — AuditLog model)
- [ ] Access controls (implemented — roles, API keys)
- [ ] Encryption at rest (Postgres RDS encryption)
- [ ] Encryption in transit (TLS everywhere)
- [ ] Unique user identification (implemented — User model)
- [ ] Emergency access procedure (needs documentation)
- [ ] Automatic logoff (needs session timeout)
