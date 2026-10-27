
let current_tweets = []

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	tweet_box = runkeeper_tweets.map(function(tweet){
		return new Tweet(tweet.text, tweet.created_at);
	});

	current_tweets = tweet_box.filter(function(tweet){
		return tweet.written;
	});

	updateBox(); //refreshed the table just in case
}

function updateBox() {
	const eachText = document.getElementById('textFilter').value;
	const lowerSearchText = eachText.toLowerCase();

	let tblHTML = "";
	let count = 0

	if (eachText !== ""){
		for (let i = 0; i < current_tweets.length; i++){
			const tweet = current_tweets[i];
			if (tweet.writtenText.toLowerCase().includes(lowerSearchText)){
				count = count+1;
				tblHTML= tblHTML + tweet.getHTMLTableRow(count);
			}
		}
	}

	//displays on the page itself
	document.getElementById('tweetTable').innerHTML = tblHTML;
	document.getElementById('searchCount').innerText = count;
	document.getElementById('searchText').innerText = eachText;


}
function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	document.getElementById('textFilter').addEventListener('input', updateBox); // updates the search for every time the text in searchbox is updated
	updateBox(); //will start at count 0 rather than placeholders
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});