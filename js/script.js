function AppViewModel() {
	var self = this;
	this.searchStr = ko.observable("");
	this.locs = ko.observableArray([]);
	this.markers = ko.observableArray([]);

	$('#search').keyup(function () {
		var $sideLocs = $('#list-view a');
		var val = $(this).val().toLowerCase();
		$sideLocs.hide();
		self.markers().forEach(function (m) {
			m.setVisible(false);
		}, this);
		$sideLocs.each(function (index, el) {
			var thisText = $(this).text().toLowerCase();
			if (thisText.indexOf(val) > -1) {
				$(this).show();
				self.markers()[index].setVisible(true);
			}
		})
	});
}

// Activates knockout.js
var avm = new AppViewModel();
ko.applyBindings(avm);


window.onload = function () {

	$(".side-menu-trigger").sideNav({
		menuWidth: 300,
		edge: 'left',
		closeOnClick: true,
		draggable: true,
	});
	$(".side-menu-trigger").sideNav('show');

	$.getJSON('https://ipinfo.io/json', function (data) {
		// console.log(data)
		var myLoc = data.loc;
		var myLat = parseFloat(myLoc.split(',')[0])
		var myLng = parseFloat(myLoc.split(',')[1])
		initMap(myLat, myLng);
	})

}

function initMap(myLat, myLng) {
	var styles = [{
			elementType: 'geometry',
			stylers: [{
				color: '#242f3e'
			}]
		},
		{
			elementType: 'labels.text.stroke',
			stylers: [{
				color: '#242f3e'
			}]
		},
		{
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#746855'
			}]
		},
		{
			featureType: 'administrative.locality',
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#d59563'
			}]
		},
		{
			featureType: 'poi',
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#d59563'
			}]
		},
		{
			featureType: 'poi.park',
			elementType: 'geometry',
			stylers: [{
				color: '#263c3f'
			}]
		},
		{
			featureType: 'poi.park',
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#6b9a76'
			}]
		},
		{
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{
				color: '#38414e'
			}]
		},
		{
			featureType: 'road',
			elementType: 'geometry.stroke',
			stylers: [{
				color: '#212a37'
			}]
		},
		{
			featureType: 'road',
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#9ca5b3'
			}]
		},
		{
			featureType: 'road.highway',
			elementType: 'geometry',
			stylers: [{
				color: '#746855'
			}]
		},
		{
			featureType: 'road.highway',
			elementType: 'geometry.stroke',
			stylers: [{
				color: '#1f2835'
			}]
		},
		{
			featureType: 'road.highway',
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#f3d19c'
			}]
		},
		{
			featureType: 'transit',
			elementType: 'geometry',
			stylers: [{
				color: '#2f3948'
			}]
		},
		{
			featureType: 'transit.station',
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#d59563'
			}]
		},
		{
			featureType: 'water',
			elementType: 'geometry',
			stylers: [{
				color: '#17263c'
			}]
		},
		{
			featureType: 'water',
			elementType: 'labels.text.fill',
			stylers: [{
				color: '#515c6d'
			}]
		},
		{
			featureType: 'water',
			elementType: 'labels.text.stroke',
			stylers: [{
				color: '#17263c'
			}]
		}
	]


	var pos = {
		lat: myLat,
		lng: myLng
	};
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: pos,
		styles: styles
	});

	// Get Current address with lat lng - Not Neede so far
	/*
	$.getJSON('https://maps.googleapis.com/maps/api/geocode/json?latlng='+myLat+','+myLng+'&key=AIzaSyCdVCQ3Fr4ySpWtvNUytoyeDyao5beO6sQ', function (data) {
		console.log(data)
		console.log(data.results[0].formatted_address)
	})
	*/


	var service = new google.maps.places.PlacesService(map);
	var request = {
		location: new google.maps.LatLng(myLat, myLng),
		radius: '500',
		type: ['restaurant']
	};
	service.nearbySearch(request, function (results, status) {
		// console.log(results);
		results.forEach(function (nearbyLoc) {
			var thisLat = parseFloat(nearbyLoc.geometry.location.lat())
			var thisLng = parseFloat(nearbyLoc.geometry.location.lng())


			avm.locs.push({
				locName: nearbyLoc.name,
				locPos: {
					lat: thisLat,
					lng: thisLng,
				},
				data: ""
			})
		}, this);
		showMarkersForLocs()
	});


	function showMarkersForLocs() {
		var arr = avm.locs()
		arr.forEach(function (loc) {
			// console.log(loc);
			var marker = new google.maps.Marker({
				position: loc.locPos,
				map: map,
				title: loc.locName,
				animation: google.maps.Animation.DROP
			});

			avm.markers.push(marker);
			// var bounds = new google.maps.LatLngBounds();
			// bounds.extend(marker.getPosition());
			// map.fitBounds(bounds);

			var locData = "";
			$.ajax({
				url: 'https://api.foursquare.com/v2/venues/search?ll=' + loc.locPos.lat + ',' + loc.locPos.lng + '&v=20170717&client_id=UZUO4XYN2UOWGZ25MKT20VX30NUFW5Y4LTKYDRMSR4APIQ5P&client_secret=M30HEGVWKTOM5TKG2QSWGROL0TTAXUONEPBYO0E4FZHEWWHZ',
				dataType: 'jsonp',
				success: function (data) {
					// console.log(data.response.venues[0]);
					// element = data.response.venues[0];
					var cat = "";
					for (var i = 0; i < data.response.venues.length; i++) {
						var element = data.response.venues[i];
						if (element.hasOwnProperty('categories') && element.categories.length > 0) {
							cat = element.categories[0].name
							if (cat.toLowerCase().indexOf("restaurant") > -1) {
								console.log(element);

								locData = "<h5 class='loc-title'>"+loc.locName+"</h5>" +
								"<div class='stats-list'>";
								if (element.stats.checkinsCount) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Check-in Count</div><div class='col s6 stat-val right-align flow-text'>"+element.stats.checkinsCount+"</div></div>"
								}
								if (element.stats.usersCount) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Foursquare users Count</div><div class='col s6 stat-val right-align flow-text'>"+element.stats.usersCount+"</div></div>"
								}
								if (element.contact.formattedPhone) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Phone</div><div class='col s6 stat-val right-align flow-text'>"+element.contact.formattedPhone+"</div></div>"
								}
								if (element.location.address) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Adress</div><div class='col s6 stat-val right-align flow-text'>"+element.location.address+"</div></div>"
								}
								if (element.contact.twitter) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Twitter</div><div class='col s6 stat-val right-align flow-text'>"+element.contact.twitter+"</div></div>"
								}
								
								"</div>";
								var infoWindow = new google.maps.InfoWindow({
									content: locData
								})
								marker.addListener('click', function () {
									marker.setAnimation(google.maps.Animation.BOUNCE);
									setTimeout(function () {
										marker.setAnimation(null);
									}, 1400)
									infoWindow.open(map, marker);
								})


								break;
							}
						}
					}


				},
				error: function (err) {
					console.log(err);

				}
			})


		}, this);
		// console.log(avm.markers());
	}









}