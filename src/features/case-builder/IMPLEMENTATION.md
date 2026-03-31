# AI Case Builder - Implementation Guide

## What Was Built

A sophisticated, conversational AI-powered case builder that replaces traditional form-based case creation with an intelligent dialogue system.

## Key Features Implemented

### ✅ Conversational UI

- **ConversationMessage Component**: Displays AI and user messages
  - AI messages: Clean, bubble-free with markdown support
  - User messages: Styled bubbles aligned right
  - Timestamps and smooth animations
  - No traditional chat bubble for AI (formatted beautifully instead)

### ✅ Interactive Elements

- **SuggestionChips**: Horizontal scrollable quick-reply buttons
- **QuestionOptions**: MCQ-style selections with visual feedback
- **CaseBuilderInput**: Custom input with send button and loading states
- **TypingIndicator**: Animated AI thinking indicator

### ✅ AI Integration

- **Groq API Service**: Fast, efficient AI responses using Llama 3.3 70B
- **Smart Interrogation**: Context-aware follow-up questions
- **Case Analysis**: Completeness checking and validation
- **Summary Generation**: AI-generated case summaries

### ✅ User Control

- **Preview Mode**: Review and edit case anytime
- **CasePreviewCard**: Editable summary with missing field indicators
- **Field Editing**: Tap any section to modify
- **Finalization Flow**: Completeness check before saving

### ✅ State Management

- **useCaseBuilder Hook**: Centralized conversation and case state
- **useCaseStore**: Zustand store for case persistence
- **Conversation History**: Maintains context for AI

### ✅ Design Language Match

- Uses app's legal color palette (navy, steel, ice)
- Smooth Reanimated animations
- Dark mode support throughout
- Consistent with existing UI components

## Architecture

```
src/features/case-builder/
├── components/
│   ├── CaseBuilderInput.tsx       # Custom input with send button
│   ├── CasePreviewCard.tsx        # Editable case summary
│   ├── ConversationMessage.tsx    # AI/user message display
│   ├── QuestionOptions.tsx        # MCQ-style selections
│   ├── SuggestionChips.tsx        # Quick-reply chips
│   └── TypingIndicator.tsx        # AI thinking animation
├── constants/
│   └── caseCategories.ts          # Case types, urgency levels
├── hooks/
│   └── useCaseBuilder.ts          # Main conversation logic
├── screens/
│   └── CaseBuilderScreen.tsx      # Main screen component
├── services/
│   └── groq.service.ts            # AI API integration
├── store/
│   └── useCaseStore.ts            # Case persistence
├── types/
│   └── case.types.ts              # TypeScript interfaces
├── utils/
│   └── caseValidation.ts          # Validation logic
├── README.md                       # Feature overview
├── USAGE.md                        # User guide
└── IMPLEMENTATION.md               # This file
```

## How It Works

### 1. Conversation Flow

```typescript
// User opens case builder
startConversation()
  → AI sends welcome message with category suggestions

// User selects category or types response
processUserResponse(input)
  → Add user message to history
  → Send to Groq API with context
  → AI generates follow-up question
  → Display AI response with suggestions/options

// Repeat until case is complete
```

### 2. AI Interrogation Strategy

The AI follows a structured approach:

1. **Category Selection**: Identify case type
2. **Basic Description**: Get overview of situation
3. **Parties**: Identify plaintiff and defendant
4. **Incident Details**: When, where, what happened
5. **Timeline**: Build chronological event list
6. **Evidence**: Collect supporting materials
7. **Witnesses**: Identify and document witnesses
8. **Legal Issues**: Identify applicable laws
9. **Desired Outcome**: What user wants to achieve
10. **Review**: Final completeness check

### 3. Data Structure

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
  status: "draft" | "review" | "finalized";
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Message Types

```typescript
interface ConversationMessage {
  id: string;
  type: "ai" | "user";
  content: string; // Markdown supported for AI
  timestamp: Date;
  suggestions?: string[]; // Quick-reply chips
  options?: QuestionOption[]; // MCQ options
  field?: string; // Associated case field
}
```

## Integration Points

### 1. Navigation

```typescript
// app/(tabs)/create-case.tsx
import CaseBuilderScreen from "@/features/case-builder/screens/CaseBuilderScreen";

export default function CreateCaseScreen() {
  return <CaseBuilderScreen />;
}
```

### 2. API Configuration

```typescript
// src/features/case-builder/services/groq.service.ts
const GROQ_API_KEY = "your-api-key-here";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
```

### 3. Theme Integration

Uses existing `useLegalTheme` hook for colors and dark mode.

## Customization Guide

### Modify AI Behavior

