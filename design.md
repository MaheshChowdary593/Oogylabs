# UI/UX Design System Specification
## The Lenny Growth Assistant

---

## 1. Design Principles & Aesthetics

The UI for **The Lenny Growth Assistant** is crafted to look premium, modern, and high-performance, adhering to dark glassmorphism standards:
- **Rich Palette**: Deep space canvas (`#090b11`), glowing violet accent gradients (`#6366f1` to `#a855f7`), cyan citation indicators (`#06b6d4`), and crisp white typography.
- **Visual Depth**: Layered glass panels with subtle backdrop blurs (`backdrop-filter: blur(16px)`), translucent borders (`rgba(255, 255, 255, 0.09)`), and ambient soft shadows.
- **Dynamic Interaction**: Pulsing health status dots, glowing model toggles, hover elevation on prompt cards, and smooth split-pane drawer transitions.

---

## 2. Color System & Typography

### Palette Tokens
- **Background Dark**: `#090b11`
- **Surface Card**: `rgba(22, 28, 45, 0.7)`
- **Primary Gradient**: `linear-gradient(135deg, #6366f1 0%, #a855f7 100%)`
- **Cyan Citation Accent**: `#06b6d4`
- **Emerald Active Status**: `#10b981`

### Typography Stack
- **Primary UI & Headings**: `Plus Jakarta Sans` (Google Font)
- **Code & Source Artifacts**: `JetBrains Mono` (Google Font)

---

## 3. Information Architecture & Key Component States

```
+-----------------------------------------------------------------------------------+
| HEADER: App Logo | Skill Actions | Model Selector (Ollama/Claude/OpenAI) | New Chat|
+------------------+----------------------------------------------------------------+
| SIDEBAR (260px)  | MAIN CHAT CONTAINER (Flex 1)             | ARTIFACT VIEWER     |
| - Session list   | - Message stream                         | (520px Split Drawer)|
| - Delete action  | - Grounding Citation Badges              | - Preview / Code    |
| - Expand/Collapse| - Follow-up prompt chips                 | - Copy & Export     |
|                  | - Input bar + Skill Selector             | - Sandboxed Iframe  |
+------------------+----------------------------------------------------------------+
```

---

## 4. Accessibility & Responsive Behaviors

- **Color Contrast**: Complies with WCAG AA standards using high-contrast text on dark backgrounds (`#f3f4f6` text on `#111523` surface).
- **Keyboard Navigation**: Native tab ordering for input areas, model dropdowns, and button actions.
- **Responsive Collapsible Drawer**: Sidebar and Artifact Viewer auto-collapse cleanly on narrower viewports.
