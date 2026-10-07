/**
 * Kişisel OS — Siri Kısayolları → Google Sheets köprüsü
 *
 * Kurulum:
 * 1. Google Sheets dosyanı aç → Uzantılar → Apps Script.
 * 2. Bu dosyanın tamamını yapıştır, TOKEN'ı kendine özel bir kelimeyle değiştir.
 * 3. Dağıt → Yeni dağıtım → Tür: Web uygulaması
 *    Yürütme: Ben · Erişim: Herkes → Dağıt → URL'yi kopyala.
 * 4. Kısayollarda "URL'nin İçeriklerini Al" eylemine bu URL'yi yaz (Yöntem: POST, İstek gövdesi: JSON).
 *
 * Tek kayıt:   {"token":"...","modul":"saglik","alan":"sigara","deger":1}
 * Çoklu kayıt: {"token":"...","kayitlar":[{"alan":"keyif","deger":7,"not":"sabah"},{"alan":"agri","deger":2,"not":"sabah"}]}
 * Serbest söz: {"token":"...","alan":"serbest","deger":"2 sigara içtim, keyfim 7, 500 ml su"}
 *
 * Her kayıt "Kayıtlar" sekmesine uzun formatta tek satır olarak eklenir:
 * id | zaman | tarih | modul | alan | deger | not
 * Kişisel OS uygulaması bu sekmeyi okuyup kayıtları içe aktarır.
 */
const TOKEN = "BURAYA-GIZLI-KELIME";
const SHEET = "Kayıtlar";
const HEADER = ["id", "zaman", "tarih", "modul", "alan", "deger", "not"];

function doPost(e) {
  let body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || "{}"); }
  catch (err) { return out({ ok: false, hata: "Gövde JSON değil" }); }
  if (body.token !== TOKEN) return out({ ok: false, hata: "Token hatalı" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
  }
  const tz = ss.getSpreadsheetTimeZone();
  const now = new Date();
  const list = Array.isArray(body.kayitlar) ? body.kayitlar : [body];
  const rows = list.map(function (k) {
    return [
      Utilities.getUuid().slice(0, 8),
      Utilities.formatDate(now, tz, "yyyy-MM-dd HH:mm"),
      k.tarih || Utilities.formatDate(now, tz, "yyyy-MM-dd"),
      k.modul || "",
      k.alan || "",
      k.deger === undefined ? "" : k.deger,
      k.not || "",
    ];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADER.length).setValues(rows);
  return out({ ok: true, eklenen: rows.length });
}

function doGet() {
  return out({ ok: true, mesaj: "Kişisel OS köprüsü çalışıyor" });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
