-- RenameTable: User → users
ALTER TABLE "User" RENAME TO "users";

-- RenameTable: Category → categories
ALTER TABLE "Category" RENAME TO "categories";

-- RenameTable: Transaction → transactions
ALTER TABLE "Transaction" RENAME TO "transactions";

-- RenameTable: Receipt → receipts
ALTER TABLE "Receipt" RENAME TO "receipts";

-- RenameTable: ChatSession → chat_sessions
ALTER TABLE "ChatSession" RENAME TO "chat_sessions";

-- RenameTable: ChatMessage → chat_messages
ALTER TABLE "ChatMessage" RENAME TO "chat_messages";
