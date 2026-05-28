# AU Astro AI — Full PRD, Jira Cards & Tech Team Brief
**Product:** Amar Ujala × AI Astrologer (Dr. Priya Verma)
**Version:** 1.0 | **Date:** May 2026 | **Owner:** Product / Growth

---

## 📌 Executive Summary

AU Astro AI is a cross-platform AI-powered astrology consultation feature embedded in the Amar Ujala ecosystem. A user on **Mobile Web (MWeb) gets 5 free minutes** per day. A user on the **Native App gets 10 free minutes** per day. The system uses **Deferred Deep Linking** to bridge sessions across platforms, **Agentic Memory** to persist chat history, and a **full analytics stack** (GA4 + CDP) to track every step of the user journey.

**Live Prototype (Vercel):** `[ATTACH VERCEL LINK]`
**GitHub Repo:** `[ATTACH GITHUB LINK]`
**Assets Folder:** `assets/` in repo root — `dr_priya_verma.png` + all background images

---

## 🏗️ Architecture Overview

```
MWeb (5 min/day) ──┐                    ┌── Native App (10 min/day)
                   └── AU Backend API ──┘
                              │
                      User Profile (AU_USER_ID)
                              │
                       ┌──────┴──────┐
                       │   AU CDP    │  ← All events, segments, traits
                       └──────┬──────┘
                              │
                     Agentic Memory Store
                  (chat history · minutes used
                   session timestamps · UTM)
```

---

# 📋 JIRA CARD 1 — Deferred Deep Linking & Cross-Platform Session Bridging

**Card ID:** AU-ASTRO-001
**Priority:** P0
**Assignee:** Mobile Engineering + Backend
**Epic:** Astro AI Core
**Linked Prototype:** `[VERCEL LINK]`

## Goal

When a MWeb user installs the native app (or already has it), they must land directly on the Astro AI section with session history intact — and their **remaining free time must transfer correctly** (e.g., used 2 min on web → app shows 8 min remaining).

---

## Detailed Flow

### Case 1 — App Already Installed (Standard Deep Link)

1. User on MWeb clicks the Astro AI banner
2. Browser checks: is app installed? (via URI scheme `amarujala://` or App Links / Universal Links)
3. **If YES** → Redirect immediately to:
   `amarujala://astro?utm_source=mweb_astro_banner&session_carry=true&au_user_id={AU_USER_ID}`
4. App opens directly on **Astro feed screen** (same as "Native App" tab in prototype)
5. Session minutes are fetched from AU Backend using `AU_USER_ID` — no duplicate time granted

### Case 2 — App NOT Installed (Deferred Deep Link)

1. User uses MWeb, spends X minutes (e.g., 2 min out of 5)
2. At **session end / time-up modal**, CTA shows: *"ऐप डाउनलोड करें — 10 मिनट पाएं रोज़!"*
3. CTA points to a **Branch.io / AppsFlyer** deferred deep link with payload:
   ```
   au_user_id:        {AU_USER_ID}
   minutes_used_web:  {seconds_used}
   utm_source:        mweb_astro_plg
   utm_campaign:      time_up_modal
   deep_link_target:  astro_home
   ```
4. User installs the app
5. On **first launch**, app SDK reads deferred payload:
   - `au_user_id` → links to existing profile
   - `minutes_used_web` → deducted from app's 10-min quota (120s used on web → 480s remaining)
   - `deep_link_target: astro_home` → lands directly on Astro AI screen (NOT app home)
6. **Welcome animation plays:**
   Stars fade in → Dr. Priya's avatar with pulsing rings → toast slides up:
   *"वापस आए! आपके 8 मिनट बाकी हैं आज के।"*

### Case 3 — User Returns to MWeb After Installing App

1. User has app installed, opens MWeb browser
2. Smart banner (iOS/Android native) OR JS-based prompt appears:
   *"ऐप में ज़्यादा सुविधा और 10 मिनट फ्री — अभी खोलें"*
3. On click → Universal Link / App Link opens app directly on the Astro section
4. No new session created — fetches remaining time from `AU_USER_ID` session record

---

## API Contracts Required

