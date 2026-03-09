# Fix Folder Creation Issues

## Task
Fix the bug where:
1. New folders are saved outside the intended location
2. Save button doesn't work when creating folders

## Plan
- [ ] 1. Update `lib/company-files-context.tsx` - Change `createFolder` to accept `folderPath` instead of `parentId`
- [ ] 2. Update `components/kokonutui/company-files.tsx` - Pass `currentFolderPath` instead of `parentId`
- [ ] 3. Update `lib/documents-context.tsx` - Change `createFolder` to accept `folderPath` instead of `parentId`
- [ ] 4. Update `components/kokonutui/documents.tsx` - Pass `currentFolderPath` instead of `parentId`
