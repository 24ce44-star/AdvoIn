# AI Case Builder - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Installation

All dependencies are already included in your project. No additional packages needed!

### 2. Configuration

The Groq API key is already configured in the service file. For production, move it to environment variables:

```bash
# .env
GROQ_API_KEY=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
```

### 3. Usage

The case builder is already integrated into your "Create Case" tab. Just run your app:

```bash
npm start
# or
expo start
```

### 4. Test It Out

1. Open your app
2. Navigate to "Create Case" tab
3. AI will greet you and ask about your case type
4. Select a suggestion or type your response
5. Continue the conversation
6. Toggle preview mode anytime
7. Finalize when complete

## 📱 User Flow

```
Start
  ↓
AI: "What type of legal matter?"
  ↓
User: Selects category
  ↓
AI: "Describe what happened"
  ↓
User: Types description
  ↓
AI: Asks follow-up questions
  ↓
User: Responds (text/chips/options)
  ↓
[Repeat until complete]
  ↓
Preview & Edit
  ↓
Finalize
  ↓
Done!
```

## 🎯 Key Features to Try

### 1. Suggestion Chips

When AI asks a question, look for horizontal scrollable chips below the message. Tap to quickly select.

### 2. MCQ Options

For objective questions, you'll see multiple choice options. Tap to select, checkmark appears.

### 3. Preview Mode

Tap the document icon in the header to see your case summary. Tap any field to edit.

### 4. Free Text

For detailed responses, type in the input box at the bottom. Supports multiple lines.

### 5. Edit Anytime

In preview mode, tap the edit icon on any section to modify it.

## 🎨 Customization

### Change AI Behavior

Edit `src/features/case-builder/services/groq.service.ts`:

```typescript
private static systemPrompt = `
  Your custom instructions here...
`;
```

### Modify Question Flow

Edit `src/features/case-builder/hooks/useCaseBuilder.ts`:

```typescript
const processUserResponse = async (userInput: string) => {
  // Add your custom logic
};
```

### Adjust Styling

All components use Tailwind classes. Example:

```typescript
// In ConversationMessage.tsx
className = "bg-legal-ice dark:bg-neutral-900";
// Change to your colors
```

### Add New Case Categories

Edit `src/features/case-builder/constants/caseCategories.ts`:

```typescript
export const CASE_CATEGORIES = [
  {
    id: "your-category",
    label: "Your Category",
    value: "your-category",
    description: "Description here",
    icon: "🏛️",
  },
  // ... existing categories
];
```

## 🔧 Troubleshooting

### AI Not Responding

1. Check internet connection
2. Verify API key in `groq.service.ts`
3. Check console for errors
4. Try restarting the app

### Messages Not Showing

1. Check if `messages` array is updating
2. Verify ScrollView is rendering
3. Check animation delays
4. Look for console errors

### Styling Issues

1. Ensure NativeWind is configured
2. Check dark mode toggle
3. Verify Tailwind classes
4. Clear cache and rebuild

### Keyboard Issues

1. Check KeyboardAvoidingView props
2. Verify keyboard dismiss logic
3. Test on both iOS and Android
4. Check input focus handling

## 📚 Documentation

- **README.md**: Feature overview and architecture
- **USAGE.md**: Detailed user guide with examples
- **IMPLEMENTATION.md**: Technical implementation details
- **DESIGN_DECISIONS.md**: Design philosophy and approach
- **QUICKSTART.md**: This file - get started quickly

## 🎓 Learn More

### Understanding the Code

**Main Screen:**

```typescript
// src/features/case-builder/screens/CaseBuilderScreen.tsx
// - Handles UI and user interactions
// - Manages preview toggle
// - Coordinates components
```

**Conversation Logic:**

```typescript
// src/features/case-builder/hooks/useCaseBuilder.ts
// - Manages conversation state
// - Processes user responses
// - Calls AI service
// - Updates case data
```

**AI Service:**

```typescript
// src/features/case-builder/services/groq.service.ts
// - Handles Groq API calls
// - Generates follow-up questions
// - Analyzes case completeness
// - Creates summaries
```

**Components:**

```typescript
// src/features/case-builder/components/
// - ConversationMessage: Display messages
// - SuggestionChips: Quick replies
// - QuestionOptions: MCQ selections
// - CaseBuilderInput: Custom input
// - CasePreviewCard: Case summary
// - TypingIndicator: AI thinking
```

## 🚀 Next Steps

### Immediate

1. ✅ Test the basic flow
2. ✅ Try all input types
3. ✅ Test preview mode
4. ✅ Test dark mode

### Short Term

1. 🔄 Customize AI prompts for your use case
2. 🔄 Add your branding
3. 🔄 Adjust colors if needed
4. 🔄 Add analytics tracking

### Long Term

1. 📋 Add voice input
2. 📋 Implement document upload
3. 📋 Add case templates
4. 📋 Integrate with backend

## 💡 Tips

### For Best Results

1. **Be Specific**: The more details you provide, the better
2. **Use Suggestions**: They're optimized for common responses
3. **Preview Often**: Check your progress regularly
4. **Edit Freely**: Don't worry about mistakes, you can edit anytime
5. **Take Your Time**: No rush, conversation is saved

### For Developers

1. **Read the Docs**: Start with README.md
2. **Check Types**: TypeScript interfaces in types/case.types.ts
3. **Test Thoroughly**: Try different case types
4. **Monitor API**: Watch for rate limits
5. **Optimize**: Profile performance on real devices

## 🤝 Support

### Getting Help

1. Check documentation files
2. Review console logs
3. Test API connectivity
4. Verify component props
5. Check state management

### Common Issues

**"AI not responding"**
→ Check API key and internet connection

**"Messages not appearing"**
→ Check state updates and ScrollView

**"Keyboard covering input"**
→ Adjust KeyboardAvoidingView offset

**"Animations laggy"**
→ Enable useNativeDriver where possible

**"Dark mode not working"**
→ Check useLegalTheme hook

## 🎉 You're Ready!

The AI Case Builder is fully functional and ready to use. Start by opening the "Create Case" tab in your app and follow the AI's guidance.

**Happy case building!** ⚖️✨

---

**Need more help?** Check the other documentation files:

- Technical details → IMPLEMENTATION.md
- User guide → USAGE.md
- Design philosophy → DESIGN_DECISIONS.md
- Feature overview → README.md
