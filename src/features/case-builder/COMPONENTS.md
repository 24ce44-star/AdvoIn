# AI Case Builder - Component Reference

## Component Architecture

```
CaseBuilderScreen (Main Container)
├── Header (LinearGradient)
│   ├── Back Button
│   ├── Title & Subtitle
│   └── Preview Toggle Button
│
├── Content (Conditional)
│   ├── Chat View
│   │   ├── ScrollView
│   │   │   ├── ConversationMessage (AI)
│   │   │   ├── ConversationMessage (User)
│   │   │   ├── TypingIndicator
│   │   │   ├── SuggestionChips
│   │   │   └── QuestionOptions
│   │   ├── Action Buttons
│   │   └── CaseBuilderInput
│   │
│   └── Preview View
│       └── CasePreviewCard
│           ├── Section (Category)
│           ├── Section (Description)
│           ├── Section (Parties)
│           ├── Section (Timeline)
│           └── Section (Outcome)
```

## Component Details

### 1. CaseBuilderScreen

**Location:** `screens/CaseBuilderScreen.tsx`

**Purpose:** Main container that orchestrates the entire case building experience.

**Props:** None (uses navigation)

**State:**

```typescript
{
  messages: ConversationMessage[],
  caseData: Partial<CaseData>,
  isLoading: boolean,
  showPreview: boolean
}
```

**Key Features:**

- Manages conversation flow
- Toggles between chat and preview
- Handles finalization
- Auto-scrolls to new messages

**Usage:**

```typescript
import CaseBuilderScreen from '@/features/case-builder/screens/CaseBuilderScreen';

<Stack.Screen name="create-case" component={CaseBuilderScreen} />
```

---

### 2. ConversationMessage

**Location:** `components/ConversationMessage.tsx`

**Purpose:** Displays AI and user messages with appropriate styling.

**Props:**

```typescript
interface ConversationMessageProps {
  type: "ai" | "user";
  content: string;
  timestamp?: Date;
  index: number;
}
```

**Features:**

- AI messages: Left-aligned, markdown support, no bubble
- User messages: Right-aligned, styled bubble
- Timestamps
- Staggered fade-in animation

**Example:**

```typescript
<ConversationMessage
  type="ai"
  content="What type of legal matter are you dealing with?"
  timestamp={new Date()}
  index={0}
/>
```

**Styling:**

```typescript
// AI Message
- Icon: Sparkles in steel blue circle
- Text: Markdown formatted, legal-navy/legal-ice
- Layout: Left-aligned, full width

// User Message
- Bubble: Navy/steel background, rounded
- Text: White color
- Layout: Right-aligned, max 80% width
```

---

### 3. SuggestionChips

**Location:** `components/SuggestionChips.tsx`

**Purpose:** Horizontal scrollable quick-reply buttons.

**Props:**

```typescript
interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  index?: number;
}
```

**Features:**

- Horizontal scroll
- Tap to select and send
- Animated entrance
- Matches design language

**Example:**

```typescript
<SuggestionChips
  suggestions={[
    'Property Dispute',
    'Employment Issue',
    'Family Matter'
  ]}
  onSelect={(value) => handleSelect(value)}
  index={1}
/>
```

**Styling:**

```typescript
- Container: Horizontal ScrollView
- Chip: Rounded-full, ice/neutral-800 background
- Text: Navy/ice, medium weight
- Spacing: 8px between chips
```

---

### 4. QuestionOptions

**Location:** `components/QuestionOptions.tsx`

**Purpose:** MCQ-style option selector with visual feedback.

**Props:**

```typescript
interface QuestionOptionsProps {
  options: QuestionOption[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  index?: number;
}

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  description?: string;
}
```

**Features:**

- Single or multi-select
- Visual selection feedback
- Checkmark indicator
- Optional descriptions

**Example:**

```typescript
<QuestionOptions
  options={[
    {
      id: '1',
      label: 'Low',
      value: 'low',
      description: 'No immediate deadline'
    },
    {
      id: '2',
      label: 'High',
      value: 'high',
      description: 'Within a week'
    }
  ]}
  onSelect={(value) => handleSelect(value)}
  multiSelect={false}
  index={2}
/>
```

