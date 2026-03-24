-- Correct SHA-256 hashes for seeded demo tokens so auth validation matches docs/frontend.

UPDATE api_keys
SET key_hash = 'ed349398756ede88d21aab27821a5c0b98ac4057f0ce34b1c2ccfb74b1bd858f'
WHERE id = 'c0000000-0000-0000-0000-000000000001';

UPDATE api_keys
SET key_hash = '8866f48cb87eb6f27f83046cf6dc5f4ded50ef062fc51c57986c5766467fc067'
WHERE id = 'c0000000-0000-0000-0000-000000000002';

UPDATE api_keys
SET key_hash = '12871ac7f15eed707b2ed3c22a3c14bb9e37405b2c495ec32cf5c08e78e7b6e7'
WHERE id = 'c0000000-0000-0000-0000-000000000003';
