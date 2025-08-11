-- Clear all subscriptions first (due to foreign key constraints)
DELETE FROM "Subscription";

-- Clear all packages
DELETE FROM "Package";

-- Reset auto-increment sequences
ALTER SEQUENCE "Package_id_seq" RESTART WITH 1;
