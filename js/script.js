/*jshint loopfunc: true */

/**
 * KnouckoutJS ViewModel contains all the primary data like locations, markers and infoWindows through
 * ObservableArrays
 */
function AppViewModel() {
	var self = this;
	this.filterKeyword = ko.observable("");
	this.locs = ko.observableArray([]);
	this.markers = ko.observableArray([]);
	this.infoWindows = ko.observableArray([]);


	/**
	 * Event for keyup on search box to update the list view
	 * Thanks to an udacity reviewer who helped me in this
	 */
	this.filterLocs = ko.computed(() => {
		if (!this.filterKeyword()) {
			// No input found, return all locss
			return this.locs();
		} else {
			// input found, match keyword to filter
			return ko.utils.arrayFilter(this.locs(), (locss) => {
				return locss.locName.toLowerCase().indexOf(this.filterKeyword().toLowerCase()) !== -1;
			});
		} //.conditional
	}); //.filterLocs

	/**
	 * Event for keyup on search box to show the respective markers on the map
	 */
	this.markersUpdate = function () {
		console.log(this.filterLocs());
		this.markers().forEach(function (mr) {
			mr.setVisible(false);
			this.filterLocs().forEach(function (lc) {
				if ( mr.id == lc.id ) {
					mr.setVisible(true);
				}
			}, this);
		}, this);
	}


	/**
	 * Function for displaying single marker when clicking on a single item from the sidebar
	 */
	this.markerToggle = function (index, data) {
		index = data.id;
		self.markers().forEach(function (m) {
			m.setVisible(false);
			if (m.id == index) {
				m.setVisible(true);
				m.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function () {
					m.setAnimation(null);
				}, 1400);
				self.infoWindows().forEach(function (info) {
					info.close();
					if (info.id == index) {
						info.open(map, m);
					}
				}, this);
			}
		}, this);
	};

	/**
	 * Function for showing all markers
	 */
	this.showAllMarkers = function () {
		self.markers().forEach(function (m) {
			m.setVisible(true);
		}, this);
	};
	/**
	 * Function for hiding all markers
	 */
	this.hideAllMarkers = function () {
		self.markers().forEach(function (m) {
			m.setVisible(false);
		}, this);
	};

	/**
	 * Function that executes on window load to show the sidebar, get the IP and initializes the map
	 */
	window.onload = function () {
		$(".side-menu-trigger").sideNav({
			menuWidth: 300,
			edge: 'left',
			closeOnClick: true,
			draggable: true,
		});
		$(".side-menu-trigger").sideNav('show');
		$('.tooltipped').tooltip({
			delay: 50
		});

		// get IP from API

	};
}

// Activates knockout.js
var avm = new AppViewModel();
ko.applyBindings(avm);


function getLoc() {
	$.getJSON('https://ipinfo.io/json', function (data) {
		// console.log(data)
		var myLoc = data.loc;
		var myLat = parseFloat(myLoc.split(',')[0]);
		var myLng = parseFloat(myLoc.split(',')[1]);

		initMap(myLat, myLng)

	}).fail(function (err) {
		// console.log(err);
		Materialize.toast("Couldn't connect to API", 4000, 'rounded')
	});
}

function getStyles(styles, map) {
	/**
	 * Night mode style - credit goes to google :D
	 */
	$.getJSON('js/mapStyle.json', function (data) {
		// console.log(data)
		styles = data
		map.setOptions({styles: styles});
	}).fail(function (err) {
		// console.log(err);
		Materialize.toast("Couldn't Fetch Map Style", 4000, 'rounded')
	});
}

