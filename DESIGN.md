# Design System Guide

## Project: EntranceGateway CMS
**Purpose:** Brand identity reference for consistent UI implementation  
**Version:** 1.0  
**Last Updated:** February 2026

---

## 🎨 Color System

### Primary Brand Colors

#### Deep Navy
- **Purpose**: Primary brand color, headers, CTAs, key UI elements
- **HEX**: `#0A1551`
- **RGB**: `10, 21, 81`
- **HSL**: `234°, 78%, 18%`
- **CMYK**: `88, 74, 0, 68`
- **Text Color**: White (`#FFFFFF`)
- **Contrast Ratio**: 14.5:1 (AAA)
- **Usage**: Primary buttons, navigation headers, hero sections, main CTAs

#### Trustworthy Blue
- **Purpose**: Links, interactive elements, secondary buttons, accents
- **HEX**: `#0662C7`
- **RGB**: `6, 98, 199`
- **HSL**: `211°, 94%, 40%`
- **CMYK**: `97, 51, 0, 22`
- **Text Color**: White (`#FFFFFF`)
- **Contrast Ratio**: 5.2:1 (AA)
- **Usage**: Hyperlinks, secondary buttons, hover states, interactive icons

#### Academic Gold
- **Purpose**: Highlights, achievements, premium features, awards
- **HEX**: `#FFC700`
- **RGB**: `255, 199, 0`
- **HSL**: `47°, 100%, 50%`
- **CMYK**: `0, 22, 100, 0`
- **Text Color**: Deep Navy (`#0A1551`)
- **Contrast Ratio**: 10.8:1 (AAA)
- **Usage**: Achievement badges, premium indicators, special highlights, call-outs (use sparingly)

---

### Semantic Colors

#### Success Green
- **Purpose**: Success messages, confirmations, positive states
- **HEX**: `#2D7A3E`
- **RGB**: `45, 122, 62`
- **HSL**: `133°, 46%, 33%`
- **CMYK**: `63, 0, 49, 52`
- **Text Color**: White (`#FFFFFF`)
- **Contrast Ratio**: 7.1:1 (AAA)
- **Usage**: Success toasts, checkmarks, completed states, positive feedback

#### Warning Amber
- **Purpose**: Warnings, cautionary messages, pending states
- **HEX**: `#F39237`
- **RGB**: `243, 146, 55`
- **HSL**: `29°, 88%, 58%`
- **CMYK**: `0, 40, 77, 5`
- **Text Color**: Deep Navy (`#0A1551`)
- **Contrast Ratio**: 4.9:1 (AA)
- **Usage**: Warning alerts, pending actions, cautionary notices, attention-needed states

#### Error Red
- **Purpose**: Error messages, destructive actions, critical alerts
- **HEX**: `#D32F2F`
- **RGB**: `211, 47, 47`
- **HSL**: `0°, 66%, 51%`
- **CMYK**: `0, 78, 78, 17`
- **Text Color**: White (`#FFFFFF`)
- **Contrast Ratio**: 5.6:1 (AA)
- **Usage**: Error messages, delete actions, critical alerts, validation errors

---

### Neutral Grayscale

| Shade | HEX | RGB | Usage |
|-------|-----|-----|-------|
| 50 | `#FAFAFA` | `250, 250, 250` | Lightest backgrounds, subtle fills, page backgrounds |
| 100 | `#F5F5F5` | `245, 245, 245` | Light backgrounds, card backgrounds, sections |
| 200 | `#EEEEEE` | `238, 238, 238` | Borders, dividers (light mode), separators |
| 300 | `#E0E0E0` | `224, 224, 224` | Disabled states, inactive elements, muted borders |
| 400 | `#BDBDBD` | `189, 189, 189` | Placeholder text, secondary borders, subtle icons |
| 500 | `#9E9E9E` | `158, 158, 158` | Icons, helper text, tertiary content |
| 600 | `#757575` | `117, 117, 117` | Secondary text, less important content |
| 700 | `#616161` | `97, 97, 97` | Body text (light backgrounds), standard content |
| 800 | `#424242` | `66, 66, 66` | Headings, primary text, important content |
| 900 | `#212121` | `33, 33, 33` | Highest contrast text, key headings, emphasis |

---

## 📝 Typography System

### Primary Font: Inter
- **Purpose**: UI elements, buttons, labels, navigation, interface text
- **Characteristics**: Clean, highly legible, modern, neutral, optimized for screens
- **Weights Available**: 
  - Light (300): Subtle text, large headings
  - Regular (400): Standard UI text, body copy in components
  - Medium (500): Emphasized text, subheadings, button labels
  - Bold (700): Headings, strong emphasis, primary CTAs

