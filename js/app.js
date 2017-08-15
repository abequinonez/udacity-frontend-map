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
		styles: mapStyles, // Map styles defined in map-styles.js
		mapTypeControl: false,
		fullscreenControl: false,
		streetViewControl: false
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
	{title: 'Nakanoshima Park', location: {lat: 34.692600, lng: 135.507417}},
	{title: 'Umeda Sky Building', location: {lat: 34.7052801, lng: 135.4906873}},
	{title: 'Nipponbashi', location: {lat: 34.6595943, lng: 135.5051408}},
	{title: 'Namba Parks', location: {lat: 34.661607, lng: 135.501936}},
	{title: 'Utsubo Park', location: {lat: 34.684268, lng: 135.490709}},
	{title: 'Minato Bridge', location: {lat: 34.644387, lng: 135.437982}},
	{title: 'Universal Studios Japan', location: {lat: 34.665442, lng: 135.432340}},
	{title: 'Osaka Science Museum', location: {lat: 34.691217, lng: 135.491469}},
	{title: 'Amerikamura', location: {lat: 34.672971, lng: 135.498218}},
	{title: 'Yodo River', location: {lat: 34.695781, lng: 135.455042}}
];

// Create an empty array for all the location markers
var markers = [];

// Default (mouseout) marker icon
var defaultIcon;

// Highlighted (mouseover) marker icon
var highlightedIcon;

// Create a variable for storing an info window
var infoWindow;

// Variable for storing info window place holder spaces
var placeHolderSpaces;

// Variable for storing a reference to the Owl image carousel
var $owl;

// Creates the map markers along with related functionality
function createMarkers() {
	// Create a bounds object for setting up the location bounds
	var bounds = new google.maps.LatLngBounds();

	// Assign values to both marker icons (for mouseover and mouseout states)
	defaultIcon = createMarkerIcon('default');
	highlightedIcon = createMarkerIcon('hover');

	// Assign an instance of InfoWindow() to the infoWindow variable
	infoWindow = new google.maps.InfoWindow({disableAutoPan: true});

	// Placeholder spaces for use by the info window upon opening. Required in order to fill
	// the entire width of the info window in order for the image carousel to load images
	// correctly upon initiation.
	placeHolderSpaces = '';
	for (var i = 0; i < 200; i++) {
		placeHolderSpaces += '&nbsp;';
	}

	// Clear the info window marker property when closed
	infoWindow.addListener('closeclick', function() {
		infoWindow.marker = null;

		// Remove the viewport resize handler
		$(window).off('resize');

		// Undim the map
		undimMap();
	});

	// The following forEach loop iterates over the locations array to create an array of
	// markers on initialization. This code block was refactored with help from this Udacity
	// forum topic: https://discussions.udacity.com/t/issue-in-reviewing-my-project/303717/2
	locations.forEach(function(location, i) {
		// Get the position from the locations array
		var position = location.location;

		// Get the title
		var title = location.title;

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

				// Dim the map
				dimMap();

				// Open and populate the info window on the marker
				populateInfoWindow(marker, infoWindow);
			};
		})(marker.id));
	});

	// Finally, fit the map to the new bounds
	map.fitBounds(bounds);
}

// Creates a marker icon. Called by createMarkers().
// The following Stack Overflow discussion helped in implementing and resizing custom marker icons:
// https://stackoverflow.com/questions/15096461/resize-google-maps-marker-icon-image
function createMarkerIcon(type) {
	var markerIcon = {
		// Custom marker icon is a modified version of Paomedia's map marker icon from IconArchive:
		// http://www.iconarchive.com/show/small-n-flat-icons-by-paomedia/map-marker-icon.html
		url: 'img/marker-icon-' + type + '.png',
		scaledSize: new google.maps.Size(36, 36)
	};

	return markerIcon;
}

// Bounces a marker momentarily
function bounce(marker) {
	marker = markers[marker];
	if (marker.getAnimation() === null) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			marker.setAnimation(null);
		}, 750);
	}
}

// Dim the map by setting the map's styles to the dim styles declared in map-styles.js.
// First checks whether or not the dim styles have already been set.
function dimMap() {
	if (map.styles !== dimMapStyles) {
		map.setOptions({styles: dimMapStyles});
	}
}

// Undim the map by setting the map's styles to the default styles declared in
// map-styles.js
function undimMap() {
	map.setOptions({styles: mapStyles});
}

