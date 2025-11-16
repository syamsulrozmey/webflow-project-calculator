## Landing Page Plan

1. **Navigation (ui-landing-6)**
   - Sticky top bar with logo placeholder + links (`Features`, `How it works`, `Testimonials`, `Pricing`), CTA button "Calculate a project".

2. **Hero (ui-landing-3)**
   - Headline/subheadline describing dual-flow estimator.
   - Two CTAs (Fresh Project, Existing Site) using shadcn buttons.
   - Visual: screenshot placeholder or gradient card summarizing features.

3. **Feature Highlights (ui-landing-4)**
   - Three cards: Deterministic Engine, Crawler Intelligence, Professional Outputs.
   - Include icons from lucide-react.
   - Secondary bullet list for differentiators (PRD Section 4.4-4.8).

4. **Social Proof (ui-landing-5)**
   - Quote carousel or grid with placeholder testimonials for freelancers/agencies/companies.
   - Add trust badges row.

5. **Workflow Steps**
   - Show the two entry flows (Fresh Project vs Existing Site) with steps referencing PRD Flow sections.

6. **Pricing / Call to Action**
   - Outline Free vs Pro (Freemium plan).
   - CTA button linking to calculator flow.

7. **Footer (ui-landing-7)**
   - Documentation links (PRD, tasks), placeholder legal links, social icons.

8. **SEO (ui-landing-8)**
   - Add metadata in `layout.tsx` (title/description updated already).
   - For hero, include structured content for keywords “Webflow cost calculator”.

### Component Breakdown

- `NavBar`, `Hero`, `FeatureGrid`, `WorkflowSteps`, `Testimonials`, `PricingCTA`, `Footer`.
- Shared utilities live under `src/components/landing/`.

### Styling Notes

- Use Tailwind + shadcn primitives (Card, Button).
- Background gradient similar to hero placeholder already in place.
- Use responsive grid (1 column mobile, 2+ for desktop).

