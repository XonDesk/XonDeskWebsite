---
layout: ../layouts/MarkdownLayout.astro
title: Poster Magic Privacy Policy
lastUpdated: October 2, 2026
---

# Privacy Policy

**Effective date:** November 6, 2026

Sunbreak LLC ("we", "us", "our") makes the Poster Magic app for iPhone and iPad. This policy explains what information Poster Magic collects, how it is collected, what we use it for, who we share it with, how long we keep it, and how you can delete it or change your mind.

If you have any question about it, email **[xondesk@outlook.com](mailto:xondesk@outlook.com)**.

## 1. The short version

- To turn a poster into a calendar event, we send the poster photo and the text read from it to Google's Gemini AI. We do not keep the photo. Google does not use it to train its models.
- Events you **choose to share** become part of a public event collection. Other people see only a scrambled identifier, never your name or email. We can link a shared event to your account to review reports and act on content that breaks our Terms.
- Your scan history stays on your device.
- We show ads, but we ask our ad network for **non-personalized** ads only. We do not sell your personal information.
- You can delete your account, and the data tied to it, from inside the app at any time.

## 2. Information we collect

### Account information
To use Poster Magic you sign in with Apple, Google, or an email address and password. We receive your **email address** (or Apple's private relay address if you choose "Hide My Email") and an account ID from Google Firebase Authentication.

We keep a profile for your account that holds your email address, account ID, the date you signed up, your scan allowance and how much of it you have used, your subscription status, bonus scans earned from rewarded ads, your app settings, when you accepted our Terms of Service, the people you have blocked, the scrambled identifier attached to events you share, and any record of moderation action taken on your account.

### Poster photos and scanned text
When you scan a poster, the app first reads its text **on your device** using Apple's built-in text recognition. It then sends the photo and that text to our server, which passes them to **Google's Gemini AI** to extract the event details (title, date, time, place and so on). The results are sent back to your device.

- We **do not store** your poster photos on our servers. They exist on our server only while the request is being processed.
- We use Gemini under Google's paid service terms, under which Google **does not use** prompts, images or responses to improve its products. Google keeps them for a limited period solely to detect abuse of its service.
- Some devices with Apple Intelligence suggest event tags using Apple's on-device model. That processing never leaves your device.

### Events you choose to share
When you save an event, you choose between **"Slide to Save Event"**, which adds it to your calendar *and* shares it publicly, and **"Add to Calendar"**, which keeps it private. If you share, we store the event's details in our public event collection: title, description, location, dates and times, recurrence, website, organizer, QR code links, tags, social media handle, the text read from the poster, and the time zone.

To prepare a shared event we also:
- convert the location text into map coordinates using **Google's Geocoding service**;
- check the text against content rules using **OpenAI's moderation service**, and hold anything flagged for review; and
- create a numeric "fingerprint" of the text with Gemini so we can recognise duplicate events.

A shared event carries a scrambled version of your account ID, so other users can't trace it back to your name or email. We keep a link from that identifier to your account, so that when an event is reported or held for review we can see who shared it and, if it breaks our Terms, add a strike or stop the account from sharing. Shared events may be shown to other people using Poster Magic.

### Reports and blocks
If you report an event, we record the event, your reason and your account ID so we can review it. If you block another person, we store that on your profile.

### Purchases
Subscriptions and scan packs are sold by Apple. **We never receive your payment card details.** We use **RevenueCat** to manage purchases. RevenueCat receives your account ID and the purchase records Apple provides (product, date, renewal and expiry) so it can tell the app which features you have paid for. We keep your current subscription status on your profile.

### Advertising
Free accounts see ads served by **Google AdMob**. The app asks AdMob for **non-personalized ads only**, meaning ads are not chosen based on a profile of your interests. iOS asks for your permission before the app may use your device's advertising identifier; you can say no, and you can change your answer at any time in **Settings → Privacy & Security → Tracking**. To deliver and measure ads and prevent fraud, AdMob may still receive device information, your IP address (and an approximate location derived from it) and how you interact with ads. If you watch a rewarded ad for a bonus scan, AdMob tells our server your account ID so we can credit the reward.

### Diagnostics and usage
- **Crash and error reports (Sentry).** When the app crashes or hits an error, it sends a report containing technical details (device model, iOS version, app version, what the app was doing) along with your account ID and email address, so we can find and fix the problem for you. Screenshots are never attached.
- **Usage statistics (Google Analytics for Firebase).** We record basic events, such as sign-ups, sign-ins and scans, with an app-installation identifier and your account ID, to understand how the app is used.
- **App integrity (Firebase App Check with Apple App Attest).** The app proves to our server that it is a genuine copy running on a real Apple device. This uses device attestation data, not personal information.
- **Feedback.** If you send feedback, we receive your message and, if you choose to give them, your name and email. Feedback is delivered to us through Sentry.

### Permissions on your device
The app asks for access only when you use a feature that needs it, and you can change these at any time in iOS Settings.
- **Camera** and **Photos**, to scan posters and, if you turn the setting on, save the poster to a "Poster Magic" album.
- **Calendar**, to add the events you choose. We do not read your other calendar entries or send them anywhere.
- **Location**, only if you use a feature that shows events near you. Your location is used to look up nearby events and is not stored on our servers.

### Stored only on your device
Your scan history, saved poster images and calendar files stay on your device. We never receive them.

## 3. How we use information

We use the information above only to:
- provide the app: sign you in, scan posters, add events to your calendar, and run the public event collection;
- manage your subscription, scan allowance and rewards;
- keep the service safe: moderate shared content, act on reports, and prevent fraud and abuse;
- find and fix bugs, and understand how the app is used so we can improve it; and
- show non-personalized ads to free users.

We do not use your information for marketing email, and **we do not sell or rent your personal information**, or share it for targeted advertising.

## 4. Who we share it with

We share information only with the service providers that run parts of Poster Magic for us, and only for the purposes above. Each one is bound by its own terms to protect your information to a standard at least as protective as this policy.

| Provider | What it does for us | Their privacy policy |
| :--- | :--- | :--- |
| Google Firebase | Sign-in, account database, server functions, usage statistics, app integrity checks | [policies.google.com/privacy](https://policies.google.com/privacy) |
| Google Gemini API | Reading event details from poster photos | [Gemini API terms](https://ai.google.dev/gemini-api/terms) |
| Google Maps Platform | Turning event locations into map coordinates | [policies.google.com/privacy](https://policies.google.com/privacy) |
| Google AdMob | Showing ads to free users | [policies.google.com/technologies/ads](https://policies.google.com/technologies/ads) |
| Supabase | Hosting the public event collection and reports | [supabase.com/privacy](https://supabase.com/privacy) |
| OpenAI | Checking shared events against content rules | [openai.com/policies/privacy-policy](https://openai.com/policies/privacy-policy) |
| RevenueCat | Managing subscriptions and purchases | [revenuecat.com/privacy](https://www.revenuecat.com/privacy) |
| Sentry | Crash and error reports, and feedback | [sentry.io/privacy](https://sentry.io/privacy/) |
| Apple | Sign in with Apple, purchases, app integrity checks | [apple.com/legal/privacy](https://www.apple.com/legal/privacy/) |

We may also disclose information if required by law, to protect the safety of our users or others, or as part of a sale or merger of our business (in which case this policy would continue to apply to your information).

## 5. How long we keep it

- **Account and profile:** until you delete your account.
- **Poster photos:** not stored by us. Google keeps Gemini requests for a limited period for abuse detection only.
- **Shared events:** while they are part of the public collection, or until you delete your account (see below).
- **Reports:** for as long as needed to review them and keep the service safe.
- **Moderation records** (what we did about a reported or held event, and why): for as long as needed to keep the service safe. If you delete your account, they are kept without the link to you.
- **Crash reports and usage statistics:** automatically deleted after the retention period set in Sentry and Google Analytics, at most 14 months.
- **Purchase records:** for as long as the law requires for tax and accounting.

## 6. Deleting your data and changing your mind

- **Delete your account in the app:** open **Settings → Delete Account**. This permanently deletes your sign-in account and profile, deletes the shared events that only you contributed, and removes your link to shared events that other people also contributed. Your scan history is on your device and is removed when you delete the app.
- **Delete by email:** if you can't use the app, email **[xondesk@outlook.com](mailto:xondesk@outlook.com)** with the subject "Account Deletion Request" from the address on your account. We will also delete your purchase history held by RevenueCat on request.
- **Subscriptions:** deleting your account does not cancel an App Store subscription. Cancel it in **Settings → [your name] → Subscriptions**.
- **Withdraw permissions:** turn off camera, photo, calendar, location or tracking access at any time in iOS Settings. If you used Sign in with Apple you can stop using it in **Settings → [your name] → Sign-In & Security → Sign in with Apple**.

## 7. Your privacy rights

Depending on where you live (for example the European Economic Area, the United Kingdom, or a US state such as California or Washington), you may have the right to:
- **access** the personal information we hold about you and get a copy of it;
- **correct** it;
- **delete** it;
- **object to** or **restrict** how we use it;
- **withdraw consent** where we rely on it; and
- **not be treated differently** for exercising these rights.

Email **[xondesk@outlook.com](mailto:xondesk@outlook.com)** to make a request. We will respond within the time the law requires, usually 30 days. You may also complain to your local data protection authority.

**Legal bases (EEA and UK users).** We process your information to provide the service you signed up for (contract); to keep the service secure, fix bugs and improve it (our legitimate interests); where you have given permission, such as for device access or tracking (consent); and to meet legal obligations.

## 8. Security

Information sent between the app and our servers is encrypted in transit (HTTPS/TLS), and our providers encrypt stored data. Access to our systems is limited to what is needed to run Poster Magic. No system is perfectly secure, but we take reasonable steps to protect your information.

## 9. International transfers

Poster Magic is operated from the United States, and our providers process information in the United States and other countries. Where the law requires it, transfers are protected by safeguards such as the European Commission's Standard Contractual Clauses.

## 10. Children

Poster Magic is not intended for children under 13 (or the minimum age required where you live), and we do not knowingly collect their personal information. If you believe a child has given us personal information, contact us and we will delete it.

## 11. Changes to this policy

If we change this policy we will update the date at the top. If a change is significant, we will also tell you in the app before it takes effect.

## 12. Contact us

**Sunbreak LLC**
Seattle, Washington, United States
Email: **[xondesk@outlook.com](mailto:xondesk@outlook.com)**

Our Terms of Service are at [xondesk.com/poster-magic-eula](/poster-magic-eula/).
