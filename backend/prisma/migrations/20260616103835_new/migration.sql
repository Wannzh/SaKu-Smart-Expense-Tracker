-- AlterTable
ALTER TABLE "categories" RENAME CONSTRAINT "Category_pkey" TO "categories_pkey";

-- AlterTable
ALTER TABLE "chat_messages" RENAME CONSTRAINT "ChatMessage_pkey" TO "chat_messages_pkey";

-- AlterTable
ALTER TABLE "chat_sessions" RENAME CONSTRAINT "ChatSession_pkey" TO "chat_sessions_pkey";

-- AlterTable
ALTER TABLE "receipts" RENAME CONSTRAINT "Receipt_pkey" TO "receipts_pkey";

-- AlterTable
ALTER TABLE "transactions" RENAME CONSTRAINT "Transaction_pkey" TO "transactions_pkey";

-- AlterTable
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- RenameForeignKey
ALTER TABLE "chat_messages" RENAME CONSTRAINT "ChatMessage_sessionId_fkey" TO "chat_messages_sessionId_fkey";

-- RenameForeignKey
ALTER TABLE "chat_sessions" RENAME CONSTRAINT "ChatSession_userId_fkey" TO "chat_sessions_userId_fkey";

-- RenameForeignKey
ALTER TABLE "receipts" RENAME CONSTRAINT "Receipt_transactionId_fkey" TO "receipts_transactionId_fkey";

-- RenameForeignKey
ALTER TABLE "transactions" RENAME CONSTRAINT "Transaction_categoryId_fkey" TO "transactions_categoryId_fkey";

-- RenameForeignKey
ALTER TABLE "transactions" RENAME CONSTRAINT "Transaction_subCategoryId_fkey" TO "transactions_subCategoryId_fkey";

-- RenameForeignKey
ALTER TABLE "transactions" RENAME CONSTRAINT "Transaction_userId_fkey" TO "transactions_userId_fkey";

-- RenameForeignKey
ALTER TABLE "transactions" RENAME CONSTRAINT "Transaction_walletId_fkey" TO "transactions_walletId_fkey";

-- RenameIndex
ALTER INDEX "Receipt_transactionId_key" RENAME TO "receipts_transactionId_key";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "users_email_key";
