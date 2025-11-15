-- Rollback migration to remove notification system
-- This removes all tables, functions, triggers, and policies created for notifications

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_message_insert_notify ON messages;

-- Drop functions
DROP FUNCTION IF EXISTS trigger_message_notification() CASCADE;
DROP FUNCTION IF EXISTS get_notification_preferences(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_pending_notifications() CASCADE;
DROP FUNCTION IF EXISTS update_notification_status(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_notification_preferences_updated_at() CASCADE;

-- Drop tables (CASCADE will remove dependent objects like indexes)
DROP TABLE IF EXISTS notification_log CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;