// Open and populate the info window on the marker passed in. Calls relevant functions.
function populateInfoWindow(marker) {
	marker = markers[marker];

	// Check if the info window is not already open on this marker
	if (infoWindow.marker != marker) {

		// Clear the info window content
		infoWindow.setContent('');

		// Clear the image carousel if it exists
		if ($owl !== undefined) {
			$owl.trigger('destroy.owl.carousel');
		}
		infoWindow.marker = marker;
		infoWindow.setContent('<div class="iw-content"><h3 class="iw-title">' + marker.title + '</h3>' + '<div class="flickr-content"></div>' +
			'<div><div class="wiki-content"></div></div></div>');

		infoWindow.open(map, marker);

		// Append a series of spaces in order to fill up the entire width of the info window. This is
		// required in order for the image carousel to load appropriately-sized images upon initiating.
		// Once the carousel has been initiated, the spaces are removed.
		$('.flickr-content').append('<span class="spaces">' + placeHolderSpaces + '</span>');

		// Request Flickr content
		getFlickrContent(marker);

		// Request Wikipedia content
		getWikiContent(marker);

		// Style the info window (add rounded corners and a box shadow)
		$('.gm-style-iw').parent().addClass('box-shadow round-corners');

		// With help from CSS-Tricks (https://css-tricks.com/useful-nth-child-recipies/) and
		// trial and error, I was able to find the right selector
		$('.box-shadow > div:first-child > div:nth-child(even)').addClass('round-corners');

		// Pan the map according to the current marker's position and the viewport height
		panMap(marker);

		// Handle viewport resize
		handleResize(marker);
	}
}

// Flickr Ajax request. Gets url data and other information from 10 images at most. The returned
// data is parsed and a functional url is built. The image(s) are appended to the Google Maps
// info window after being added to the Owl image carousel. Flickr API site used as a reference:
// https://www.flickr.com/services/api/
function getFlickrContent(marker) {
	var flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=cfcd1c8964bd9d9c00d0d8687cd8f5fb' +
		'&format=json&tags=osaka,japan,-hogwarts,-camera,-AJA,-takeshi+yamada,-wayside&tag_mode=all&text=' + marker.title +
		'&sort=relevance&per_page=10&nojsoncallback=1';
	$.getJSON(flickrUrl, function(data) {
		var imageArray = data.photos.photo;

		// Check to see if any images were found
		if (imageArray.length > 0) {
			var imageItems = [];
			// Loop through the returned data. For each image, build a url and push it to the imageItems array.
			for (var i = 0; i < imageArray.length; i++) {
				var img = imageArray[i];
				var imgUrl = 'https://farm' + img.farm + '.staticflickr.com/' + img.server + '/' + img.id + '_' + img.secret + '_z.jpg';
				imageItems.push('<a href="https://www.flickr.com/photos/' + img.owner + '/' + img.id +
					'" target="_blank"><img src="' + imgUrl + '" alt=""></a>');
			}

			// Append the Owl image carousel containing the images to the Google Maps info window
			$('.flickr-content').append('<h4 class="content-title">Relevant Flickr Photos</h4>' +
				'<div class="owl-carousel owl-theme">' + imageItems.join('') + '</div>');

			// Initiate the image carousel and save its reference to a variable. The reference will be used
			// to call the carousel's refresh method by the viewport resize handler.
			$owl = $('.owl-carousel').owlCarousel({
				nav:true,
				margin:10,
				responsive:{
					0:{
						items:1
					},
					600:{
						items:2
					},
					900:{
						items:3
					}
				}
			});

			// Remove the placeholder spaces after the image carousel has been initiated
			$('.spaces').remove();
		}
		// If no images were found, display an error message
		else {
			$('.flickr-content').html('<p class="error">Hmm. No Flickr photos found. Please try reloading the page.</p>');
		}
	}).fail(function() {
		// In case the request fails
		$('.flickr-content').html('<p class="error">Flickr content failed to load. Please try reloading the page.</p>');
	});	
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
	$.ajax(wikiUrl, {
		dataType: 'jsonp',
		success: function(data) {
			// Only proceed if the requested page exists
			if (data.query.pageids[0] !== '-1') {
				// First get the requested page's ID
				var pageId = data.query.pageids[0];

				// Use the page's ID to access sub objects and data. The extract is the
				// first section of a Wikipedia article. We'll parse that to get the first
				// paragraph.
				var page = data.query.pages[pageId];
				var extract = page.extract;

				// Find the first occurrence of '</p>', the end of the first paragraph. However,
				// we should start our search a little past the beginning of the extract, since
				// there is the possibility of an empty paragraph early in the string.
				var endIndex = extract.indexOf('</p>', 60) + 4;

				// Create a new string containing the first paragraph
				var snippet = $(extract.slice(0, endIndex)).text();

				// Append the paragraph to the Google Maps info window
				$('.wiki-content').html('<h4 class="content-title">Wikipedia Snippet</h4><p>' + snippet + '</p>' +
					'<p><a href="https://en.wikipedia.org/wiki/' + page.title +
					'" target="_blank" class="wiki-link">Continue reading on Wikipedia</a></p>').fadeIn('slow');
			}
			// If the page wasn't found, display an error message
			else {
				$('.wiki-content').html('<p class="error">Hmm. No Wikipedia page was found. Please try reloading the page.</p>').show();
			}
		},
		error: function() {
			// In case the request fails
			$('.wiki-content').html('<p class="error">Wikipedia content failed to load. Please try reloading the page.</p>').show();
		}
	});
}

