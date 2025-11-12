# Kepala Dinas Account Credentials

## Login Information

**Email:** `kepaladinas@dpmd.bogorkab.go.id`  
**Password:** `password`

## Role
- `kepala_dinas`

## Dashboard Access
- URL: `/kepala-dinas/dashboard`
- Features:
  - Summary cards (Total BUMDes, Musdesus, Perjalanan Dinas)
  - Bar chart: BUMDes per Kecamatan (Top 10)
  - Pie chart: BUMDes Status (Aktif/Non-Aktif)
  - Line chart: 12-month trends across all modules
  - Bar chart: Perjalanan Dinas per Bidang
  - Financial metrics cards (Total Aset, Omzet, SHU, Average Aset)

## API Endpoint
- `GET /api/kepala-dinas/dashboard`
- Protected by JWT authentication
- Requires role: `kepala_dinas` or `superadmin`

## Features Implemented
✅ Backend controller with comprehensive statistics aggregation
✅ Protected routes with role-based access control
✅ Modern dashboard UI with Recharts visualizations
✅ Responsive design with Tailwind CSS
✅ Real-time data from database
✅ Auto-redirect after login to kepala dinas dashboard
✅ Error handling with user-friendly messages

## Database Entry
User created via SQL seeder: `add_kepala_dinas_user.sql`
- Table: `users`
- Role: `kepala_dinas`
- Status: Active
