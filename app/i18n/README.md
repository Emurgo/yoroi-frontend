# Rebuilding language cache

After making changes that affect the languages files, please do the following **AFTER** backing up your work (these actions may edit your files in a way you would like to reverse).

1) `npm run purge-translations` (delete translation cache)
2) `npm run dev` (rebuild translation cache. Note: you **need** to do this but it doesn't have to be `dev`. Any task that causes a rebuild is fine.)
3) `npm run manage-translations` (check language config for mistakes. Note: auto-fix is dangerous)
