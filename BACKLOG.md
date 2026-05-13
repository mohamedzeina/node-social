# Dispatches — Feature Backlog

A prioritised list of features that would turn this from a "tutorial app with posts" into a real social product. Tier 1 is what's needed for the app to feel social *at all*. Lower tiers are amplifiers.

Each item is tagged:
- **[UI]** — frontend only, no backend changes
- **[BE]** — backend changes required (GraphQL schema + resolvers + Mongo model)
- **[UI+BE]** — both

---

## Tier 1 — Core social interactions (essential)

These are the features that make the difference between "a CMS where multiple users post" and "a social app." Without these, there is no social interaction.

1. **Likes** **[UI+BE]**
   Persisted likes on posts. Show count, who liked. Replace the local-state heart toggle currently in the Post card. Needs a `Like` collection (or `likes: [userId]` on Post), `likePost`/`unlikePost` mutations, and `getPost.likes`/`likedByMe` fields.

2. **Comments / replies** **[UI+BE]**
   Threaded or flat comments under posts. Comment composer on SinglePost. Comment count badge on the feed card. Needs a `Comment` model, `addComment`/`deleteComment` mutations, `getPost.comments`.

3. **Follow / following** **[UI+BE]**
   Users can follow other users. Powers the "Following" feed filter. Needs `User.following` + `User.followers` arrays (or a `Follow` collection), `followUser`/`unfollowUser` mutations.

4. **Feed filter: For You / Following** **[UI+BE]**
   Tab toggle at the top of the feed. "Following" returns only posts from users you follow. Needs `getPosts` to accept a `feedType` arg.

---

## Tier 2 — Identity & discoverability

Now that interactions exist, users need a way to *find* and *learn about* each other.

5. **User profile page** **[UI+BE]**
   `/u/:username` showing the user's avatar, bio, follower/following count, and their posts. Needs `getUser(id|username)` query + a username field (or use `_id` in URLs).

6. **Avatar upload** **[UI+BE]**
   Replace the initial-letter circle with a real uploaded image (using your existing Cloudinary integration). Currently `User` has no `avatarUrl` field — needs adding.

7. **Bio (expose the existing `status` field)** **[UI+BE]**
   Surface the existing status field as a bio on profiles + post bylines. Tiny backend change: include `status` in `creator { … }` projections.

8. **Search** **[UI+BE]**
   Find users by name and posts by title/content. Needs `searchUsers(query)` + `searchPosts(query)` queries (text indexes on Mongo).

---

## Tier 3 — Engagement amplifiers

Optional but high-impact for retention and time-on-app.

9. **Notifications** **[UI+BE]**
   Bell icon in the toolbar with a count; dropdown panel of recent activity (someone liked / commented / followed you). Socket.io is already wired in your backend — perfect for real-time delivery.

10. **Bookmarks / saves** **[UI+BE]**
    Save a post to read later. Saved tab on profile. Needs `User.bookmarks` array or `Bookmark` collection, `bookmarkPost`/`unbookmarkPost` mutations.

11. **Hashtags** **[UI+BE]**
    Parse `#word` in post content, link to a tag page (`/t/coffee`) that lists all posts using that tag. Cheap and dramatically increases discoverability.

12. **Mentions** **[UI+BE]**
    `@username` in post/comment content links to a profile and (optionally) creates a notification.

13. **Reposts / shares** **[UI+BE]**
    Share someone else's post into your feed. Two flavours: pure repost vs. quote-repost. Needs `Post.repostOf` reference.

---

## Tier 4 — Quality of life

Things that don't change the social mechanic but make the app feel finished.

14. **Multiple images per post** **[UI+BE]**
    Currently capped at one. Allow a carousel/grid of up to 4. `Post.imageUrls: [String]`.

15. **Dark mode** **[UI]**
    Toggle in toolbar; preference stored in `localStorage`. Add dark CSS variables; flip `[data-theme]` on the root.

16. **Toast notifications** **[UI]**
    Non-blocking success/error toasts (post published, comment failed, etc.) — replace the current error modal for routine cases.

17. **Drafts** **[UI+BE]**
    Save a post draft and finish later. `Post.status: 'draft' | 'published'`.

18. **Settings page** **[UI+BE]**
    `/settings` — change password, email, name, avatar, bio. Account deletion.

19. **Better empty / loading / error states** **[UI]**
    Skeleton loaders in the feed instead of a spinner. Better "no posts" copy. Friendly error pages.

---

## Tier 5 — Polish & longer-term

20. **Onboarding flow** **[UI+BE]** — first sign-in walkthrough; pick a few users to follow.
21. **Trending / explore page** **[UI+BE]** — discover popular posts and tags.
22. **Direct messages** **[UI+BE]** — 1-on-1 chat (large undertaking).
23. **Block / mute / report** **[UI+BE]** — moderation primitives.
24. **Edit history** **[UI+BE]** — show "(edited)" badge on revised posts.
25. **Accessibility pass** **[UI]** — keyboard nav, focus traps in modal, screen-reader audit.
26. **Mobile bottom nav** **[UI]** — proper mobile-first navigation pattern.

---

## How we'll work through this

- Pick one feature at a time.
- Build it component-by-component, **one commit per component**, same cadence as the redesign.
- For **[UI+BE]** items: I'll either propose the backend schema change first and you approve, or you can specify exactly what you want changed.
- We can pause to revisit/polish anything that doesn't feel right after we ship it.
