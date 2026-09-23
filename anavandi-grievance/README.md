# KSRTC Grievance Management System

A unified platform for managing passenger complaints, empowering depot and regional officers to resolve issues efficiently within SLA deadlines.

## How to run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## How to build
1. Run the build command:
   ```bash
   npm run build
   ```
2. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Demo Flow
To test out the capabilities of this system:
1. **Report**: Go to `/report` and submit a new passenger complaint.
2. **Depot**: Select a depot from the header dropdown to view the newly assigned complaint in the Inbox.
3. **Jump Clock**: Navigate to `/demo` and use the "+24h" buttons to simulate the passage of time.
4. **Escalated**: Check the depot's Escalated tab to see SLA breaches automatically flagged.
5. **Dashboard**: Navigate to `/dashboard` (or select "HQ" from the header) to view realtime metrics.
