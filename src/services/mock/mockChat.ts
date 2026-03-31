export interface Message {
  _id: number | string;
  text: string;
  createdAt: Date | number;
  user: {
    _id: number | string;
    name: string;
    avatar?: string;
  };
  system?: boolean;
}

export const MOCK_MESSAGES: Message[] = [
  {
    _id: 1,
    text: "Hello! How can I help you with your legal query today?",
    createdAt: new Date(),
    user: {
      _id: 2,
      name: "Adv. Priya Sharma",
      avatar: "https://i.pravatar.cc/150?u=priya",
    },
  },
  {
    _id: 2,
    text: "I have a question about property dispute.",
    createdAt: new Date(Date.now() - 60000),
    user: {
      _id: 1,
      name: "User",
    },
  },
];