### `GET /api/astro/session-status`
```json
// Request
{ "au_user_id": "string", "platform": "mweb | app | desktop" }

// Response
{
  "minutes_total": 300,
  "seconds_used_today": 120,
  "seconds_remaining": 480,
  "session_date": "2026-05-28",
  "chat_history_id": "uuid",
  "is_returning": true
}
```

### `POST /api/astro/session-update`
```json
{
  "au_user_id": "string",
  "platform": "mweb | app",
  "seconds_used": 120,
  "session_id": "uuid"
}
```

---

## Acceptance Criteria

- [ ] Deep link opens Astro Home screen on fresh app install
- [ ] Minutes carry over correctly (web used → subtracted from app 10-min quota)
- [ ] Smart banner appears on MWeb for users with app already installed
- [ ] Deferred payload resolves within 5s on first app launch
- [ ] If `au_user_id` not found in deferred link → new profile created, full 10 min granted
- [ ] All platform transitions fire the `platform_switch` CDP event

---

# 📋 JIRA CARD 2 — Agentic Memory: Chat History & User Session Persistence

**Card ID:** AU-ASTRO-002
**Priority:** P0
**Assignee:** Backend + AI/ML Team
**Epic:** Astro AI Core
**Linked Prototype:** `[VERCEL LINK]` → Start/Resume Screen shows this state

## Goal

Every user's conversation with Dr. Priya must be stored and retrievable. The AI agent must "remember" previous sessions — what was discussed, what questions were asked, what predictions were made — creating a personalized, trust-building experience.

---

## Memory Architecture — DB Schema (`astro_user_memory`)

```json
{
  "au_user_id": "usr_12345",

  "profile": {
    "name": "Navya Sharma",
    "phone_hash": "sha256_hash",
    "dob": null,
    "rashi": null,
    "kundli_generated": false
  },

  "segments": {
    "platform_first_seen": "mweb",
    "platform_current": "app",
    "user_type": "guest | free | premium",
    "days_active": 4,
    "total_seconds_used": 720,
    "topics_discussed": ["career", "marriage", "finance"],
    "questions_asked_count": 12,
    "last_session_date": "2026-05-28",
    "referral_source": "news_article_astro_banner"
  },

  "sessions": [
    {
      "session_id": "sess_abc123",
      "date": "2026-05-27",
      "platform": "mweb",
      "seconds_used": 180,
      "messages": [
        { "role": "user", "text": "मेरी शादी कब होगी?", "ts": "2026-05-27T09:41:00Z" },
        { "role": "assistant", "text": "आपकी मीन राशि...", "ts": "2026-05-27T09:41:30Z" }
      ],
      "utm": {
        "source": "mweb_astro_banner",
        "medium": "organic",
        "campaign": "astro_launch_may26"
      }
    }
  ],

  "daily_quota": {
    "date": "2026-05-28",
    "platform": "app",
    "quota_seconds": 600,
    "used_seconds": 120,
    "remaining_seconds": 480
  }
}
```

---

## AI Context Injection

At the start of each new session, inject last N messages as system context:

```
System: You are Dr. Priya Verma, AI astrologer.
Previous context: User asked about marriage on 27 May.
You told them Feb-Mar 2027 is auspicious for Meen rashi.
Continue naturally. Do not repeat greetings if user has spoken before.
```

---

## Resume Screen Logic (→ Prototype: "Start/Resume Screen")

| State | Headline | Badge | CTA |
|---|---|---|---|
| New user, App | भविष्य के हर सवाल का जवाब... | 🕐 10:00 मिनट मुफ़्त | सेशन शुरू करें |
| New user, MWeb | भविष्य के हर सवाल का जवाब... | 🕐 5:00 मिनट मुफ़्त | सेशन शुरू करें |
| Returning, same day | वापस आए! डॉ. प्रिया इंतज़ार... | 🕐 X:XX मिनट बाकी हैं | सेशन जारी रखें |
| Returning, next day | डॉ. प्रिया इंतज़ार कर रही हैं | 🕐 Fresh quota | सेशन शुरू करें |

---

## Acceptance Criteria

