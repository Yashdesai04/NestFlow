// setup.js
const fs = require('fs');
const path = require('path');

const directories = [
  'lib',
  'components',
  'app/properties',
  'app/properties/[id]',
  'app/properties/[id]/apply',
  'app/dashboard/landlord',
  'app/dashboard/landlord/properties/new',
  'app/dashboard/landlord/bed-grid',
  'app/dashboard/landlord/applicants',
  'app/dashboard/tenant',
  'app/dashboard/tenant/payments',
  'app/dashboard/tenant/meals',
  'app/dashboard/admin',
  'app/dashboard/admin/kyc'
];

directories.forEach(dir => {
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
});

console.log('✅ All project directories generated successfully!');