const APP_NAME = "Murad Bari Social Welfare & Fund Management System v2";
const DEFAULT_ADMIN_ID = "admin";
const DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";

const SHEETS = {
  SETTINGS:"Settings", USERS:"Users", ACTIVITIES:"Activities", DONORS:"Donors",
  COLLECTIONS:"Collections", EXPENSES:"Expenses", CUSTODY:"FundCustody",
  TRANSFERS:"FundTransfers", AUDIT:"AuditLog"
};

function doGet(){
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle(APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setupSystem(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schemas = {
    Settings:["key","value"],
    Users:["id","passwordHash","role","name","active","createdAt"],
    Activities:["id","year","name","purpose","openingBalance","status","createdAt"],
    Donors:["id","name","country","area","phone","note","createdAt"],
    Collections:["id","activityId","donorId","amount","method","date","note","createdAt"],
    Expenses:["id","activityId","date","recipient","category","amount","method","voucherNo","note","createdAt"],
    FundCustody:["id","locationType","custodianName","amount","date","reason","terms","witnesses","expectedReturnDate","status","note","createdAt"],
    FundTransfers:["id","custodyId","type","amount","date","note","createdAt"],
    AuditLog:["id","userId","action","entity","entityId","details","createdAt"]
  };
  Object.entries(schemas).forEach(([name,headers])=>{
    let sh=ss.getSheetByName(name);
    if(!sh) sh=ss.insertSheet(name);
    if(sh.getLastRow()===0) sh.appendRow(headers);
  });
  const users=ss.getSheetByName("Users");
  if(users.getLastRow()<2) users.appendRow([
    DEFAULT_ADMIN_ID,hashPassword_(DEFAULT_ADMIN_PASSWORD),"admin","Administrator",true,new Date()
  ]);
  return {success:true,message:"System initialized successfully"};
}

function hashPassword_(password){
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,password,Utilities.Charset.UTF_8
  ).map(b=>(b<0?b+256:b).toString(16).padStart(2,"0")).join("");
}

function login(id,password){
  setupSystem();
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const rows=sh.getDataRange().getValues();
  const hash=hashPassword_(password);
  for(let i=1;i<rows.length;i++){
    if(String(rows[i][0])===String(id)&&rows[i][1]===hash&&rows[i][4]===true){
      audit_(id,"LOGIN","Users",id,"Successful login");
      return {success:true,user:{id,role:rows[i][2],name:rows[i][3]}};
    }
  }
  return {success:false,message:"Invalid ID or password"};
}

function adminAction(id,password,action){
  const r=login(id,password);
  if(!r.success||r.user.role!=="admin") return {success:false,message:"Admin authentication required"};
  if(!["DELETE","RESTORE","RESET"].includes(action)) return {success:false,message:"Invalid protected action"};
  audit_(id,action,"SYSTEM","","Protected action authorized");
  return {success:true,message:"Authorized: "+action};
}

function getData(){
  setupSystem();
  return {
    activities:readSheet_("Activities"), donors:readSheet_("Donors"),
    collections:readSheet_("Collections"), expenses:readSheet_("Expenses"),
    custody:readSheet_("FundCustody")
  };
}

function readSheet_(name){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  const v=sh.getDataRange().getValues();
  if(v.length<2)return[];
  return v.slice(1).map(row=>{
    const o={};v[0].forEach((h,i)=>o[h]=row[i]);return o;
  });
}

function addRecord(sheetName,obj,userId){
  setupSystem();
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const id=Utilities.getUuid();
  sh.appendRow(headers.map(h=>h==="id"?id:h==="createdAt"?new Date():(obj[h]??"")));
  audit_(userId||"admin","CREATE",sheetName,id,JSON.stringify(obj));
  return {success:true,id};
}

function audit_(userId,action,entity,entityId,details){
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("AuditLog");
  if(sh)sh.appendRow([Utilities.getUuid(),userId,action,entity,entityId,details,new Date()]);
}
