/**
 * Tidy & Lightweight Google Form Coordinate Extractor
 * 
 * What it does:
 * 1. Standardises the 'Date' column to YYYY-MM-DD text.
 * 2. Finds the 'Lat' and 'Lng' columns (creates them if missing).
 * 3. Expands the shared Google Maps URL to extract verified venue coordinates (!3d / !4d).
 * 4. Stuffs pure numbers into Lat and Lng, or leaves them blank if not found.
 * 
 * Trigger: On form submit (from spreadsheet)
 */
function onFormSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = e && e.range ? e.range.getSheet() : (ss.getSheetByName('Form Responses 1') || ss.getActiveSheet());
  var row = e && e.range ? e.range.getRow() : sheet.getLastRow();
  
  if (row <= 1) return; // Skip header row
  
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return;
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // 1. Standardise Date to YYYY-MM-DD (if a date column exists)
  var dateCol = -1;
  for (var d = 0; d < headers.length; d++) {
    var hd = String(headers[d] || '').trim().toLowerCase();
    if (hd === 'date' || hd === 'timestamp' || hd === 'visit date') {
      dateCol = d + 1;
      break;
    }
  }
  
  if (dateCol > 0) {
    var rawDate = sheet.getRange(row, dateCol).getValue();
    if (rawDate) {
      var dateObj = new Date(rawDate);
      if (!isNaN(dateObj.getTime())) {
        var formattedDate = Utilities.formatDate(dateObj, ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
        var dateCell = sheet.getRange(row, dateCol);
        dateCell.setNumberFormat('@'); // Force plain text
        dateCell.setValue(formattedDate);
      }
    }
  }
  
  // 2. Locate or create Lat and Lng columns
  var latCol = headers.indexOf('Lat') + 1;
  var lngCol = headers.indexOf('Lng') + 1;
  
  if (latCol === 0) {
    sheet.getRange(1, lastCol + 1).setValue('Lat');
    latCol = lastCol + 1;
    lastCol++;
  }
  if (lngCol === 0) {
    sheet.getRange(1, lastCol + 1).setValue('Lng');
    lngCol = lastCol + 1;
    lastCol++;
  }
  
  // 3. Locate the Google Maps Link column
  var mapsCol = -1;
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i] || '').trim().toLowerCase();
    // Exclude website / venue url columns so we target only the Maps link
    if ((h.indexOf('map') !== -1 || h.indexOf('link') !== -1 || h.indexOf('url') !== -1) &&
        h.indexOf('venue') === -1 && h.indexOf('website') === -1 && h.indexOf('visit') === -1) {
      mapsCol = i + 1;
      break;
    }
  }
  
  // Fallback check if headers are named simply 'Link' or 'Map'
  if (mapsCol === -1) {
    for (var j = 0; j < headers.length; j++) {
      var hj = String(headers[j] || '').trim().toLowerCase();
      if (hj === 'map' || hj === 'maps' || hj === 'link' || hj === 'google maps') {
        mapsCol = j + 1;
        break;
      }
    }
  }
  
  if (mapsCol === -1) {
    Logger.log('Could not find Google Maps link column.');
    return;
  }
  
  var mapsUrl = sheet.getRange(row, mapsCol).getValue();
  if (!mapsUrl || typeof mapsUrl !== 'string') return;
  mapsUrl = mapsUrl.trim();
  
  try {
    // 4. Follow redirect to expand short URL (e.g. maps.app.goo.gl)
    var response = UrlFetchApp.fetch(mapsUrl, { followRedirects: true, muteHttpExceptions: true });
    var content = response.getContentText();
    
    // 5. Look strictly for verified venue pin coordinates (!3d<lat>!4d<lng>)
    var matchBang = content.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    
    if (matchBang) {
      var lat = parseFloat(matchBang[1]);
      var lng = parseFloat(matchBang[2]);
      sheet.getRange(row, latCol).setValue(lat);
      sheet.getRange(row, lngCol).setValue(lng);
      Logger.log('Row ' + row + ' verified coordinates saved: ' + lat + ', ' + lng);
    } else {
      sheet.getRange(row, latCol).clearContent();
      sheet.getRange(row, lngCol).clearContent();
      Logger.log('Row ' + row + ': Verified venue pin not found in URL. Left blank.');
    }
  } catch (err) {
    Logger.log('Error expanding Maps link on row ' + row + ': ' + err.message);
  }
}
