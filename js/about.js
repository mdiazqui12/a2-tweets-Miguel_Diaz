function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	

	let firstMost = tweet_array[0].time.getTime();
	let lastMost = tweet_array[0].time.getTime();
	tweet_array.forEach(function(tweet) {
		const time = tweet.time.getTime();
		if (time < firstMost) {
			firstMost = time;
		}
		if (time > lastMost) {
			lastMost = time;
		} 
	});

	//format date as "Weekday, Month Day, Year"
	const dateFormat = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
	document.getElementById('firstDate').innerText = new Date(firstMost).toLocaleDateString('en-US', dateFormat);
	document.getElementById('lastDate').innerText = new Date(lastMost).toLocaleDateString('en-US', dateFormat);

	//different categories
	const total = tweet_array.length; 
	const completed = tweet_array.filter(function(tweet) {return tweet.source === 'completed_event';});
	const live = tweet_array.filter(function(tweet) {return tweet.source === 'live_event';});
	const achievements = tweet_array.filter(function(tweet) {return tweet.source === 'achievement';});
	const miscellaneous = tweet_array.filter(function(tweet) {return tweet.source === 'miscellaneous';});

	setTextByClass('completedEvents', completed.length);
	setTextByClass('completedEventsPct', formatPercent(completed.length, total));
	setTextByClass('liveEvents', live.length);
	setTextByClass('liveEventsPct', formatPercent(live.length, total));
	setTextByClass('achievements', achievements.length);
	setTextByClass('achievementsPct', formatPercent(achievements.length, total));
	setTextByClass('miscellaneous', miscellaneous.length);
	setTextByClass('miscellaneousPct', formatPercent(miscellaneous.length, total));

	//completed tweets
	const writtenCompleted = completed.filter(function(tweet) {return tweet.written;});
	setTextByClass('written', writtenCompleted.length);
	setTextByClass('writtenPct', formatPercent(writtenCompleted.length, completed.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});

// Sets all elemets with the given class name to the given value. 
function setTextByClass(className, value) {
	document.querySelectorAll('.' + className).forEach(function(element) {
		element.innerText = value;
	});
}

//makes count be a percentage of total, with two decimal places
function formatPercent(count, total) {
	if (total === 0) {
		return '.00%';
	}
	return math.format((count/total) *100, { notation: 'fixed', precision: 2}) + '%';
}
