# Fitness Product Brief

## Product vision

This product is a private, personal fitness operating system for a gym-goer who wants to improve training, nutrition, and progress without a noisy social platform or fake premium upsell. The app should help a user:

- create a fitness profile and goals
- receive a sensible workout plan
- log training sessions and review progress
- manage nutrition and daily intake targets
- track body measurements and record trends
- ask an AI fitness assistant general training and nutrition questions
- participate in optional private challenges and personal check-ins

The experience should feel like a grounded personal training dashboard: calm, honest, and action-oriented.

## Core user journey

1. Sign up and complete a fitness profile
   - goal(s)
   - training experience
   - preferred equipment and workout style
   - lifestyle notes needed for planning

2. Review a personalized workout plan
   - plan is generated from user profile and goals
   - sessions can be scheduled by day
   - exercises can be customized without losing the plan structure

3. Train and log workouts
   - log completed sessions with actual data
   - record sets, reps, and weight when applicable
   - keep planned sessions distinct from completed logs

4. Track nutrition and health inputs
   - log meals and macro-ish totals for the day
   - set intake targets
   - compare recent intake windows honestly over time

5. Review progress and trends
   - body measurements and recent windows
   - personal records derived from logged workouts only
   - rolling seven-day summary of activity and nutrition

6. Get support
   - AI fitness assistant for general training and nutrition questions, with health disclaimers

## Product goals

- keep the app useful for everyday fitness tracking
- make all totals based on actual user-entered data
- avoid invented metrics, fake availability, and unsupported premium claims
- respect the user's privacy and keep social mechanics opt-in
- support a single coherent fitness loop without overbuilding unrelated features

## Functional scope

### 1. Profile and onboarding
- fitness profile form
- primary fitness goals
- experience level and preferences
- optional body/health context, collected only as needed

### 2. Workout planning
- goal-based workout templates
- exercise library and plan assembly
- assigned workout days and session scheduling
- exercise customization and overrides

### 3. Workout logging
- log completed sessions
- capture exercise details and performance data
- show personal records from real saved logs
- separate planned sessions from completed workouts

### 4. Nutrition tracking
- intake logging for meals and foods
- daily calorie/protein-style summaries
- intake targets and recent-window comparisons
- seven-day activity/nutrition summaries

### 5. Progress and analytics
- training activity timeline
- measurement history and recent comparisons
- progress summaries for today and rolling windows

### 6. Support
- AI fitness assistant with health disclaimers
- optionally private challenges without public social ranking pressure

## Non-goals and guardrails

- no fake subscriptions or premium pricing structure unless explicitly requested later
- no fabricated coach availability, medical claims, or guaranteed outcomes
- no public leaderboard competition as the default path
- no estimates presented as fact where real user data is absent
- no unsupported claims about live integrations beyond what the app actually performs

## Product principles

- Honest data over inferred metrics
- Privacy by default; opt-in sharing only
- Personal fitness over social pressure
- Clear distinctions between planned, completed, and target metrics
- Calm design and trustworthy UX

## Release stages

### Phase 1: core fitness loop
- profile
- dashboard
- plan generation
- workout logging
- nutrition tracking
- progress summaries

### Phase 2: support
- AI fitness assistant
- AI meal ideas

### Phase 3: habits and personal accountability
- weekly scheduling
- seven-day summaries
- personal records
- private challenges

## Implementation ticket roadmap

The detailed, step-by-step engineering tickets live in the [todos/README.md](./todos/README.md) roadmap and the files in [todos/](./todos/).

The current roadmap is organized as incremental tickets such as:

- FIT-001: product landing page
- FIT-002: fitness profile and goals
- FIT-003: authenticated dashboard
- FIT-004: workout plans
- FIT-005: workout progress
- FIT-006: nutrition tracking
- FIT-007: meal generation
- FIT-008: body analysis
- FIT-012: private opt-in fitness challenges
- FIT-014: personal records
- FIT-015: today overview
- FIT-016: rolling training activity
- FIT-017: weekly workout schedule
- FIT-018: workout customization
- FIT-019: measurement window comparisons
- FIT-020: seven-day nutrition summary
- FIT-021: log a completed planned session

## Success criteria

The product is successful when a new user can:

- set up a profile in under a few minutes
- see a usable workout plan immediately
- log a completed session without confusion
- review nutrition and progress in a single place
- use the app as a self-contained training dashboard without needing social features to be valuable

This is the current target product definition for the repository and is the basis for the work tracked in [todos/](./todos/).

## Confirmed payment decision

The product owner has explicitly requested real Dodo Payments billing: Premium
costs USD 20/month and includes unlimited photo uploads and all existing fitness
features without usage quotas. Products are provisioned dynamically. Premium
upload access is checked by the server. Other existing fitness features retain
their free access until specific free-plan limits are agreed. Test and live
billing records are separate; only verified provider state grants paid access.

The coach directory, coach applications, and paid coach consultations were
removed at the owner's request for this stage. Past consultation purchases stay
readable in the database but grant nothing. Nearby gym search and the
equipment guide (including the AI exercise explainer) were also removed.