### Secondary Font: Roboto
- **Purpose**: Body copy, articles, long-form content, documentation
- **Characteristics**: Professional, mechanical skeleton with friendly curves, excellent readability
- **Weights Available**:
  - Light (300): Large body text, introductory paragraphs
  - Regular (400): Standard body text, paragraphs, descriptions
  - Bold (700): Article headings, section titles, emphasis

### Typography Scale
- **Display**: 48px / 3rem (Page titles, hero headings)
- **H1**: 36px / 2.25rem (Main page headings)
- **H2**: 30px / 1.875rem (Section headings)
- **H3**: 24px / 1.5rem (Subsection headings)
- **H4**: 20px / 1.25rem (Card titles, component headings)
- **H5**: 18px / 1.125rem (Small headings)
- **Body Large**: 18px / 1.125rem (Introductory text, emphasis)
- **Body**: 16px / 1rem (Standard body text - minimum size)
- **Body Small**: 14px / 0.875rem (Helper text, captions)
- **Caption**: 12px / 0.75rem (Labels, metadata, timestamps)

### Line Height Guidelines
- **Headings**: 1.2 - 1.3 (tight for impact)
- **Body Text**: 1.5 - 1.6 (comfortable reading)
- **UI Elements**: 1.4 (balanced for buttons/labels)

### Letter Spacing
- **Headings**: -0.02em (slightly tighter)
- **Body**: 0 (default)
- **Uppercase Labels**: 0.05em (slightly wider)

---

## ♿ Accessibility Guidelines

### Color Contrast Requirements
- **AAA Standard** (7:1): Use for body text and critical content
- **AA Standard** (4.5:1): Minimum for all text content
- **Large Text AA** (3:1): Text 18px+ or 14px+ bold

### Contrast Ratios by Color
- Deep Navy on White: 14.5:1 (AAA) ✓
- Trustworthy Blue on White: 5.2:1 (AA) ✓
- Academic Gold on Deep Navy: 10.8:1 (AAA) ✓
- Success Green on White: 7.1:1 (AAA) ✓
- Warning Amber on Deep Navy: 4.9:1 (AA) ✓
- Error Red on White: 5.6:1 (AA) ✓
- Gray 700 on White: 7.8:1 (AAA) ✓
- Gray 600 on White: 4.6:1 (AA) ✓

### Text Color Recommendations
- **On Light Backgrounds** (White, Gray 50-200): Use Gray 700-900 or Deep Navy
- **On Deep Navy**: Use White or Academic Gold
- **On Trustworthy Blue**: Use White only
- **On Academic Gold**: Use Deep Navy only
- **On Success Green**: Use White only
- **On Warning Amber**: Use Deep Navy only
- **On Error Red**: Use White only

### Accessibility Best Practices
- Never rely on color alone to convey information
- Provide text labels alongside color indicators
- Ensure interactive elements have visible focus states
- Maintain minimum 16px font size for body text
- Use semantic HTML for proper screen reader support
- Test with color blindness simulators

---

## 🎯 Usage Guidelines

### Primary Colors Usage
- **Deep Navy**: Use for primary actions, main navigation, headers, hero sections
- **Trustworthy Blue**: Use for links, secondary actions, hover states, informational elements
- **Academic Gold**: Use sparingly for special emphasis, achievements, premium features (accent only)

### Semantic Colors Usage
- **Success Green**: Only for positive confirmations, completed actions, success states
- **Warning Amber**: Only for non-critical warnings, pending states, cautionary messages
- **Error Red**: Only for errors, destructive actions, critical alerts, validation failures

### Grayscale Usage
- **Shades 50-200**: Backgrounds, cards, subtle dividers, disabled states
- **Shades 300-500**: Borders, icons, placeholder text, inactive elements
- **Shades 600-900**: Text content (ensure proper contrast)

### Typography Usage
- **Inter**: All UI components, navigation, buttons, labels, forms, tables
- **Roboto**: Article content, blog posts, documentation, long-form text
- **Consistency**: Use same font weight for similar elements across the application
- **Hierarchy**: Establish clear visual hierarchy with size and weight variations
- **Readability**: Never go below 16px for body text, maintain proper line height

### Color Combinations to Avoid
- Academic Gold on light backgrounds (poor contrast)
- Trustworthy Blue on Deep Navy (insufficient contrast)
- Gray 400-500 for body text (fails AA standard)
- Multiple semantic colors together (creates confusion)

---

## 🔧 Implementation Reference

