# 📊 Google Sheets Automation Setup

Follow these steps to automatically sync your bookings to a Google Spreadsheet.

## 1. Create your Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name it (e.g., `KPS Travels Bookings`).
3. Set up the following headers in the **first row (A1 to J1)**:
   - `ID`
   - `Date Received`
   - `Customer Name`
   - `Phone`
   - `Pickup Location`
   - `Drop City`
   - `Car Type`
   - `Travel Date`
   - `Status`
   - `Final Amount (₹)`

## 2. Add the Automation Script
1. In your Google Sheet, click on **Extensions > Apps Script**.
2. Delete any code there and paste the following:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if (action === "new_inquiry") {
    // Add a new row for a new booking
    sheet.appendRow([
      data.id,
      new Date(),
      data.name,
      data.phone,
      data.pickup,
      data.drop,
      data.car,
      data.date,
      data.status,
      "" // Empty price for new inquiry
    ]);
  } 
  else if (action === "update_status") {
    // Find the existing row by ID and update the status and price
    var idToFind = data.id.toString();
    var rows = sheet.getDataRange().getValues();
    
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0].toString() === idToFind) {
        var rowNum = i + 1;
        // Update Status (Column I - index 8)
        sheet.getRange(rowNum, 9).setValue(data.status);
        // Update Price if completed (Column J - index 9)
        if (data.status === "Completed" && data.price) {
          sheet.getRange(rowNum, 10).setValue(data.price);
        }
        break;
      }
    }
  }
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
}
```

## 3. Deploy as a Web App
1. Click the **Deploy** button (top right) and choose **New deployment**.
2. Select type: **Web app**.
3. Fill in the description: `KPS Booking Automation`.
4. Execute as: **Me**.
5. Who has access: **Anyone** (This is required for the PHP script to reach it).
6. Click **Deploy**.
7. **IMPORTANT**: Copy the "Web app URL" provided.

## 4. Final Step: Link to Website
1. Open your project file: `d:\KPS Site\KPS\api\config.php`.
2. Find the line: `define('GOOGLE_SHEET_WEBHOOK', '');`
3. Paste your URL inside the quotes: `define('GOOGLE_SHEET_WEBHOOK', 'YOUR_URL_HERE');`

---
**Done!** Now, every time a new booking is made or a status is updated in your dashboard, it will automatically appear in your Google Spreadsheet!
