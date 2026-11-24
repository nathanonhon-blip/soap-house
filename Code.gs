// Google Apps Script backend สำหรับ Google Sheets
// สร้างชีตชื่อ Products และ Orders ตามหัวตารางใน README
// ตั้ง Script Property ADMIN_KEY ก่อน Deploy
const PRODUCT_HEADERS = ["SKU","Name","Description","Price","Stock","ImageURL","Active"];
const ORDER_HEADERS = ["OrderID","CreatedAt","Customer","Phone","Address","ItemsJSON","Total","Status","Tracking"];
function doGet(e){
  const action=(e.parameter.action||"").toLowerCase();
  if(action==="getproducts") return json_({ok:true,products:getProducts_()});
  if(action==="getorders"){
    if(!authorized_(e.parameter.key)) return json_({ok:false,error:"Unauthorized"});
    return json_({ok:true,orders:getOrders_()});
  }
  return json_({ok:true,message:"SOAP HOUSE API"});
}
function doPost(e){
  try{
    const body=JSON.parse(e.postData.contents||"{}");
    if(body.action==="createOrder") return json_({ok:true,orderId:createOrder_(body.order)});
    if(body.action==="updateOrder"){
      if(!authorized_(body.key)) return json_({ok:false,error:"Unauthorized"});
      updateOrder_(body); return json_({ok:true});
    }
    return json_({ok:false,error:"Unknown action"});
  }catch(err){return json_({ok:false,error:String(err)})}
}
function ss_(){return SpreadsheetApp.getActiveSpreadsheet()}
function sheet_(name,headers){
  let s=ss_().getSheetByName(name); if(!s)s=ss_().insertSheet(name);
  if(s.getLastRow()===0)s.appendRow(headers); return s;
}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function authorized_(key){return !!key && key===PropertiesService.getScriptProperties().getProperty("ADMIN_KEY")}
function getProducts_(){
  const s=sheet_("Products",PRODUCT_HEADERS),v=s.getDataRange().getValues();
  return v.slice(1).filter(r=>r[0] && String(r[6]).toLowerCase()!=="false").map(r=>({sku:String(r[0]),name:String(r[1]),desc:String(r[2]||""),price:Number(r[3]),stock:Number(r[4]),imageURL:String(r[5]||"")}));
}
function createOrder_(o){
  if(!o||!o.customer||!o.phone||!o.address||!Array.isArray(o.items)||!o.items.length)throw new Error("ข้อมูลคำสั่งซื้อไม่ครบ");
  const id="SH-"+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyMMdd-HHmmss");
  sheet_("Orders",ORDER_HEADERS).appendRow([id,new Date(),o.customer,o.phone,o.address,JSON.stringify(o.items),Number(o.total)||0,"รอหยิบสินค้า",""]);
  return id;
}
function getOrders_(){
  const s=sheet_("Orders",ORDER_HEADERS),v=s.getDataRange().getValues();
  return v.slice(1).filter(r=>r[0]).reverse().map(r=>({orderId:String(r[0]),createdAt:r[1],customer:r[2],phone:r[3],address:r[4],items:JSON.parse(r[5]||"[]"),total:Number(r[6]),status:String(r[7]),tracking:String(r[8]||"")}));
}
function updateOrder_(b){
  const s=sheet_("Orders",ORDER_HEADERS),v=s.getDataRange().getValues();
  for(let i=1;i<v.length;i++)if(String(v[i][0])===String(b.orderId)){s.getRange(i+1,8).setValue(b.status||"");s.getRange(i+1,9).setValue(b.tracking||"");return}
  throw new Error("ไม่พบ Order ID");
}