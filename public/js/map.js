var map;
var latValue,lngValue;
var count = 0;
let marker = null;
var flag = false
const auth = firebase.auth()
const firestore = firebase.firestore()
const database = firebase.database()
const lat = document.getElementById('lat')
const long = document.getElementById('long')
const details = document.getElementById('details')
const quality = document.getElementById('quality')
const price = document.getElementById('price')
const loc = document.getElementById('location')
const holder = document.getElementById('search-results')
auth.onAuthStateChanged((user)=>{
  if(user == null)
      window.location.href="index.html"
})
function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}
function distance(lat1, lon1, lat2, lon2) {
  if(lat1 === "" || lon1 === "" || lat2 === "" || lon2 === "")
      return 0 
	if ((lat1 === lat2) && (lon1 === lon2)) {
		return 0;
	}
	else {
    lat1 = parseFloat(lat1)
    lat2 = parseFloat(lat2)
    lon1 = parseFloat(lon1)
    lon2 = parseFloat(lon2)
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		var dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
    dist = dist * 1.609344 
		return dist
	}
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
async function changePassword()
{
  auth.sendPasswordResetEmail(auth.currentUser.email).then(function(){
  }).catch(function(error) {
    console.log(error)
  });
}
async function init()
{
    console.log('Init')
    $('#add-place').hide()
    $('#search-results').hide()
    const autocomplete = new google.maps.places.Autocomplete(loc);
    google.maps.event.addListener(autocomplete, 'place_changed', function() 
    { 
        var place = autocomplete.getPlace()
        loc.value = place.name;
        latValue = place.geometry.location.lat()
        lngValue = place.geometry.location.lng()
    });
}
async function search()
{
    var result = []
    var location = document.getElementById('location')
    if(!location.value || location.value === "")
    {
      Swal.fire('Error!!!','Search field cannot be empty','error')
      return 
    }
    const snapshot = await firebase.firestore().collection('locations').get()
    var res = await snapshot.docs.map(doc => doc.data());
    res.forEach(element => 
    {
        var dist = distance(element["latitude"],element["longitude"],latValue,lngValue)  
        if(dist <= 10.0)
        {
            element['distance'] = round(dist,2)
            result.push(element)
        }
    });
    result.forEach( e => {
       holder.innerHTML = holder.innerHTML+createNode(e)
    })
    $('#search-results').show() 
}
function addMarker(lat, lng) {
  var pt = new google.maps.LatLng(lat, lng);
  map.setCenter(pt);
  map.setZoom(19);
  const Marker =new google.maps.Marker({
      position : pt,
      map:map
  });
}
function createNode(element)
{
  return `
          <div class="card id element">
            <div class="card-body">
              <h5 class="card-title"> Distance : ${element['distance']}km</h5>
              <h6 class="card-subtitle mb-2 text-muted">Price : ${element['price']}||&nbsp;||Qualtiy : ${element['quality']}</h6>
              <p class="card-text"><h6>How to Reach : </h6><h6>${element['details']}</h6></p>
              <a class="card-link" onclick="addMarker(${element['latitude']},${element['longitude']})">View Location</a>
            </div>
          </div>`
}
function randomString(length) 
{
   const chars = '0123456789'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
function validate()
{
  var x = quality.options[quality.selectedIndex].value
  var y = price.options[price.selectedIndex].value
  if(!lat.value || lat.value == "")
  {
      Swal.fire('Incomplete!!','Latitude field cannot be empty','error')
      return false
  }
  if(!long.value || long.value == "")
  {
      Swal.fire('Incomplete!!','Longitude field cannot be empty','error')
      return false
  }
  if(!details.value || details.value == "")
  {
      Swal.fire('Incomplete!!','Directions field cannot be empty','error')
      return false
  }
  if(!x || x == "")
  {
      Swal.fire('Incomplete!!','Quality field cannot be empty','error')
      return false
  }
  if(!y || y == "")
  {
      Swal.fire('Incomplete!!','Price field cannot be empty','error')
      return false
  }
  return true;
}
async function submit()
{
  try 
  {
    document.getElementById('submitbtn').classList.add('running');
    if(validate() == false)
    {
      document.getElementById('submitbtn').classList.remove("running")
      return;
    }
    const id = randomString(5)
    const obj = {
      "latitude" : lat.value,
      "longitude" : long.value,
      "details" : details.value,
      "quality" : quality.options[quality.selectedIndex].value,
      "price" : price.options[price.selectedIndex].value,
      "addedby" : auth.currentUser.email
    }
    var result =await firestore.collection("locations").doc(id).set(obj)
    var final = await database.ref('LocationAdd').push({
      "id" : id,
      "date-time" : getDate(),
      "addedBy" : auth.currentUser.email
    })
    Swal.fire("Success!!","The location has been successfully added",'success') 
    document.getElementById('submitbtn').classList.remove("running")
  }catch(error) 
  {
      Swal.fire(error.code,error.message,'error') 
  }
  finally{
     console.log("Done")
  }
}
function placeMarker(location) 
{
  if(flag == false)
  {
      marker = new google.maps.Marker(
        {
          position: location, 
          map: map
        });
      flag = true
      
  }else
  {
      marker.setPosition(location);
  }
  lat.value = location.lat();
  long.value = location.lng();
}
async function logout()
{
   var s = await auth.signOut()
   window.location.href = "index.html"
}
function viewProfile()
{
  window.location.href = "profile.html"
} 
$('#close').on('click',()=>{
  $('#add-place').hide()
  google.maps.event.clearListeners(map, 'click');
})
$('#add').on('click',()=>{
  $('#add-place').show()
  google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  })
  if(count == 0)
  {  
    Swal.fire('Info','Place marker on map to fill up latitude and longitude fields','info')
    count = 1
  }
  
})
function initMap() 
{
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 22.565571, lng: 88.370209},
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false,
    mapTypeControl: false,
    zoomControl:false,
    fullscreenControl: false,
    zoom: 15
  });

  var controlDiv = document.getElementById('floating-panel');
  var controlPanel = document.getElementById('control-panel')
  var addPlace = document.getElementById('add-place')
  var searchResults = document.getElementById('search-results')
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlPanel);
  map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(addPlace);
  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(searchResults);
}