- [ ] Chat history persisted in DB linked to `au_user_id`
- [ ] Session resumes with last 5 messages as AI context
- [ ] Daily quota resets at midnight IST
- [ ] Cross-platform quota sharing: web minutes deducted from app total
- [ ] Memory payload < 8KB per API call (trim old sessions beyond last 30 days)
- [ ] User can delete their own history (DPDP compliance)

---

# 📋 JIRA CARD 3 — Analytics: GA4 Events + CDP Event Schema

**Card ID:** AU-ASTRO-003
**Priority:** P1
**Assignee:** Analytics + Growth Engineering
**Epic:** Astro AI Analytics
**Linked Prototype:** `[VERCEL LINK]`

---

## GA4 Events

> **Rules:**
> - `event_name`: always `snake_case`
> - Single `param_name` key per event (to stay within GA4's 25-param limit)
> - `param_value` is always a dynamic string based on what happened

| # | event_name | param_name | param_value (examples) |
|---|---|---|---|
| 1 | `astro_banner_seen` | `context` | `mweb_feed_top` · `app_feed` · `desktop_banner` |
| 2 | `astro_banner_clicked` | `context` | `mweb_guest` · `app_free` · `desktop_guest` |
| 3 | `astro_login_started` | `method` | `phone_otp` · `google_sso` |
| 4 | `astro_login_success` | `method` | `phone_otp` · `google_sso` |
| 5 | `astro_session_start` | `context` | `mweb_new` · `app_new` · `mweb_resume` · `app_resume` |
| 6 | `astro_message_sent` | `topic` | `marriage` · `career` · `finance` · `health` · `general` |
| 7 | `astro_time_warning` | `context` | `4min_mweb` · `9min_app` |
| 8 | `astro_session_end` | `reason` | `user_ended` · `time_up_5min` · `time_up_10min` |
| 9 | `astro_plg_modal_seen` | `modal` | `5min_stop` · `10min_stop` · `welcome_back` |
| 10 | `astro_plg_cta_clicked` | `cta` | `download_app` · `subscribe_premium` · `continue_web` |
| 11 | `astro_feedback_submitted` | `rating` | `1` · `2` · `3` · `4` · `5` |
| 12 | `astro_app_install_intent` | `source` | `time_up_modal` · `mweb_smart_banner` · `plg_popup` |
| 13 | `astro_deep_link_resolved` | `type` | `deferred` · `direct` · `universal_link` |
| 14 | `platform_switch` | `direction` | `mweb_to_app` · `app_to_mweb` · `desktop_to_app` |
| 15 | `astro_push_received` | `segment` | `web_morning_5m` · `app_morning_10m` · `app_unused_nudge` |
| 16 | `astro_push_clicked` | `segment` | `web_morning_5m` · `app_morning_10m` · `app_unused_nudge` |
| 17 | `astro_notif_dismissed` | `segment` | `web_morning_5m` · `app_morning_10m` |
| 18 | `astro_session_expired` | `platform` | `mweb` · `app` · `desktop` |
| 19 | `astro_thank_you_seen` | `source` | `session_end` · `feedback_done` |
| 20 | `astro_share_intent` | `method` | `whatsapp` · `copy_link` · `other` |

---

## CDP Events — Full Metadata Schema

> Each event is **independent** with full properties for segmentation, automation, and retargeting.

### `Astro Session Started`
```json
{
  "event": "Astro Session Started",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T09:41:00+05:30",
  "properties": {
    "platform": "mweb | app | desktop",
    "session_type": "new | resume",
    "quota_seconds_total": 300,
    "quota_seconds_remaining": 300,
    "is_logged_in": true,
    "days_since_first_use": 0,
    "utm_source": "news_article_banner",
    "utm_medium": "organic",
    "utm_campaign": "astro_launch_may26",
    "referrer_url": "https://www.amarujala.com/astrology/daily-rashifal"
  }
}
```

### `Astro Message Sent`
```json
{
  "event": "Astro Message Sent",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T09:42:00+05:30",
  "properties": {
    "session_id": "sess_abc123",
    "message_index": 3,
    "topic_detected": "marriage | career | finance | health | general",
    "platform": "mweb",
    "seconds_used_in_session": 60,
    "seconds_remaining": 240
  }
}
```

### `Astro Time Warning Shown`
```json
{
  "event": "Astro Time Warning Shown",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T09:44:00+05:30",
  "properties": {
    "warning_type": "1_min_remaining",
    "platform": "mweb | app",
    "quota_trigger": "4min_of_5 | 9min_of_10",
    "seconds_remaining": 60
  }
}
```

### `Astro Session Ended`
```json
{
  "event": "Astro Session Ended",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T09:46:00+05:30",
  "properties": {
    "session_id": "sess_abc123",
    "platform": "mweb",
    "end_reason": "user_ended | time_up | browser_closed",
    "total_seconds_used": 180,
    "messages_exchanged": 6,
    "topics_covered": ["marriage", "career"],
    "plg_modal_shown": "stop_5min",
    "feedback_submitted": false
  }
}
```

### `PLG Modal Seen`
```json
{
  "event": "PLG Modal Seen",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T09:46:05+05:30",
  "properties": {
    "modal_type": "5min_stop | 10min_stop | welcome_back | 4min_warning | 9min_warning",
    "platform": "mweb | app | desktop",
    "session_id": "sess_abc123",
    "seconds_used": 300
  }
}
```

### `PLG CTA Clicked`
```json
{
  "event": "PLG CTA Clicked",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T09:46:10+05:30",
  "properties": {
    "cta_label": "download_app | subscribe_premium | come_back_tomorrow",
    "modal_source": "5min_stop | 10min_stop",
    "platform": "mweb",
    "deep_link_generated": true,
    "deep_link_provider": "branch | appsflyer",
    "campaign_tag": "plg_time_up_may26"
  }
}
```

### `Deferred Deep Link Resolved`
```json
{
  "event": "Deferred Deep Link Resolved",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T11:00:00+05:30",
  "properties": {
    "link_type": "deferred | direct | universal_link",
    "source_platform": "mweb",
    "target_screen": "astro_home",
    "minutes_carried_from_web": 2,
    "app_quota_remaining": 8,
    "install_time_delta_minutes": 47,
    "deep_link_provider": "branch | appsflyer",
    "utm_source": "mweb_astro_plg",
    "utm_campaign": "time_up_modal"
  }
}
```

### `Astro Push Received`
```json
{
  "event": "Astro Push Received",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T08:00:00+05:30",
  "properties": {
    "notification_id": "notif_xyz",
    "segment": "web_morning_5m | app_morning_10m | app_unused_nudge",
    "platform": "mweb | app",
    "title": "✨ शुभ प्रभात! आपके 5 मुफ़्त मिनट तैयार हैं",
    "quota_remaining_at_send": 300
  }
}
```

### `Platform Switch`
```json
{
  "event": "Platform Switch",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T10:30:00+05:30",
  "properties": {
    "from_platform": "mweb",
    "to_platform": "app",
    "switch_trigger": "plg_modal_download | smart_banner | deferred_link",
    "web_seconds_used_before_switch": 120,
    "app_quota_granted": 480
  }
}
```

### `Astro Feedback Submitted`
```json
{
  "event": "Astro Feedback Submitted",
  "au_user_id": "usr_12345",
  "timestamp": "2026-05-28T09:47:00+05:30",
  "properties": {
    "session_id": "sess_abc123",
    "rating": 5,
    "platform": "mweb",
    "messages_in_session": 6,
    "topics": ["marriage"],
    "time_to_feedback_seconds": 12
  }
}
```

---

## CDP User Segments (for MoEngage / CleverTap / Segment)

| Segment ID | Condition | Automated Action |
|---|---|---|
| `astro_new_mweb` | First visit · platform=mweb · no app installed | Show PLG app download prompt |
| `astro_lapsed_app` | App installed · no session in last 3 days | Push: *"10 min baaqi hain"* |
| `astro_heavy_user` | >5 sessions · >20 messages total | Upsell premium subscription |
| `astro_web_converter` | MWeb user who installed via deferred link | Onboarding welcome-back flow |
| `astro_quota_hit` | Hit time limit 2+ times in 7 days | Priority upsell carousel |
| `astro_topic_marriage` | Discussed marriage in any session | Marriage horoscope push |
| `astro_topic_career` | Discussed career in any session | Career horoscope push |

---

# 📧 Tech Team Email

```
To:  tech@amarujala.com, mobile-engineering@amarujala.com, analytics@amarujala.com
CC:  product@amarujala.com, growth@amarujala.com

Subject: [Action Required] AU Astro AI — Implementation Brief: Deep Linking,
         Agentic Memory & Analytics
```

---

Team,

We are launching **AU Astro AI** — an AI-powered astrology consultation feature built into the Amar Ujala product. The full interactive prototype is live and ready for review.

This mail covers implementation requirements across three workstreams. Please go through, assign owners, and share estimates by EOD this week.

---

**🔗 Resources (attach before sending)**

| Resource | Link |
|---|---|
| Live Prototype (Vercel) | `[ATTACH]` — Test MWeb · App · Desktop Web flows |
| GitHub Repo | `[ATTACH]` — Full source code |
| Assets Folder | `/assets/` in repo — `dr_priya_verma.png` · backgrounds |
| Design Reference | Use prototype for exact animations, timing, text, modals |

---

**📋 Workstream 1 — Deferred Deep Linking** *(Mobile Eng + Backend)*

We need deferred deep linking so MWeb users who install the app land directly on the Astro screen with their session state (minutes used + user ID) carried over.

Requirements:
- Use **Branch.io or AppsFlyer** for deferred link generation
- Payload: `au_user_id`, `minutes_used_web`, `utm_source`, `deep_link_target`
- On first app launch → resolve payload → deduct web minutes from 10-min app quota
- Smart banner on MWeb for users who already have the app
- Universal Links (iOS) + App Links (Android) for instant opens
- Fire `platform_switch` + `astro_deep_link_resolved` CDP events on all transitions

APIs needed: `GET /api/astro/session-status` and `POST /api/astro/session-update`
Full API schema is in the attached PRD.

**→ Jira: AU-ASTRO-001**

---

**💾 Workstream 2 — Agentic Memory & Chat Persistence** *(Backend + AI/ML)*

Chat history must persist per `au_user_id` and be injected as context into each new session so Dr. Priya "remembers" the user.

Requirements:
- DB schema linked to `au_user_id` (full schema in PRD)
- Daily quota resets at midnight IST (5 min MWeb / 10 min App)
- Cross-platform minute transfer: web minutes deducted from app quota
- Resume screen shows real-time remaining minutes from backend
- AI context injection: last 5 messages as system prompt on session start
- DPDP compliant: user can delete their data

**→ Jira: AU-ASTRO-002**

---

**📊 Workstream 3 — Analytics: GA4 + CDP** *(Analytics Engineering)*

Full event tracking across the entire user journey — from banner impression to session end to app install.

GA4 (20 events total):
- All use single `param_name` + dynamic `param_value` format
- Covers: session lifecycle · PLG funnel · deep link · push notifications

CDP (10 core events with full metadata):
- Enables push automation, retargeting, upsell, lapsed-user flows
- 7 user segments pre-defined and ready for MoEngage/CleverTap rules
- Full event schemas in PRD

**→ Jira: AU-ASTRO-003**

---

**⏰ What we need from you**

Please share time estimates for:
1. Deep linking SDK integration + API build
2. Chat DB schema + AI context injection endpoint
3. GA4 implementation + CDP event pipeline

Happy to do a 30-min live walkthrough of the prototype with your team — just reply and we'll schedule.

Best,
**[Your Name]**
Product, Amar Ujala

> *Full API contracts, DB schemas, event tables, acceptance criteria, and UTM taxonomy are in the PRD attached above.*

---

## 🔍 UTM Taxonomy

| Parameter | Values |
|---|---|
| `utm_source` | `mweb_astro_banner` · `app_push_morning` · `app_push_unused` · `web_desktop_banner` · `deferred_deeplink` |
| `utm_medium` | `organic` · `push` · `in_app` · `smart_banner` · `plg_modal` |
| `utm_campaign` | `astro_launch_may26` · `time_up_modal` · `daily_quota_nudge` · `lapsed_user_win_back` |
| `utm_content` | `yellow_cta` · `top_banner` · `mid_article` · `session_end_modal` |
| `utm_term` | `marriage` · `career` · `finance` · `health` *(topic at time of click)* |
