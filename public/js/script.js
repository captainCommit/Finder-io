const database = firebase.database()
const auth = firebase.auth()
auth.onAuthStateChanged((user)=>{
    if(user != null)
        window.location.href="map.html"
})
function seePassword() {
    var x = document.getElementById("pass");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }
async function check()
{
    var user = await auth.currentUser
    if(user != null)
        window.location.href="map.html"
}
function getDate()
{
    var d = new Date(),
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'pm' : 'am',
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return days[d.getDay()]+' '+months[d.getMonth()]+' '+d.getDate()+' '+d.getFullYear()+' '+hours+':'+minutes+ampm;
}
function setCookie(cname, cvalue, exhours) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) 
    {
        var c = ca[i];
        while (c.charAt(0) == ' ') 
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) 
            return c.substring(name.length, c.length);
    }
    return "";
}
  
function checkCookie(cname) {
    var value = getCookie(cname);
    if (value != "") {
        return false
    }
    else {
        if (value != "" && value != null) {
            setCookie(cname,value, 3);
        }
        return value
    }
} 
function register()
{
    $("#signup-modal").modal().show();
}
function login()
{
    $("#login-modal").modal().show();
}
async function signIn()
{
    var email = document.getElementById('email').value
    var password = document.getElementById('pass').value
    try{
        var x = await auth.signInWithEmailAndPassword(email,password)
        window.location.href = "map.html"
    }
    catch(e)
    {
        Swal.fire("Oops!!",e.message,"error")
    }
}
async function signUp()
{
    const email = document.getElementById('emailinv').value
    const date = getDate();
    try
    {
        var ref = await database.ref("InviteRequests").push({
            "email" : email,
            "time" : date
        })
        Swal.fire('Yayy!!','Your request has been submitted successfully','success')
    }
    catch(error)
    {
        Swal.fire('Oops',error.message,'error')
    }
    finally{
        $("#signup-form").trigger("reset");
    }
}
