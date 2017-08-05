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

// Default (mouseout) marker icon
var defaultIcon;

// Highlighted (mouseover) marker icon
var highlightedIcon;

// Create a variable for storing an info window
var infoWindow;

// Creates the map markers along with related functionality
function createMarkers() {
	// Create a bounds object for setting up the location bounds
	var bounds = new google.maps.LatLngBounds();

	// Assign values to both marker icons (for mouseover and mouseout states)
	defaultIcon = createMarkerIcon('ff0000');
	highlightedIcon = createMarkerIcon('a50000');

	// Assign an instance of InfoWindow() to the infoWindow variable
	infoWindow = new google.maps.InfoWindow();

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

		// When clicked, call the associated functions for that marker
		marker.addListener('click', (function(marker) {
			return function() {
				// Bounce the marker momentarily
				bounce(marker);

				// Open and populate the info window on the marker
				populateInfoWindow(marker, infoWindow);
			};
		})(marker.id));
	}

	// Finally, fit the map to the new bounds
	map.fitBounds(bounds);
}

// Creates a marker icon. Called by createMarkers().
function createMarkerIcon(color) {
	var markerImage = new google.maps.MarkerImage(
		'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + color +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34));

	return markerImage;
}

// Bounces a marker momentarily
function bounce(marker) {
	var marker = markers[marker];
	if (marker.getAnimation() === null) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			marker.setAnimation(null);
		}, 750);
	}
}

// Open and populate the info window on the marker passed in
function populateInfoWindow(marker) {
	var marker = markers[marker];

	// Check if the info window is not already open on this marker
	if (infoWindow.marker != marker) {

		// Clear the info window content
		infoWindow.setContent('');
		infoWindow.marker = marker;
		infoWindow.setContent('<div class="iw-content"><h3 class="iw-title">' + marker.title + '</h3>' + '<div><p class="wiki-content"></p></div></div>');

		// Request Wikipedia content
		getWikiContent(marker);
		infoWindow.open(map, marker);

		// Clear the info window marker property when closed
		infoWindow.addListener('closeclick', function() {
			infoWindow.marker = null;
		});
	}
}

// Wikipedia Ajax request. Gets the first section of an article. The returned data is parsed and
// only the first paragraph is appended to the Google Maps info window. This request was developed
// with help from Udacity's Ajax course and the MediaWiki API site. Also, I found the following
// StackOverflow discussions very useful in developing the final request query:

// https://stackoverflow.com/questions/8555320/is-there-a-clean-wikipedia-api-just-for-retrieve-content-summary
// https://stackoverflow.com/questions/22235903/wikipedia-search-api-get-redirect-pageid
// https://stackoverflow.com/questions/28803003/retrieve-first-paragraph-from-wikipedia-in-chinese
function getWikiContent(marker) {
	var wikiUrl = 'https://en.wikipedia.org/w/api.php?&format=json&action=query&prop=extracts&rawcontinue=1&exintro=&indexpageids&redirects&titles=' +
		marker.title;
	return $.ajax(wikiUrl, {
		dataType: 'jsonp',
		success: function(data) {
			// Only proceed if the requested page exists
			if (!(data.query.pageids[0] === '-1')) {
				// First get the requested page's ID
				var page = data.query.pageids[0];

				// Use the page's ID to access sub objects and data. The extract is the
				// first section of a Wikipedia article. We'll parse that to get the first
				// paragraph.
				var extract = data.query.pages[page].extract;

				// Find the first occurrence of '</p>', the end of the first paragraph. However,
				// we should start our search a little past the beginning of the extract, since
				// there is the possibility of an empty paragraph early in the string.
				var endIndex = extract.indexOf('</p>', 60) + 4;

				// Create a new string containing the first paragraph.
				var snippet = $(extract.slice(0, endIndex)).text();

				// Append the paragraph to the Google Maps info window
				$('.wiki-content').text(snippet).fadeIn();

				// The following code adjusts the bounds of the map when an info window is opened
				var zoom = map.zoom;
				var bounds = new google.maps.LatLngBounds();
				bounds.extend(infoWindow.position);
				map.fitBounds(bounds);
				map.setZoom(zoom);
			}
		}
	});
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

	// Set corresponding marker to highlight state on mouseover of location in list
	this.highlight = function(data) {
		var i = data.id;
		markers[i].setIcon(highlightedIcon);
	};

	// Set corresponding marker to default state on mouseout of location in list
	this.removeHighlight = function(data) {
		var i = data.id;
		markers[i].setIcon(defaultIcon);
	};

	// Calls relevant click functions on click of location in list
	this.listClick = function(data) {
		// Bounce the marker momentarily
		bounce(data.id);

		// Open and populate the info window on the marker
		populateInfoWindow(data.id, infoWindow);
	}
};

// Initialization function to get things going. Called by the Google Maps script.
function init() {
	// Initialize the map
	initMap();

	// Activate Knockout!
	ko.applyBindings(new ViewModel());
}