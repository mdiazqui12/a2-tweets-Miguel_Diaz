class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

    private get cleanedText():string {
        return this.text
            .replace(/https?:\/\/\S+/g, "")
            .replace(/#runkeeper/gi, "")
            .replace(/\s+/g, " ")
            .trim();
    }

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const lower = this.text.toLocaleLowerCase();
        if (lower.startsWith("just completed") || lower.startsWith("just posted")) {
            return "completed_event";
        }
        
        if (lower.includes("right now") || lower.startsWith("watch my")){
            return "live_event";
        }

        if (lower.includes("achieved") || lower.includes("personal record") || lower.includes("goal")){
            return "achievement";
        }

        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        const body = this.cleanedText;

        if (body.includes("Check it out!")) {
            return false;

        }
        //TODO: identify whether the tweet is written
        return body.includes(" - ");
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        //TODO: parse the written text from the tweet
        const body = this.cleanedText;
        const separatorIndex = body.indexOf(" - ");
        return body.substring(separatorIndex + 3).trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }

    
        const prefix = "^just (?:completed|posted) an?";
        const distance = "(?: [\\d.]+ (?:km|mi) )?";
        const activity = "(.+?)";
        const suffix = "(?: in \\d| with @runkeeper| - | https?:|$)";

        const sentance =new RegExp(prefix + " " + distance + activity + suffix);

        const match = this.text.toLowerCase().match(sentance);
        
        if (!match) {
            return "unknown";
        }

        //TODO: parse the activity type from the text of the tweet
        return match[1].replace(/ (?:workout|practice|ride)$/, "").trim();
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        return "<tr></tr>";
    }
}