# TODO: Add Search Functionality to Jobs Page

## Tasks
- [ ] Add search input field in the header section next to the "Add New Job" button
- [ ] Introduce a new state variable `searchQuery` to hold the user's search input
- [ ] Implement filtering logic to filter jobs where any field contains the search query (case-insensitive)
- [ ] Update the table to render the filtered jobs instead of all jobs
- [ ] Ensure search matches partial strings and works across all job fields (S/N, Consignee, BL Number, Container Size, Terminal, Status, ETA, Refund Status, Files)

## Followup Steps
- [ ] Test the search functionality to ensure it filters correctly by any job field
- [ ] Verify that the search is case-insensitive and handles partial matches
