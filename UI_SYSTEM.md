# UI System — Codexible (v1)

## 1) Tokens

### Colors (conceptual)
- `bg.base`
- `bg.surface`
- `text.primary`
- `text.secondary`
- `accent.primary`
- `border.muted`
- `state.success / warning / danger`

### Radius
- sm: 8px
- md: 12px
- lg: 16px

### Shadow
- sm: subtle card lift
- md: modal elevation

### Spacing
- scale: 4, 8, 12, 16, 24, 32, 48, 64

## 2) Core Components

### Button
Variants:
- primary
- secondary
- ghost
States:
- default / hover / active / disabled / focus-visible

### Card
Variants:
- feature
- metric
- pricing
Rules:
- same border + radius language
- consistent header/body/footer spacing

### Modal (Install)
Rules:
- title, description, snippet area, copy action, close action
- consistent padding and typography hierarchy
- explicit success feedback after copy

### Section Container
Rules:
- max-width fixed
- responsive horizontal padding
- consistent section vertical spacing

## 3) Layout Rules
- Header sticky with subtle backdrop blur
- Hero max text width for readability
- Grid collapse behavior:
  - desktop 3-col
  - tablet 2-col
  - mobile 1-col

## 4) Content Rules
- Headline <= 2 lines
- Feature card title <= 1 line preferred
- Paragraphs concise (2–4 lines)

## 5) QA Checklist
- [ ] CTA visible in first viewport
- [ ] Color contrast readable
- [ ] Keyboard navigation works in modal
- [ ] Spacing is consistent across sections
- [ ] Card/button styles are visually consistent