// Pans the map depending on the current marker's position and the viewport height. This method
// allows for the opened info window to be fully visible. Developed with help from this
// Stack Overflow discussion:
// https://stackoverflow.com/questions/8338424/google-maps-infowindow-placed-in-center-of-the-map?rq=1
function panMap(marker) {
	// Get the current viewport height
	var mapHeight = $('#map').height();

	// This offset will be used to pan the map vertically
	var offSetFromBottom = 0;

	var i = 510;
	var count = 0;

	// Gradually increase the amount of offset as the viewport height increases. Basically,
	// on smaller viewports, the map will pan so that the current marker is located at the
	// very bottom of the map, allowing the info window just enough space to be fully
	// visible. In contrast, on larger viewports, the marker will be located closer to the
	// middle of the map.
	while (i < mapHeight) {
		count += 0.85;
		i++;
	}
	offSetFromBottom += count;

	// Center the map on the marker
	map.setCenter(marker.getPosition());

	// Next, using the calculation from above, pan the map vertically
	map.panBy(0, -(mapHeight / 2 - offSetFromBottom));
}

// Refreshes both the info window and the image carousel when an info window is open and
// the viewport is resized. Basically the info window and the image carousel are resized
// and adjusted for the updated viewport size.
function handleResize(marker) {
	// Declare a variable to hold a setTimeout reference in the resize handler
	var timer;

	// Remove any previous handler
	$(window).off('resize');

	// Handle the resize event. In an attempt at limiting the number of calls to the
	// various functions contained in the handler, the code block is contained in a
	// setTimeout timer. If another resize event is received within 200ms, the timer
	// is cancelled.
	$(window).on('resize', function() {
		clearTimeout(timer);
		timer = setTimeout(function() {
			marker.setMap(null);
			marker.setMap(map);
			$owl.trigger('refresh.owl.carousel');
			$('.gm-style-iw').parent().addClass('box-shadow round-corners');
			$('.box-shadow > div:first-child > div:nth-child(even)').addClass('round-corners');
			panMap(marker);
		}, 200);
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
		var alreadyRestyled = false;
		for (var i = 0; i < markers.length; i++) {
			var location = markers[i];
			if (location.title.toLowerCase().includes(self.textFilter().toLowerCase())) {
				if (self.filterList.indexOf(location) < 0) {
					// Add the location to the filterList
					self.filterList.push(location);

					// Make the location's marker visible on the map
					location.setMap(map);

					// Restyle the info window if it's open and visible
					if ((!alreadyRestyled) && infoWindow.marker === location && location.map !== null) {
						$('.gm-style-iw').parent().addClass('box-shadow round-corners');
						$('.box-shadow > div:first-child > div:nth-child(even)').addClass('round-corners');
						alreadyRestyled = true;
					}
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
		// Close the navmenu if the viewport is less than 992px
		if ($(window).width() < 992) {
			$('.navmenu').offcanvas('hide');
		}

		// Bounce the marker momentarily
		bounce(data.id);

		// Dim the map
		dimMap();

		// Open and populate the info window on the marker
		populateInfoWindow(data.id, infoWindow);
	};
};

// Initialization function to get things going. Called by the Google Maps script.
function init() {
	// Initialize the map
	initMap();

	// Activate Knockout!
	ko.applyBindings(new ViewModel());

	// Apply event listener for text filter submit action
	$('#hidden-btn').on('click', function() {
		$('#text-filter').blur();
	});

	// Open the navmenu when the page first loads if the viewport is less than 992px
	if ($(window).width() < 992) {
		$('.navmenu').offcanvas('show');
	}
}