**Styling:**

```typescript
// Unselected
- Border: 2px slate/neutral-800
- Background: White/neutral-900
- Text: Navy/ice

// Selected
- Border: 2px steel blue
- Background: Steel/10 or steel/20
- Text: Steel blue
- Icon: Checkmark in steel circle
```

---

### 5. CaseBuilderInput

**Location:** `components/CaseBuilderInput.tsx`

**Purpose:** Custom input with send button and loading states.

**Props:**

```typescript
interface CaseBuilderInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
}
```

**Features:**

- Multiline support
- Send button with animation
- Loading indicator
- Focus/blur styling
- Keyboard handling

**Example:**

```typescript
<CaseBuilderInput
  onSend={(message) => handleSend(message)}
  placeholder="Type your response..."
  isLoading={false}
  disabled={false}
/>
```

**Styling:**

```typescript
// Container
- Background: Ice/neutral-800
- Border: Slate/neutral-700 (focus: steel)
- Rounded: 2xl
- Padding: 16px

// Input
- Multiline: true
- Max height: 128px
- Color: Navy/ice

// Send Button
- Size: 36x36
- Background: Steel (active) / slate (inactive)
- Icon: ArrowUp or Loader2
- Animation: Scale on press
```

---

### 6. CasePreviewCard

**Location:** `components/CasePreviewCard.tsx`

**Purpose:** Displays editable case summary with missing field indicators.

**Props:**

```typescript
interface CasePreviewCardProps {
  caseData: Partial<CaseData>;
  onEdit: (field: string) => void;
}
```

**Features:**

- Shows all case sections
- Edit button on each section
- Missing field warnings
- Icon indicators
- Scrollable

**Example:**

```typescript
<CasePreviewCard
  caseData={caseData}
  onEdit={(field) => handleEdit(field)}
/>
```

**Styling:**

```typescript
// Section (with data)
- Border: Slate/neutral-800
- Background: White/neutral-900
- Icon: Steel blue circle
- Edit icon: Top right

// Section (missing data)
- Border: Crimson/30
- Background: Crimson/5 or crimson/10
- Icon: Crimson circle
- Text: "Not provided yet" in crimson
```

---

### 7. TypingIndicator

**Location:** `components/TypingIndicator.tsx`

**Purpose:** Animated AI thinking indicator.

**Props:** None

**Features:**

- Three pulsing dots
- Sparkles icon
- Smooth animation
- Matches AI message style

**Example:**

```typescript
{isLoading && <TypingIndicator />}
```

**Styling:**

```typescript
- Icon: Sparkles in steel blue circle
- Dots: 3 dots, slate/neutral-400
- Animation: Sequential pulse (opacity + scale)
- Container: Ice/neutral-900 rounded bubble
```

---

## Hooks

### useCaseBuilder

**Location:** `hooks/useCaseBuilder.ts`

**Purpose:** Manages conversation state and AI interactions.

**Returns:**

```typescript
{
  messages: ConversationMessage[],
  caseData: Partial<CaseData>,
  currentStage: BuilderStage,
  isLoading: boolean,
  processUserResponse: (input: string) => Promise<void>,
  startConversation: () => Promise<void>,
  updateCaseData: (updates: Partial<CaseData>) => void,
  setCurrentStage: (stage: BuilderStage) => void,
  generateCaseSummary: () => Promise<string>,
  analyzeCompleteness: () => Promise<ValidationResult>,
  resetBuilder: () => void
}
```

**Usage:**

```typescript
const {
  messages,
  caseData,
  isLoading,
  processUserResponse,
  startConversation,
} = useCaseBuilder();

useEffect(() => {
  startConversation();
}, []);
```

---

## Services

### GroqService

**Location:** `services/groq.service.ts`

**Purpose:** Handles all AI API interactions.

**Methods:**

