import {domainAnswers} from "./domainAnswers.js";
import {appModeAuto, appModeManual} from "./config.js";
import {getTweet} from "./tweeterApi.js";

const getAllMatchings = () => {
    let allMatchings = []
    domainAnswers.forEach(domainAnswer => {
        domainAnswer.matchings.forEach((matching) => {
            allMatchings.push(matching)
        })
    })

    return allMatchings
}

const getMatchingAnswer = (content) => {
    return domainAnswers.find(domainAnswer => {
        return domainAnswer.matchings.find(matching => {
            let checks = [];

            if (matching.isOrderMandatory) {
                const order = matching.values.map(matchingValue => getWordPosition(content, matchingValue))
                checks.push(isSorted(order))
            }

            if (matching.shouldBeNotQuoted) {
                const firstMatchingValueHasNoQuoteBefore = !content.substring(0, content.indexOf(matching.values[0])).includes('"')
                const lastMatchingValueHasNoQuoteAfter = !content.substring(content.indexOf(matching.values[matching.values.length - 1]) + 1).includes('"')

                checks.push(firstMatchingValueHasNoQuoteBefore && lastMatchingValueHasNoQuoteAfter)
            }

            checks.push(everyMatchingsAreIncluded(content, matching.values))

            return checks.every(check => check)
        })
    })
}

const everyMatchingsAreIncluded = (content, matchingValues) => matchingValues.every(matching => content.includes(matching))

const isSorted = (array) => {
    let second_index;
    for (let first_index = 0; first_index < array.length; first_index++) {
        second_index = first_index + 1;
        if (array[second_index] - array[first_index] < 0) return false;
    }
    return true;
}

const getWordPosition = (sentence, word) => sentence.split(' ').indexOf(word)


const getContentToAnalyze = async (appMode, tweet, oAuthClient) => {
    switch (appMode) {
        case appModeManual:
            const originalTweet = await getTweet(oAuthClient, tweet.data.referenced_tweets[0].id)
            return originalTweet.full_text
        case appModeAuto:
            return tweet.data.text
    }
}


export {getAllMatchings, getMatchingAnswer, getContentToAnalyze}