MURAD BARI SOCIAL WELFARE & FUND MANAGEMENT SYSTEM v2

এই ZIP-এ প্রথম runnable foundation build:
- বাংলা / English switch
- Login
- Dashboard
- Activities
- Donors / Collection
- Expenses / Assistance
- Fund Custody
- Protected Restore / Reset
- Audit Log
- Google Sheets database setup

SETUP:
1) Google Sheet খুলুন -> Extensions -> Apps Script.
2) Code.gs-এর কোড বসান।
3) index.html, app.js, style.css Apps Script project-এ HTML/JS/CSS হিসেবে যোগ করুন।
4) setupSystem() একবার Run করুন।
5) Deploy -> New deployment -> Web app.
6) Execute as: Me.
7) প্রয়োজন অনুযায়ী access সেট করুন।
8) নতুন /exec URL frontend-এর app.js-এ API_URL হিসেবে ব্যবহার করার প্রয়োজন নেই যদি Apps Script HTML হিসেবে serve করা হয়।
9) যদি GitHub Pages frontend ব্যবহার করেন, backend API-এর জন্য আলাদা CORS/endpoint design প্রয়োজন হবে।

DEFAULT ADMIN
ID: admin
Password: ChangeMe123!

প্রথম ব্যবহারের পর password পরিবর্তন করার production-grade UI যোগ করা উচিত।
