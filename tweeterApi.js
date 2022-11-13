import {TwitterApi} from "twitter-api-v2";
import {accountName, appMode, appModeAuto, appModeManual} from "./config.js";
import {getAllMatchings} from "./domainApi.js";

const getAuthLink = async () => {
    const oAuthclient = new TwitterApi({
        appKey: process.env.TWEETER_APP_KEY,
        appSecret: process.env.TWEETER_APP_SECRET,
    });
    return await oAuthclient.generateAuthLink();
}

const getBearerClient = () => {
    return new TwitterApi(process.env.TWEETER_APP_BEARER);
}

const getOAuthClient = () => {
    return new TwitterApi({
        appKey: process.env.TWEETER_APP_KEY,
        appSecret: process.env.TWEETER_APP_SECRET,
        accessToken: process.env.TWEETER_APP_ACCESS_TOKEN, // oauth token from previous step (link generation)
        accessSecret: process.env.TWEETER_APP_ACCESS_SECRET, // oauth token secret from previous step (link generation)
    });

    // const { client: loggedClient, accessToken, accessSecret } = await oAuthclient.login('7450189');
    // console.log(loggedClient)
    // console.log(accessToken)
    // console.log(accessSecret)
}

const addStreamMatchings = async (bearerClient, matchings) => {
    const rules = await bearerClient.v2.streamRules();
    if (rules.data?.length) {
        await bearerClient.v2.updateStreamRules({
            delete: { ids: rules.data.map(rule => rule.id) },
        });
    }

    await bearerClient.v2.updateStreamRules({
        add: matchings,
    });
}

const buildStreamRule = (appMode, domainAnswers) => {
    if (appMode === appModeManual) {
        return [{value: accountName}]
    }

    if (appMode === appModeAuto) {
        let rule = ''
        domainAnswers.forEach((domainAnswer, i) => {
            domainAnswer.matchings.forEach((matching, j) => {
                matching.values.forEach((matchingValue, k) => {
                    rule+= matchingValue
                    if (domainAnswer.matchings[k]) {
                        rule+= ' '
                    }
                })
                if (domainAnswer.matchings[j + 1]) {
                    rule+= ' OR '
                }
            })
            if (domainAnswer[i + 1]) {
                rule+= ' OR '
            }
        })
        return [{value: rule}]
    }
}

const buildStreamRules = (appMode, domainAnswers) => {
    if (appMode === appModeManual) {
        return [{value: accountName}]
    }

    let rules = []
    if (appMode === appModeAuto) {
        domainAnswers.forEach((domainAnswer, i) => {
            domainAnswer.matchings.forEach((matching, j) => {
                let rule = ''
                matching.values.forEach((matchingValue, k) => {
                    rule+= matchingValue
                    // if (domainAnswer.matchings[k - 1]) {
                        rule+= ' '
                    // }
                })
               rules.push({value: rule})
            })
        })
        return rules
    }
}

const getStream = async (bearerClient) => {
    const stream = await bearerClient.v2.searchStream({
        'tweet.fields': ['referenced_tweets', 'author_id'],
        expansions: ['referenced_tweets.id'],
    });
    stream.autoReconnect = true;
    return stream;
}

const isTweetRetweet = (tweet) => {
    return tweet.data.referenced_tweets?.some(tweet => tweet.type === 'retweeted') ?? false
}

const isTweetSelfSent = (tweet, accountId) => {
    return tweet.data.author_id === accountId
}

const hasReferencedTweet = (tweet) => {
    return tweet.data.referenced_tweets
}

const replyToTweet = async (oAuthclient, tweet, content) => {
    await oAuthclient.v1.reply(content, tweet.data.id);
}

const getTweet = async (oAuthclient, tweetId) => {
    return await oAuthclient.v1.singleTweet(tweetId)
}

export {
    getAuthLink,
    getBearerClient,
    getOAuthClient,
    getStream,
    isTweetRetweet,
    replyToTweet,
    addStreamMatchings,
    hasReferencedTweet,
    getTweet,
    isTweetSelfSent,
    buildStreamRule,
    buildStreamRules
}