### CSS Custom Properties
```
--color-deep-navy: #0A1551
--color-trustworthy-blue: #0662C7
--color-academic-gold: #FFC700

--color-success: #2D7A3E
--color-warning: #F39237
--color-error: #D32F2F

--color-gray-50: #FAFAFA
--color-gray-100: #F5F5F5
--color-gray-200: #EEEEEE
--color-gray-300: #E0E0E0
--color-gray-400: #BDBDBD
--color-gray-500: #9E9E9E
--color-gray-600: #757575
--color-gray-700: #616161
--color-gray-800: #424242
--color-gray-900: #212121

--font-primary: 'Inter', sans-serif
--font-secondary: 'Roboto', sans-serif

--font-weight-light: 300
--font-weight-regular: 400
--font-weight-medium: 500
--font-weight-bold: 700
```

### Tailwind Configuration Mapping
- Primary: `bg-[#0A1551]` or custom `bg-deep-navy`
- Blue: `bg-[#0662C7]` or custom `bg-trustworthy-blue`
- Gold: `bg-[#FFC700]` or custom `bg-academic-gold`
- Success: `bg-[#2D7A3E]` or custom `bg-success`
- Warning: `bg-[#F39237]` or custom `bg-warning`
- Error: `bg-[#D32F2F]` or custom `bg-error`
- Grays: Use Tailwind's gray scale or extend with custom values

### Component Color Patterns
- **Primary Button**: Deep Navy background, white text
- **Secondary Button**: Trustworthy Blue background, white text
- **Tertiary Button**: Gray 200 background, Gray 800 text
- **Link**: Trustworthy Blue text, underline on hover
- **Success Toast**: Success Green background, white text, checkmark icon
- **Warning Toast**: Warning Amber background, Deep Navy text, alert icon
- **Error Toast**: Error Red background, white text, error icon
- **Card**: Gray 50 or White background, Gray 200 border
- **Input**: White background, Gray 300 border, Gray 700 text
- **Input Focus**: Trustworthy Blue border, no background change
- **Disabled State**: Gray 100 background, Gray 400 text

---

## 📐 Spacing and Layout

### Spacing Scale (8px base)
- **xs**: 4px / 0.25rem
- **sm**: 8px / 0.5rem
- **md**: 16px / 1rem
- **lg**: 24px / 1.5rem
- **xl**: 32px / 2rem
- **2xl**: 48px / 3rem
- **3xl**: 64px / 4rem

### Component Spacing
- **Button Padding**: 12px 24px (md horizontal, sm vertical)
- **Input Padding**: 12px 16px
- **Card Padding**: 24px (lg)
- **Section Spacing**: 64px (3xl) between major sections
- **Element Spacing**: 16px (md) between related elements

### Border Radius
- **sm**: 4px (inputs, small buttons)
- **md**: 8px (cards, buttons, modals)
- **lg**: 12px (large cards, containers)
- **full**: 9999px (pills, avatars)

---

## 🎭 Component States

### Interactive States
- **Default**: Base color, no special styling
- **Hover**: Slightly darker shade (10-15% darker) or opacity 0.9
- **Active/Pressed**: Even darker shade (20-25% darker) or opacity 0.8
- **Focus**: 2px outline in Trustworthy Blue, 2px offset
- **Disabled**: Gray 300 background, Gray 400 text, cursor not-allowed

### Loading States
- **Skeleton**: Gray 200 background with shimmer animation
- **Spinner**: Trustworthy Blue or context-appropriate color
- **Progress Bar**: Trustworthy Blue fill, Gray 200 background

---

## 🌓 Dark Mode Considerations

### Future Dark Mode Palette (Reference)
- **Background**: Gray 900 (#212121)
- **Surface**: Gray 800 (#424242)
- **Primary**: Lighter Deep Navy (#1A2B7A)
- **Text Primary**: Gray 50 (#FAFAFA)
- **Text Secondary**: Gray 400 (#BDBDBD)
- **Borders**: Gray 700 (#616161)

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1440px

### Typography Scaling
- Scale down heading sizes by 20-30% on mobile
- Maintain minimum 16px body text on all devices
- Adjust line height for smaller screens (slightly tighter)

---

## ✅ Design Checklist

### Before Implementation
- [ ] Verify color contrast meets WCAG AA minimum
- [ ] Confirm font sizes are 16px+ for body text
- [ ] Check color combinations against guidelines
- [ ] Ensure semantic colors used correctly
- [ ] Validate typography hierarchy is clear

### During Development
- [ ] Use CSS custom properties for colors
- [ ] Apply correct font family (Inter for UI, Roboto for content)
- [ ] Implement proper focus states for accessibility
- [ ] Test with keyboard navigation
- [ ] Verify responsive behavior

### Quality Assurance
- [ ] Test with color blindness simulators
- [ ] Verify contrast ratios with accessibility tools
- [ ] Check consistency across components
- [ ] Validate against design system guidelines
- [ ] Test on multiple devices and browsers

---

**Purpose:** Design system reference for Kiro AI assistant  
**Maintained By:** Design & Frontend Team  
**Version:** 1.0  
**Last Updated:** February 2026
