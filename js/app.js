// Declare the map as a global variable
var map;

// Sets up the map for initialization. Called by init().
// Map and associated functions were developed while following along with
// Udacity's Google Maps APIs course and with help from Google's developer
// site: https://developers.google.com/maps/documentation/javascript/
function initMap() {
	// Set up the map constructor, which only requires center and zoom
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 34.6937378, lng: 135.5021651},
		zoom: 13,
		// styles: styles,
		mapTypeControl: false
	});
	createMarkers();
}

// Create an array of locations. These will be used to make an array of markers.
var locations = [
	{title: 'Osaka Castle', location: {lat: 34.6873153, lng: 135.5262013}},
	{title: 'Osaka Station', location: {lat: 34.7024854, lng: 135.4959506}},
	{title: 'Dotonbori', location: {lat: 34.6685155, lng: 135.5025519}},
	{title: 'Yodobashi Camera', location: {lat: 34.7040944, lng: 135.4962681}},
	{title: 'Shinsekai', location: {lat: 34.6523835, lng: 135.5062421}},
	{title: 'Shitennoji', location: {lat: 34.6533466, lng: 135.516491}},
	{title: 'Osaka Aquarium Kaiyukan', location: {lat: 34.6545182, lng: 135.4289645}},
	{title: 'Nakanoshima', location: {lat: 34.6911101, lng: 135.4923244}},
	{title: 'Umeda Sky Building', location: {lat: 34.7052801, lng: 135.4906873}},
	{title: 'Katsukura Tonkatsu', location: {lat: 34.7081722, lng: 135.4983075}},
	{title: 'LiLo Coffee Roasters', location: {lat: 34.674062, lng: 135.498056}},
	{title: 'Ijiri Coffee', location: {lat: 34.666149, lng: 135.479407}},
	{title: 'Cocoo Cafe', location: {lat: 34.684072, lng: 135.492565}},
	{title: 'Takamura Wine & Coffee Roasters', location: {lat: 34.687265, lng: 135.491059}}
];

// Create an empty array for all the location markers
var markers = [];

// Creates the map markers along with related functionality
function createMarkers() {
	// Create a bounds object for setting up the location bounds
	var bounds = new google.maps.LatLngBounds();

	// Default marker icon
	var defaultIcon = createMarkerIcon('ff0000');

	// Highlighted (mouseover) marker icon
	var highlightedIcon = createMarkerIcon('d80000');

	// The following for loop uses the locations array to create an array of markers on initialization
	for (var i = 0; i < locations.length; i++) {
		// Get the position from the locations array
		var position = locations[i].location;

		// Get the title
		var title = locations[i].title;

		// Create a marker for each location
		var marker = new google.maps.Marker({
			position: position,
			title: title,
			map: map,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			id: i
		});

		// Add the marker to the array of markers
		markers.push(marker);

		// Extend the boundaries of the map for each marker
		bounds.extend(marker.position);

		// The following two event listeners handle a marker's mouseover and mouseout
		// behavior.
		marker.addListener('mouseover', function() {
			this.setIcon(highlightedIcon);
		});
		marker.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});

		// When clicked, a marker will bounce momentarily
		marker.addListener('click', function() {
			if (this.getAnimation() === null) {
				this.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function() {
					this.setAnimation(null);
				}.bind(this), 750);
			}
		});
	}

	// Finally, fit the map to the new bounds
	map.fitBounds(bounds);
}

// Creates a marker icon. Called by createMarkers().
function createMarkerIcon(color) {
	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + color +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34));

	return markerImage;
}

// Declares a Knockout view model along with observables and related functions
var ViewModel = function() {
	var self = this;

	// Observable for the text input box
	this.textFilter = ko.observable('');

	// Observable array for the list of locations. Items are added and removed
	// dynamically as the app runs.
	this.filterList = ko.observableArray([]);

	// Filters locations as the user enters text into the text input box. The entered
	// text (textFilter) is checked against the location titles found in the markers
	// array. If there is a match (and the location isn't already in the filterList),
	// then the location is added to the filterList (appears on the page). Otherwise,
	// the location is removed from the filterList (disappears from the page).
	this.filterLocations = function() {
		for (var i = 0; i < markers.length; i++) {
			var location = markers[i];
			if (location.title.toLowerCase().includes(self.textFilter().toLowerCase())) {
				if (self.filterList.indexOf(location) < 0) {
					// Add the location to the filterList
					self.filterList.push(location);

					// Make the location's marker visible on the map
					location.setMap(map);
				}
			}
			else {
				// Remove the location from the filterList
				self.filterList.remove(location);

				// Hide the location's marker on the map
				location.setMap(null);
			}		
		}

		return true;
	};

	// Initially, add the locations found in the markers array to the filterList.
	// Therefore, the locations list will be populated when the page first loads.
	this.addLocations = (function() {
		markers.forEach(function(location) {
			self.filterList.push(location);
		});
	})();
};

// Initialization function to get things going. Called by the Google Maps script.
function init() {
	// Initialize the map
	initMap();

	// Activate Knockout!
	ko.applyBindings(new ViewModel());
}