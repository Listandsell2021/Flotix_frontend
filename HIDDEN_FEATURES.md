# Hidden Features Documentation

## Purpose
This document tracks features that have been temporarily hidden but not deleted from the codebase for future use.

## Hidden Features

### 1. Export Buttons
**Date Hidden:** 2025-09-17
**Reason:** Temporarily disabled for initial release
**Location:** Multiple pages
**How to Re-enable:** Remove comments around Export buttons in the following files:

- `/src/app/(authenticated)/expenses/page.tsx` - Export button in header
- `/src/app/(authenticated)/drivers/page.tsx` - Export drivers data
- `/src/app/(authenticated)/system-users/page.tsx` - Export system users (line ~187)
- `/src/app/(authenticated)/companies/page.tsx` - Export companies (line ~264)
- `/src/app/(authenticated)/companies/[id]/page.tsx` - Export company data (line ~267)
- `/src/app/(authenticated)/audit/page.tsx` - Export audit logs (line ~154)
- `/src/app/(authenticated)/dashboard/admin/page.tsx` - Export data card (line ~256)
- `/src/app/(authenticated)/dashboard/page.tsx` - Export data card (line ~491)
- `/src/app/(authenticated)/reports/page.tsx` - Export functionality (lines 146-210)

### 2. Reports Section
**Date Hidden:** 2025-09-17
**Reason:** Feature not fully implemented yet
**Location:** Navigation sidebar
**How to Re-enable:**
1. Uncomment Reports item in `/src/components/layout/Sidebar.tsx` (adminSidebarItems array)
2. The Reports page component at `/src/app/(authenticated)/reports/page.tsx` remains intact

## Implementation Notes

### Export Button Pattern
All export buttons follow this pattern:
```jsx
{/* HIDDEN: Export functionality - Re-enable when export backend is ready */}
{/* <Button variant="outline">
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
  Export
</Button> */}
```

### To Re-enable All Features:
1. Search for "HIDDEN:" comments in the codebase
2. Uncomment the relevant code blocks
3. Test export functionality with backend API
4. Verify Reports page data loading and visualization

## Backend Requirements for Re-enabling
- Export endpoints for each data type (expenses, drivers, companies, etc.)
- CSV/Excel file generation
- Report generation API endpoints
- Data aggregation for reports dashboard

## Contact
For questions about these hidden features, contact the development team.