```typescript
// In groq.service.ts
private static systemPrompt = `
  Your custom instructions here...
  - Ask specific questions
  - Be empathetic
  - Extract details
`;
```

### Add New Question Types

```typescript
// Create new component in components/
export function CustomQuestionType({ data, onSelect }) {
  // Your custom UI
}

// Use in CaseBuilderScreen.tsx
{showCustomType && (
  <CustomQuestionType
    data={lastMessage.customData}
    onSelect={handleSelect}
  />
)}
```

### Modify Conversation Stages

```typescript
// In useCaseBuilder.ts
const stageTransitions = {
  welcome: "category",
  category: "basic-info",
  // Add your stages
};
```

### Style Adjustments

All components use Tailwind classes:

```typescript
// Example: Change AI message background
className = "bg-legal-ice dark:bg-neutral-900";
// Change to:
className = "bg-blue-50 dark:bg-blue-900";
```

## Testing Checklist

- [ ] AI responds to user input
- [ ] Suggestions chips work
- [ ] MCQ options selectable
- [ ] Preview mode displays data
- [ ] Edit functionality works
- [ ] Finalization flow complete
- [ ] Dark mode works
- [ ] Keyboard handling smooth
- [ ] Animations perform well
- [ ] API errors handled gracefully

## Performance Considerations

### Optimizations Implemented

1. **Lazy Loading**: Components loaded on demand
2. **Memoization**: useMemo for filtered data
3. **Debouncing**: Input debounced to reduce API calls
4. **Efficient Scrolling**: Auto-scroll only when needed
5. **Animation Performance**: useNativeDriver where possible

### Potential Improvements

1. **Message Virtualization**: For very long conversations
2. **Image Optimization**: Compress uploaded evidence
3. **Offline Support**: Cache conversations locally
4. **Background Sync**: Sync when connection restored

## Security Considerations

### Implemented

- API key stored in service (should be moved to env)
- Input validation before API calls
- Error handling for failed requests
- No sensitive data in logs

### Recommended

- Move API key to environment variables
- Implement rate limiting
- Add request signing
- Encrypt stored case data
- Add user authentication

## Known Limitations

1. **API Dependency**: Requires internet for AI features
2. **Context Length**: Long conversations may hit token limits
3. **Language**: Currently English only
4. **File Upload**: Evidence upload not yet implemented
5. **Collaboration**: Single-user only

## Future Enhancements

### Phase 2

- [ ] Voice input support
- [ ] Document upload and OCR
- [ ] Evidence photo capture
- [ ] Witness contact integration

### Phase 3

- [ ] Template-based case types
- [ ] Advocate matching suggestions
- [ ] Case strength scoring
- [ ] Legal precedent search

### Phase 4

- [ ] Real-time collaboration
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Export to PDF/Word

## Troubleshooting

### AI Not Responding

```typescript
// Check API key
console.log("API Key:", GROQ_API_KEY.substring(0, 10) + "...");

// Check network
fetch(GROQ_API_URL).then((r) => console.log("API reachable"));

// Check rate limits
// Groq free tier: 30 requests/minute
```

### Messages Not Displaying

```typescript
// Check state
console.log("Messages:", messages.length);
console.log("Last message:", messages[messages.length - 1]);

// Check ScrollView
scrollViewRef.current?.scrollToEnd({ animated: true });
```

### Styling Issues

```typescript
// Check theme
const { isDark } = useLegalTheme();
console.log("Dark mode:", isDark);

// Check Tailwind classes
// Ensure nativewind is configured properly
```

## Deployment Notes

### Environment Variables

```bash
# .env
GROQ_API_KEY=your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### Build Configuration

```json
// app.json
{
  "expo": {
    "extra": {
      "groqApiKey": process.env.GROQ_API_KEY
    }
  }
}
```

### Production Checklist

- [ ] Move API key to environment variables
- [ ] Enable error tracking (Sentry)
- [ ] Add analytics events
- [ ] Test on multiple devices
- [ ] Optimize bundle size
- [ ] Enable code splitting
- [ ] Add crash reporting
- [ ] Set up monitoring

## Support & Maintenance

### Monitoring

- Track API response times
- Monitor error rates
- Log conversation completion rates
- Track user drop-off points

### Updates

- Keep Groq SDK updated
- Monitor API changes
- Update AI prompts based on feedback
- Refine question flow

### User Feedback

- Collect ratings after case creation
- Track which questions cause confusion
- Monitor edit frequency
- Analyze completion rates

## Credits

Built with:

- React Native + Expo
- Groq API (Llama 3.3 70B)
- React Native Reanimated
- NativeWind (Tailwind CSS)
- Zustand (State Management)
- React Native Markdown Display

Design inspired by modern conversational AI interfaces with a focus on legal professionalism.
