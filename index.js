import {ETwitterStreamEvent} from 'twitter-api-v2';
import {
    addStreamMatchings,
    getBearerClient,
    getOAuthClient,
    getStream, hasReferencedTweet, isTweetRetweet,
    isTweetSelfSent, replyToTweet
} from "./tweeterApi.js";
import * as dotenv from 'dotenv'
dotenv.config()
import {getAllMatchings, getContentToAnalyze, getMatchingAnswer} from "./domainApi.js";
import {accountId, accountName, appMode, appModeAuto, appModeManual, testing} from "./config.js";

const bearerClient = getBearerClient()
await addStreamMatchings(
    bearerClient,
    appMode === appModeManual ? [{value: accountName}] : getAllMatchings().map(matching => ({value: matching})))
const stream = await getStream(bearerClient)


stream.on(ETwitterStreamEvent.Data, async tweet => {
    if (isTweetRetweet(tweet, accountId)) {
        return
    }

    if (!testing && isTweetSelfSent(tweet, accountId) || testing && !isTweetSelfSent(tweet, accountId)) {
        return
    }

    if (appMode === appModeAuto && hasReferencedTweet(tweet)) {
        return
    }

    const oAuthclient = getOAuthClient()
    const contentToAnalyze = await getContentToAnalyze(appMode, tweet, oAuthclient)
    const matchingAnswer = getMatchingAnswer(contentToAnalyze)
    if (matchingAnswer) {
        await replyToTweet(oAuthclient, tweet, matchingAnswer.answer)
    }
});