function initMap(myLat, myLng) {

	var styles = [];
	
	var pos = {
		lat: myLat,
		lng: myLng
	};

	/**
	 * Initalize the map and assign it to map variable
	 */
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: pos,
		styles: styles
	});

	getStyles(styles, map);

	/**
	 * Get nearby places of restaurant type around a radius of the users location
	 */
	var service = new google.maps.places.PlacesService(map);
	var request = {
		location: new google.maps.LatLng(myLat, myLng),
		radius: '1000',
		type: ['restaurant']
	};
	service.nearbySearch(request, function (results, status) {
		// console.log(results);
		var id = 0;
		results.forEach(function (nearbyLoc) {
			var thisLat = parseFloat(nearbyLoc.geometry.location.lat());
			var thisLng = parseFloat(nearbyLoc.geometry.location.lng());
			// store the locations in our appViewModel
			avm.locs.push({
				id: id,
				locName: nearbyLoc.name,
				locPos: {
					lat: thisLat,
					lng: thisLng,
				},
				data: "" // this is empty for now - stores infowindow html
			});
			id++;

		}, this);
		showMarkersForLocs();
	});


	function showMarkersForLocs() {
		// Get Locations from our appViewModel
		var arr = avm.locs();
		arr.forEach(function (loc) {
			// console.log(loc);
			var marker = new google.maps.Marker({
				id: loc.id,
				position: loc.locPos,
				map: map,
				title: loc.locName,
				animation: google.maps.Animation.DROP
			});

			avm.markers.push(marker); // stores each marker in our appViewModel markers array

			/**
			 * I used Foursquare API to get data about each location and store that in each marker's infowindow
			 * through the data variable
			 */
			var locData = "";
			var infoWindow;
			$.ajax({
				url: 'https://api.foursquare.com/v2/venues/search?ll=' + loc.locPos.lat + ',' + loc.locPos.lng + '&v=20170717&client_id=XYM3SXXMSZHIYORAVSU2YSHQG0YWZ13FZ2ELGFQLEQKZ2C0D&client_secret=T3JVTAKYWUOWCS4CDIRK5BU5Q3UB5GYE5JH0ICT404H2W53J',
				dataType: 'jsonp',
				success: function (data) { // success handler
					// console.log(data.response.venues);
					// element = data.response.venues[0];
					var cat = "";
					/**
					 * Foursquare return multiple places of different types so I ran through them to find out which is 
					 * restaurant and of the same latitude and longitude
					 */
					var flag = 0;
					for (var i = 0; i < data.response.venues.length; i++) {
						var element = data.response.venues[i];
						if (element.hasOwnProperty('categories') && element.categories.length > 0) {
							cat = element.categories[0].name;
							if (cat.toLowerCase().indexOf("restaurant") > -1) {
								// console.log(element);
								// HTML for infowindow containing data retrieved from the API
								locData = "<h5 class='loc-title'>" + loc.locName + "</h5>" +
									"<div class='stats-list'>";
								if (element.stats.checkinsCount) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Check-in Count</div><div class='col s6 stat-val right-align flow-text'>" + element.stats.checkinsCount + "</div></div>";
								}
								if (element.stats.usersCount) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Foursquare users Count</div><div class='col s6 stat-val right-align flow-text'>" + element.stats.usersCount + "</div></div>";
								}
								if (element.contact.formattedPhone) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Phone</div><div class='col s6 stat-val right-align flow-text'>" + element.contact.formattedPhone + "</div></div>";
								}
								if (element.location.address) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Adress</div><div class='col s6 stat-val right-align flow-text'>" + element.location.address + "</div></div>";
								}
								if (element.contact.twitter) {
									locData += "<div class='row'><div class='col s6 stat-name flow-text'>Twitter</div><div class='col s6 stat-val right-align flow-text'>" + element.contact.twitter + "</div></div>";
								}
								"</div>";

								// create the infowindow with the data
								infoWindow = new google.maps.InfoWindow({
									id: loc.id,
									content: locData
								});

								avm.infoWindows.push(infoWindow); // store each infoWindow in our appViewModel

								marker.addListener('click', attachClickToMarker(map, marker, infoWindow));
								break;
							} else {
								flag++;
							}
							if (flag == data.response.venues.length) {
								// create the infowindow with NO data
								locData = "<h5 class='loc-title'>" + loc.locName + "</h5>" +
									"<div class='stats-list'>";
								if (element.stats.checkinsCount) {
									locData += "<div class='row'><div class='col s12 stat-name flow-text'>Couldn't find any data in Foursquare about this place</div></div>";
								}
								"</div>";
								infoWindow = new google.maps.InfoWindow({
									id: loc.id,
									content: locData
								});
								avm.infoWindows.push(infoWindow); // store each infoWindow in our appViewModel
								marker.addListener('click', attachClickToMarker(map, marker, infoWindow));
							}
						}
					}
					flag = 0;
				},
				error: function (err) {
					// console.log(err);
					Materialize.toast("Couldn't connect to Foursquare API", 4000, 'rounded')
				}
			});


		}, this);
		// console.log(avm.markers());
	}

	function attachClickToMarker(map, marker, infoWindow) {
		return function () {
			marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function () {
				marker.setAnimation(null);
			}, 1400);
			avm.infoWindows().forEach(function (inf) {
				inf.close();
			})
			infoWindow.open(map, marker);
		}
	}


}

function gmapsLoadingFailed() {
	Materialize.toast("Couldn't fetch Google Maps", 4000, 'rounded')
}