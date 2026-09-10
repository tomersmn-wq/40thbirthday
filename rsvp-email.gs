/* Email Dor a copy of every RSVP that lands in the linked Sheet.
   This runs inside Google, so there is no FormSubmit and no activation link.

   One-time setup (you, as the Sheet owner):
   1. Open the RSVP responses spreadsheet.
   2. Extensions → Apps Script. Paste this file. Save.
   3. Run `install` once. Google will ask to allow sending email. Approve.
   4. Submit a test RSVP. Dor should get a normal mail with the answers.
*/

var ORGANIZER_EMAIL = "dornetzer66@gmail.com";

function install() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "emailOrganizer") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("emailOrganizer")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();
}

function emailOrganizer(e) {
  var lines = [];
  var who = "";
  if (e && e.namedValues) {
    Object.keys(e.namedValues).forEach(function (key) {
      var val = e.namedValues[key];
      var text = Array.isArray(val) ? val.filter(Boolean).join(", ") : String(val || "");
      if (/^Timestamp$/i.test(key)) return;
      lines.push(key + ": " + text);
      if (!who && /שם|name/i.test(key)) who = text;
    });
  } else if (e && e.values) {
    lines = e.values.map(String);
  }
  MailApp.sendEmail({
    to: ORGANIZER_EMAIL,
    subject: "RSVP — TAVERNA TAKE OVER" + (who ? " — " + who : ""),
    body: lines.join("\n") || "(empty submission)",
  });
}
