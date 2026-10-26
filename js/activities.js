function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const completed = tweet_array.filter(function(tweet) {
		return tweet.source === 'completed_event';
	});

	const typeCounts = {};
	completed.forEach(function(tweet) {
		const which= tweet.activityType;
		typeCounts[which] = (typeCounts[which] || 0) +1;
	});

	const activityCounts = Object.keys(typeCounts).map(function(type){
		return {activityType: type, count: typeCounts[type]};
	});
	activityCounts.sort(function(one,two) {return two.count - one.count; });

	document.getElementById('numberActivities').innertext = activityCounts.length;
	document.getElementById('firstMost').innerText= activityCounts[0].activityType;
	document.getElementById('secondMost').innerText = activityCounts[1].activityType;
	document.getElementById('thirdMost').innerText = activityCounts[2].activityType;
	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	activity_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the number of Tweets containing each type of activity.",
		"data": {
			"values": activityCounts
		},
		"width": 600,
		"height": 300,
		"mark": "bar",
		"encoding": {
			"x": {"field": "activityType", "type": "nominal", "sort": "-y", "title": "Activity type"},
			"y": {"field": "count", "type": "quantitative", "title": "Number of Tweets"},
			"tooltip": [
			{"field": "activityType", "type": "nominal", "title": "Activity"},
			{"field": "count", "type": "quantitative", "title": "Tweets"}
		]
	  }
	  //TODO: Add mark and encoding
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	const topTypes = activityCounts.slice(0, 3).map(function(item) { return item.activityType; });
	
	// one object for each tweet: activity type, distance in miles, and day of the week
	const distanceData = completed
		.filter(function(tweet) { return topTypes.includes(tweet.activityType); })
		.map(function(tweet) {
			return {
				activityType: tweet.activityType,
				distance: tweet.distance,
				day: WEEKDAYS[tweet.time.getDay()],
				isWeekend: tweet.time.getDay() === 0 || tweet.time.getDay() === 6
			};
		});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	//#2 
	distance_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distance of each of the three most common activities by day of the week.",
	  "data": {
	    "values": distanceData
	  },
	  "width": 600,
	  "height": 300,
	  "mark": "point",
	  "encoding": {
	    "x": {"field": "day", "type": "ordinal", "sort": WEEKDAYS, "title": "Day of the week"},
	    "y": {"field": "distance", "type": "quantitative", "title": "Distance (miles)"},
	    "color": {"field": "activityType", "type": "nominal", "title": "Activity type"}
	  }
	};
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false});
 
	//#3
	distance_vis_aggregated_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Mean distance of each of the three most common activities by day of the week.",
	  "data": {
	    "values": distanceData
	  },
	  "width": 600,
	  "height": 300,
	  "mark": {"type": "point", "filled": true, "size": 120},
	  "encoding": {
	    "x": {"field": "day", "type": "ordinal", "sort": WEEKDAYS, "title": "Day of the week"},
	    "y": {"aggregate": "mean", "field": "distance", "type": "quantitative", "title": "Mean distance (miles)"},
	    "color": {"field": "activityType", "type": "nominal", "title": "Activity type"}
	  }
	};
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, {actions:false});
 
	// longest and shortest activity type, by mean distance
	let longestType = topTypes[0];
	let shortestType = topTypes[0];
	let longestMean = -1;
	let shortestMean = Infinity;
	topTypes.forEach(function(type) {
		const mean = meanDistance(distanceData.filter(function(item) { return item.activityType === type; }));
		if (mean > longestMean) {
			longestMean = mean;
			longestType = type;
		}
		if (mean < shortestMean) {
			shortestMean = mean;
			shortestType = type;
		}
	});
	document.getElementById('longestActivityType').innerText = longestType;
	document.getElementById('shortestActivityType').innerText = shortestType;
 
	// weekdays or weekends, averaging across the three activities
	const weekendMean = meanDistance(distanceData.filter(function(item) { return item.isWeekend; }));
	const weekdayMean = meanDistance(distanceData.filter(function(item) { return !item.isWeekend; }));
	document.getElementById('weekdayOrWeekendLonger').innerText = weekendMean > weekdayMean ? 'weekends' : 'weekdays';
 
	// ---------- Button: swap between the two distance charts ----------
	const distanceVis = document.getElementById('distanceVis');
	const aggregatedVis = document.getElementById('distanceVisAggregated');
	const aggregateButton = document.getElementById('aggregate');
 
	// start by showing all activities, with the means hidden
	let showingMeans = false;
	distanceVis.style.display = 'block';
	aggregatedVis.style.display = 'none';
 
	aggregateButton.addEventListener('click', function() {
		showingMeans = !showingMeans;
		distanceVis.style.display = showingMeans ? 'none' : 'block';
		aggregatedVis.style.display = showingMeans ? 'block' : 'none';
		aggregateButton.innerText = showingMeans ? 'Show all activities' : 'Show means';
	});
}


//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});

const WEEKDAYS =  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//avg distance 
function meanDistance(items) {
	if (items.length === 0) {
		return 0;
	}
	const total = items.reduce(function(total, item) { return total + item.distance; }, 0);
	return total / items.length;
}

