# Kiro AI Configuration Guide

## Overview
This project is configured with Kiro steering files that provide comprehensive architectural and design guidelines. These files are automatically included in every Kiro session, ensuring consistent code generation and adherence to project standards.

## Active Steering Files

### 1. Project Architecture (`01-project-architecture.md`)
**Purpose**: Core architectural principles and folder structure

**Key Guidelines:**
- Custom implementations only (no third-party state/API libraries)
- Folder structure and organization
- File naming conventions
- Error handling strategy (including silent errors)
- State management with React Context
- Custom API client with fetch
- Path aliases configuration
- Development workflow

**Always Applied**: Yes

---

### 2. Design System (`02-design-system.md`)
**Purpose**: Brand identity, colors, typography, and component styling

**Key Guidelines:**
- Brand colors (Deep Navy, Trustworthy Blue, Academic Gold)
- Semantic colors (Success, Warning, Error)
- Typography system (Inter for UI, Roboto for content)
- Accessibility requirements (WCAG AA/AAA)
- Component styling patterns
- Spacing scale and CSS custom properties
- Tailwind utility classes

**Always Applied**: Yes

---

### 3. React Performance (`03-react-performance.md`)
**Purpose**: Performance optimization best practices

**Key Guidelines:**
- Eliminate waterfalls with Promise.all()
- Bundle size optimization
- Server-side performance (React.cache, RSC)
- Re-render optimization
- Client-side data fetching
- Rendering performance
- JavaScript performance patterns
- Next.js specific optimizations

**Always Applied**: Yes

---

### 4. Composition Patterns (`04-composition-patterns.md`)
**Purpose**: React component composition patterns

**Key Guidelines:**
- Avoid boolean prop proliferation
- Use compound components
- Lift state into providers
- Create explicit component variants
- Prefer children over render props
- Decouple state management from UI

**Always Applied**: Yes

---

## How Steering Files Work

### Automatic Inclusion
All steering files marked with `inclusion: always` are automatically included in every Kiro conversation. You don't need to remind Kiro about:
- Project architecture
- Design system colors and typography
- Performance best practices
- Composition patterns
- File naming conventions
- Error handling strategies

### Benefits
1. **Consistency**: All code follows the same patterns
2. **No Repetition**: Don't need to explain architecture every time
3. **Best Practices**: Performance and accessibility built-in
4. **Type Safety**: TypeScript patterns enforced
5. **Design Compliance**: Automatic adherence to design system

---

## Reference Documents

### Architecture & Design
- `ARCHITECTURE.md` - Detailed architecture documentation
- `DESIGN.md` - Complete design system specification
- `docs/TOAST_USAGE.md` - Toast notification usage guide

### Configuration Files
- `.kiro/steering/` - Active steering files
- `app/globals.css` - Tailwind v4 configuration with design tokens
- `tsconfig.json` - TypeScript configuration with path aliases

---

## Quick Reference

### When Creating Components
```typescript
// ✅ Correct structure
src/components/ui/Button/
├── Button.tsx
├── Button.types.ts
└── index.ts
```

### When Importing
```typescript
// ✅ Use path aliases
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
```

### When Styling
```typescript
// ✅ Use design system colors
<button className="bg-deep-navy text-white">
  Primary Action
</button>

// ✅ Use custom classes
<button className="btn btn-primary">
  Primary Action
</button>
```

### When Fetching Data
```typescript
// ✅ Parallel fetching
const [user, posts] = await Promise.all([
  fetchUser(),
  fetchPosts()
]);

// ✅ Use React.cache for deduplication
const getUser = cache(async () => {
  return await fetchUser();
});
```

### When Handling Errors
```typescript
// ✅ Use toast for user-facing errors
import { toast } from '@/lib/utils/toast';

try {
  await saveData();
  toast.success('Data saved successfully!');
} catch (error) {
  toast.error('Failed to save data', {
    description: error.message
  });
}

// ✅ Silent errors for non-critical operations
try {
  await trackAnalytics();
} catch (error) {
  // Log silently, don't show to user
  console.error('Analytics tracking failed:', error);
}
```

---

## Customizing Steering Files

### Adding New Rules
1. Create a new file in `.kiro/steering/`
2. Use numbered prefix (e.g., `05-custom-rules.md`)
3. Add frontmatter: `---\ninclusion: always\n---`
4. Write your guidelines

### Modifying Existing Rules
1. Edit the appropriate steering file
2. Changes take effect immediately
3. No need to restart Kiro

### Conditional Inclusion
To include a steering file only when specific files are opened:
```markdown
---
inclusion: fileMatch
fileMatchPattern: 'src/components/**/*.tsx'
---
```

---

## Best Practices

### Do's
- ✅ Trust that Kiro knows the architecture
- ✅ Focus on feature requirements, not implementation details
- ✅ Reference steering files when clarification needed
- ✅ Update steering files when patterns change

### Don'ts
- ❌ Don't repeat architecture guidelines in every request
- ❌ Don't explain design system colors each time
- ❌ Don't specify file naming conventions repeatedly
- ❌ Don't remind about performance patterns

---

## Troubleshooting

### Kiro Not Following Guidelines
1. Check if steering file exists in `.kiro/steering/`
2. Verify frontmatter has `inclusion: always`
3. Ensure file has `.md` extension
4. Check file permissions

### Conflicting Guidelines
- Workspace-level rules (steering files) take precedence
- Your specific request always has highest priority
- Steering files guide, but don't override explicit instructions

---

## Summary

With these steering files configured, Kiro automatically:
- Follows project architecture
- Uses design system colors and typography
- Applies performance best practices
- Implements composition patterns
- Handles errors appropriately
- Creates properly structured files
- Uses correct naming conventions
- Maintains type safety

You can focus on what you want to build, and Kiro handles how to build it correctly.

---

**Last Updated**: February 2026  
**Configuration Version**: 1.0
