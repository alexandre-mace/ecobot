import {ETwitterStreamEvent} from 'twitter-api-v2';
import {
    addStreamMatchings, buildStreamRule,
    getBearerClient,
    getOAuthClient,
    getStream, hasReferencedTweet, isTweetRetweet,
    isTweetSelfSent, replyToTweet
} from "./tweeterApi.js";
import {getContentToAnalyze, getMatchingAnswer} from "./domainApi.js";
import {accountId, appMode, appModeAuto, testing} from "./config.js";
import {domainAnswers} from "./domainAnswers.js";

const bearerClient = getBearerClient()
await addStreamMatchings(
    bearerClient,
    buildStreamRule(appMode, domainAnswers)
)
const stream = await getStream(bearerClient)

stream.on(ETwitterStreamEvent.Data, async tweet => {
    console.log(tweet.data.id, tweet.data.text)

    if (isTweetRetweet(tweet, accountId)) {
        return
    }

    if (!testing && isTweetSelfSent(tweet, accountId) || testing && !isTweetSelfSent(tweet, accountId)) {
        return
    }

    if (appMode === appModeAuto && hasReferencedTweet(tweet)) {
        return
    }

    console.log(tweet.data.id, tweet.data.text)

    const oAuthclient = getOAuthClient()
    const contentToAnalyze = await getContentToAnalyze(appMode, tweet, oAuthclient)
    const matchingAnswer = getMatchingAnswer(contentToAnalyze)
    if (matchingAnswer) {
        await replyToTweet(oAuthclient, tweet, matchingAnswer.answer)
    }
});