```typescript
// Send message to AI
static async sendMessage(
  messages: GroqMessage[],
  temperature?: number
): Promise<string>

// Generate follow-up question
static async generateFollowUp(
  conversationHistory: GroqMessage[],
  currentStage: string,
  caseData: any
): Promise<string>

// Analyze case completeness
static async analyzeCaseCompleteness(
  caseData: any
): Promise<{
  isComplete: boolean;
  missingFields: string[];
  suggestions: string[];
}>

// Generate case summary
static async generateCaseSummary(
  caseData: any
): Promise<string>

// Suggest questions
static async suggestQuestions(
  topic: string,
  context: string
): Promise<string[]>
```

**Usage:**

```typescript
import { GroqService } from "@/features/case-builder/services/groq.service";

const response = await GroqService.sendMessage([
  { role: "user", content: "Hello" },
]);
```

---

## Store

### useCaseStore

**Location:** `store/useCaseStore.ts`

**Purpose:** Zustand store for case persistence.

**State:**

```typescript
{
  cases: CaseData[],
  currentCase: Partial<CaseData> | null,
  addCase: (caseData: CaseData) => void,
  updateCase: (id: string, updates: Partial<CaseData>) => void,
  deleteCase: (id: string) => void,
  setCurrentCase: (caseData: Partial<CaseData> | null) => void,
  getCaseById: (id: string) => CaseData | undefined
}
```

**Usage:**

```typescript
import { useCaseStore } from "@/features/case-builder/store/useCaseStore";

const { cases, addCase } = useCaseStore();

addCase(newCaseData);
```

---

## Types

### CaseData

```typescript
interface CaseData {
  id: string;
  title: string;
  category: string;
  description: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  timeline: TimelineEvent[];
  evidence: Evidence[];
  witnesses: Witness[];
  legalIssues: string[];
  desiredOutcome: string;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedValue?: string;
  jurisdiction?: string;
  status: "draft" | "review" | "finalized";
  createdAt: Date;
  updatedAt: Date;
}
```

### ConversationMessage

```typescript
interface ConversationMessage {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  options?: QuestionOption[];
  field?: keyof CaseData | string;
  isEditable?: boolean;
}
```

### BuilderStage

```typescript
type BuilderStage =
  | "welcome"
  | "category"
  | "basic-info"
  | "parties"
  | "incident"
  | "timeline"
  | "evidence"
  | "witnesses"
  | "legal-issues"
  | "outcome"
  | "review"
  | "finalize";
```

---

## Styling Guide

### Color Palette

```typescript
// Primary
legal-navy: #0F172A
legal-steel: #3B82F6
legal-steelLight: #0EA5E9

// Background
legal-ice: #F8FAFC
white / neutral-900

// Accents
legal-emerald: #059669
legal-crimson: #E11D48
legal-slate: #64748B
```

### Common Classes

```typescript
// Containers
"bg-white dark:bg-neutral-900"
"border border-legal-slate/20 dark:border-neutral-800"
"rounded-xl" or "rounded-2xl"

// Text
"text-legal-navy dark:text-legal-ice"
"text-legal-slate dark:text-neutral-400"

// Buttons
"bg-legal-steel"
"bg-legal-navy dark:bg-white"

// Spacing
"px-4 py-3"
"mb-4"
"space-x-2"
```

### Animation Patterns

```typescript
// Fade in
entering={FadeInDown.delay(index * 50).springify()}

// Scale press
withSpring(0.97) → withSpring(1)

// Pulse
withRepeat(withSequence(
  withTiming(1),
  withTiming(0)
), -1)
```

---

## Best Practices

### Component Usage

1. Always provide required props
2. Use TypeScript interfaces
3. Handle loading states
4. Provide fallbacks
5. Test dark mode

### Performance

1. Memoize expensive computations
2. Use useCallback for handlers
3. Optimize re-renders
4. Lazy load when possible
5. Profile on real devices

### Accessibility

1. Add accessibility labels
2. Ensure touch targets ≥44pt
3. Support screen readers
4. Maintain color contrast
5. Test with assistive tech

---

**This component library provides everything needed to build a sophisticated, conversational case builder.** 🎨⚖️
