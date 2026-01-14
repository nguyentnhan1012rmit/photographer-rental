-- -----------------------------------------------------------------------------
-- 03_chat_features.sql
-- Enable users to delete their own messages and conversations
-- -----------------------------------------------------------------------------

-- Policy to allow users to delete their own messages (either sender or receiver)
-- Note: A "delete" here removes it for BOTH users currently.
-- A more advanced "hide" feature would require a 'deleted_by' array column, but for now we do hard delete.
create policy "Users can delete their own messages"
  on messages for delete
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );
