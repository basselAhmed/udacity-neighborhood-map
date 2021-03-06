<p align="center">
	<h3 align="center" style="font-weight: 700">Neighborhood Map</h3>
	<p align="center">
		A Simple, ease and intuitive way to find the best restaurants in your area
		<hr>
	</p>
</p>


**Neighborhood Map** project finds your current `IP` address then uses geolocation to find your most approximate location, sure enough it ain't accurate and might find yourself at the sea but that's the best I could do without GPS nor `HTML5 geolocation API` because that requires `SSL` connection to work and I can't gurantee that all people open up from a secure connection on their server or something.

## How to use
- You can simply open up [Neighborhood Map](https://basselahmed.github.io/udacity-neighborhood-map/).
- or if you wanna get your hands dirty with the code:
-- Download or clone this repo on your local machine.
-- Extract the files in your web server root directory, Here's a web server if you don't have one [XAMPP](https://www.apachefriends.org/download.html).
-- or you could use python server from the command line as follows: python -m http.server 8080 (python 3)
-- or install nodejs and run `npm install -g live-server` then run cd into the project and run `live-server` from your terminal
-- Open up index.html through the server and enjoy.

## Technologies used
- KnockoutJS - For MVVM Structure.
- jQuery - For quick manipulation of the DOM.
- MaterializeCSS - For UI Elements like sidebar, buttons and tooltips.
- ipinfo.io API to get IP
- Google Maps API - Surely for displaying the map xD.
- Google Places API - to get nearby places
- Foursquare API - to get data about places

## BUGS
Hey if you find any bugs and I'm sure you will, please open up an issue here on Github or feel free to contact me directly at [bassel.ahmed@outlook.com ](mailto:bassel.ahmed@outlook.com)