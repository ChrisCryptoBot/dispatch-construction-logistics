#!/bin/bash
# Script to update pagination in all route files

# Add pagination import to each route file
for file in src/routes/users.js src/routes/organizations.js src/routes/marketplace.js src/routes/carrier.js; do
  if [ -f "$file" ]; then
    # Check if pagination is already imported
    if ! grep -q "parsePagination" "$file"; then
      # Add import after prisma import
      sed -i "s|const { prisma } = require('../db/prisma');|const { prisma } = require('../db/prisma');\nconst { parsePagination, createPaginationMeta, parseSorting } = require('../utils/pagination');|" "$file"
      echo "✅ Updated imports in $file"
    fi
  fi
done

echo "✅ Pagination helper added to all route files!"
echo "Note: Individual endpoints still need manual updates for best results"

